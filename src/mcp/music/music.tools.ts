import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { BaseResp } from '../../common/types/base-resp';
import { MinimaxClient } from '../../infrastructure/external-api/minimax/minimax.client';
import { MINIMAX_ENDPOINTS } from '../../infrastructure/external-api/minimax/minimax.constants';
import { formatToolResult, ToolResult } from '../../infrastructure/external-api/minimax/format-response';
import { MusicGenerateInput, MusicGenerateInputSchema } from './music.schemas';

interface MusicGenerateResp {
  data?: {
    audio?: string;
    audio_url?: string;
    status?: number;
  };
  trace_id?: string;
  extra_info?: Record<string, unknown>;
  base_resp: BaseResp;
}

@Injectable()
export class MusicTools {
  constructor(private readonly client: MinimaxClient) {}

  @Tool({
    name: 'music_generate',
    description:
      'Generate music. Provide lyrics for vocal tracks; set is_instrumental=true for instrumental. music-cover* models require audio_url/audio_base64/cover_feature_id.',
    parameters: MusicGenerateInputSchema,
  })
  async generate(
    input: MusicGenerateInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<MusicGenerateResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.MUSIC_GENERATION,
      body: {
        model: input.model,
        prompt: input.prompt,
        lyrics: input.lyrics,
        audio_url: input.audio_url,
        audio_base64: input.audio_base64,
        cover_feature_id: input.cover_feature_id,
        is_instrumental: input.is_instrumental,
        lyrics_optimizer: input.lyrics_optimizer,
        stream: input.stream,
        output_format: input.output_format ?? 'url',
        audio_setting: input.audio_setting,
      },
      timeoutMs: 120_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      trace_id: b.trace_id,
      audio_url: b.data?.audio_url,
      audio_preview_hex: b.data?.audio,
      status: b.data?.status,
      duration_ms: b.extra_info?.['music_duration'],
      sample_rate: b.extra_info?.['music_sample_rate'],
      channel: b.extra_info?.['music_channel'],
      bitrate: b.extra_info?.['bitrate'],
      size_bytes: b.extra_info?.['music_size'],
      base_resp: b.base_resp,
    }));
  }
}
