import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { BaseResp } from '../../common/types/base-resp';
import { MinimaxClient } from '../../infrastructure/external-api/minimax/minimax.client';
import { MINIMAX_ENDPOINTS } from '../../infrastructure/external-api/minimax/minimax.constants';
import { formatToolResult, ToolResult } from '../../infrastructure/external-api/minimax/format-response';
import {
  T2aHttpInput,
  T2aHttpInputSchema,
  T2aAsyncCreateInput,
  T2aAsyncCreateInputSchema,
  T2aAsyncQueryInput,
  T2aAsyncQueryInputSchema,
  VoiceCloneInput,
  VoiceCloneInputSchema,
} from './speech.schemas';

interface T2aV2Resp {
  data?: {
    audio?: string;
    audio_url?: string;
    subtitle_file?: string;
    status?: number;
  };
  trace_id?: string;
  extra_info?: Record<string, unknown>;
  base_resp: BaseResp;
}

interface T2aAsyncV2Resp {
  task_id?: string;
  task_token?: string;
  file_id?: number | string;
  usage_characters?: number;
  base_resp: BaseResp;
}

interface T2aAsyncQueryResp {
  task_id?: string | number;
  status?: 'success' | 'failed' | 'expired' | 'processing';
  file_id?: string | number;
  base_resp: BaseResp;
}

interface VoiceCloneResp {
  input_sensitive?: boolean;
  input_sensitive_type?: number;
  demo_audio?: string;
  extra_info?: Record<string, unknown>;
  base_resp: BaseResp;
}

@Injectable()
export class SpeechTools {
  constructor(private readonly client: MinimaxClient) {}

  @Tool({
    name: 'speech_t2a_http',
    description:
      'Synchronous text-to-speech synthesis (≤10,000 chars). Returns audio URL + metadata. Use output_format="url" to receive a 24h-valid URL.',
    parameters: T2aHttpInputSchema,
  })
  async t2aHttp(input: T2aHttpInput): Promise<ToolResult<Record<string, unknown>>> {
    const { voice_id, model, text, ...rest } = input;
    const body = {
      model,
      text,
      voice_setting: {
        voice_id,
        speed: rest.speed,
        vol: rest.vol,
        pitch: rest.pitch,
        emotion: rest.emotion,
        text_normalization: rest.text_normalization,
        latex_read: rest.latex_read,
      },
      audio_setting: {
        sample_rate: rest.sample_rate,
        bitrate: rest.bitrate,
        format: rest.format,
        channel: rest.channel,
        force_cbr: rest.force_cbr,
      },
      stream: rest.stream,
      stream_options: rest.stream ? { exclude_aggregated_audio: false } : undefined,
      pronunciation_dict: rest.pronunciation_dict,
      voice_modify: rest.voice_modify,
      language_boost: rest.language_boost,
      subtitle_enable: rest.subtitle_enable,
      subtitle_type: rest.subtitle_type,
      output_format: rest.output_format ?? 'url',
      aigc_watermark: rest.aigc_watermark,
    };

    const res = await this.client.request<T2aV2Resp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.T2A_HTTP,
      body,
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      trace_id: b.trace_id,
      audio_url: b.data?.audio_url,
      audio_format: b.extra_info?.['audio_format'],
      audio_length_ms: b.extra_info?.['audio_length'],
      audio_size_bytes: b.extra_info?.['audio_size'],
      sample_rate: b.extra_info?.['audio_sample_rate'],
      bitrate: b.extra_info?.['bitrate'],
      channel: b.extra_info?.['audio_channel'],
      usage_characters: b.extra_info?.['usage_characters'],
      word_count: b.extra_info?.['word_count'],
      subtitle_file: b.data?.subtitle_file,
      status: b.data?.status,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'speech_t2a_async_create',
    description:
      'Create an async long-text T2A task (up to 1M chars via text_file_id, or 50k via text). Returns a task_id to poll with speech_t2a_async_query.',
    parameters: T2aAsyncCreateInputSchema,
  })
  async t2aAsyncCreate(
    input: T2aAsyncCreateInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const { voice_id, model, text, text_file_id, ...rest } = input;
    const body: Record<string, unknown> = {
      model,
      voice_setting: {
        voice_id,
        speed: rest.speed,
        vol: rest.vol,
        pitch: rest.pitch,
        emotion: rest.emotion,
        english_normalization: rest.english_normalization,
        latex_read: rest.latex_read,
      },
      audio_setting: {
        sample_rate: rest.sample_rate,
        bitrate: rest.bitrate,
        format: rest.format,
        channel: rest.channel,
      },
      pronunciation_dict: rest.pronunciation_dict,
      language_boost: rest.language_boost,
      voice_modify: rest.voice_modify,
    };
    if (text !== undefined) body['text'] = text;
    else if (text_file_id !== undefined) body['text_file_id'] = text_file_id;
    else {
      return {
        ok: false,
        status_code: 2013,
        status_msg: 'Either text or text_file_id must be provided',
        http_status: 0,
      };
    }

    const res = await this.client.request<T2aAsyncV2Resp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.T2A_ASYNC_CREATE,
      body,
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      task_token: b.task_token,
      file_id: b.file_id,
      usage_characters: b.usage_characters,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'speech_t2a_async_query',
    description:
      'Poll an async T2A task created by speech_t2a_async_create. Returns status (success|failed|expired|processing) and a file_id on success.',
    parameters: T2aAsyncQueryInputSchema,
  })
  async t2aAsyncQuery(
    input: T2aAsyncQueryInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<T2aAsyncQueryResp>({
      method: 'GET',
      path: MINIMAX_ENDPOINTS.T2A_ASYNC_QUERY,
      query: { task_id: input.task_id },
      timeoutMs: 30_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      status: b.status,
      file_id: b.file_id,
      note:
        'When status=success, use files_retrieve with file_id to get the file metadata; the audio URL is valid 9 hours.',
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'speech_voice_clone',
    description:
      'Clone a voice from an uploaded file_id (purpose=voice_clone). Cloned voices must be used within 168 hours or they are auto-deleted. Returns a demo_audio preview URL.',
    parameters: VoiceCloneInputSchema,
  })
  async voiceClone(
    input: VoiceCloneInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const body = {
      file_id: input.file_id,
      voice_id: input.voice_id,
      text: input.text,
      model: input.model,
      language_boost: input.language_boost,
      text_validation: input.text_validation,
      accuracy: input.accuracy,
      need_noise_reduction: input.need_noise_reduction,
      need_volume_normalization: input.need_volume_normalization,
      aigc_watermark: input.aigc_watermark,
    };

    const res = await this.client.request<VoiceCloneResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.VOICE_CLONE,
      body,
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      voice_id: input.voice_id,
      demo_audio: b.demo_audio,
      input_sensitive: b.input_sensitive,
      input_sensitive_type: b.input_sensitive_type,
      extra_info: b.extra_info,
      retention_note:
        'Use this cloned voice_id in speech_t2a_http or speech_t2a_async_create within 168 hours, or it will be auto-deleted.',
      base_resp: b.base_resp,
    }));
  }
}
