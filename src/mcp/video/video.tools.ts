import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { BaseResp } from '../../common/types/base-resp';
import { MinimaxClient } from '../../infrastructure/external-api/minimax/minimax.client';
import { MINIMAX_ENDPOINTS } from '../../infrastructure/external-api/minimax/minimax.constants';
import { formatToolResult, ToolResult } from '../../infrastructure/external-api/minimax/format-response';
import {
  VideoTextToVideoInput,
  VideoTextToVideoInputSchema,
  VideoImageToVideoInput,
  VideoImageToVideoInputSchema,
  VideoAgentQueryInput,
  VideoAgentQueryInputSchema,
  VideoAgentCreateInput,
  VideoAgentCreateInputSchema,
} from './video.schemas';

interface VideoCreateResp {
  task_id?: string;
  base_resp: BaseResp;
}

interface VideoQueryResp {
  task_id?: string;
  status?: 'Preparing' | 'Processing' | 'Success' | 'Fail';
  video_url?: string;
  base_resp: BaseResp;
}

@Injectable()
export class VideoTools {
  constructor(private readonly client: MinimaxClient) {}

  @Tool({
    name: 'video_text_to_video',
    description:
      'Generate a video from a text prompt. Returns a task_id — poll with video_agent_query.',
    parameters: VideoTextToVideoInputSchema,
  })
  async textToVideo(
    input: VideoTextToVideoInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<VideoCreateResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.VIDEO_GENERATION,
      body: {
        model: input.model,
        prompt: input.prompt,
        duration: input.duration,
        resolution: input.resolution,
        prompt_optimizer: input.prompt_optimizer,
        callback_url: input.callback_url,
      },
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'video_image_to_video',
    description:
      'Generate a video from an input image (and optional prompt). Returns a task_id — poll with video_agent_query.',
    parameters: VideoImageToVideoInputSchema,
  })
  async imageToVideo(
    input: VideoImageToVideoInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<VideoCreateResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.VIDEO_GENERATION,
      body: {
        model: input.model,
        prompt: input.prompt,
        image_url: input.image_url,
        duration: input.duration,
        resolution: input.resolution,
        prompt_optimizer: input.prompt_optimizer,
        callback_url: input.callback_url,
      },
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'video_agent_create',
    description:
      'Create a video template/agent task. Returns a task_id to poll with video_agent_query.',
    parameters: VideoAgentCreateInputSchema,
  })
  async agentCreate(
    input: VideoAgentCreateInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<VideoCreateResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.VIDEO_GENERATION,
      body: {
        template_id: input.template_id,
        inputs: input.inputs,
        callback_url: input.callback_url,
      },
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      template_id: input.template_id,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'video_agent_query',
    description:
      'Poll a video task. Returns status (Preparing|Processing|Success|Fail) and a video_url valid 9h on Success.',
    parameters: VideoAgentQueryInputSchema,
  })
  async agentQuery(
    input: VideoAgentQueryInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<VideoQueryResp>({
      method: 'GET',
      path: MINIMAX_ENDPOINTS.VIDEO_TEMPLATE_QUERY,
      query: { task_id: input.task_id },
      timeoutMs: 30_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      status: b.status,
      video_url: b.video_url,
      note:
        'When status=Success, video_url is valid for 9 hours. Download before it expires.',
      base_resp: b.base_resp,
    }));
  }
}
