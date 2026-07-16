import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { BaseResp } from '../../common/types/base-resp';
import { MinimaxClient } from '../../infrastructure/external-api/minimax/minimax.client';
import { MINIMAX_ENDPOINTS } from '../../infrastructure/external-api/minimax/minimax.constants';
import { formatToolResult, ToolResult } from '../../infrastructure/external-api/minimax/format-response';
import {
  ImageTextToImageInput,
  ImageTextToImageInputSchema,
  ImageToImageInput,
  ImageToImageInputSchema,
} from './image.schemas';

interface ImageGenerateResp {
  data?: {
    images?: { url?: string; b64?: string }[];
    image_urls?: string[];
  };
  task_id?: string;
  base_resp: BaseResp;
}

@Injectable()
export class ImageTools {
  constructor(private readonly client: MinimaxClient) {}

  @Tool({
    name: 'image_text_to_image',
    description:
      'Generate images from a text prompt. Returns image URLs (typically valid 24h).',
    parameters: ImageTextToImageInputSchema,
  })
  async textToImage(
    input: ImageTextToImageInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<ImageGenerateResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.IMAGE_GENERATION,
      body: {
        model: input.model,
        prompt: input.prompt,
        n: input.n,
        width: input.width,
        height: input.height,
        aspect_ratio: input.aspect_ratio,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        prompt_optimizer: input.prompt_optimizer,
        callback_url: input.callback_url,
      },
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      images: b.data?.images,
      image_urls: b.data?.image_urls,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'image_to_image',
    description:
      'Transform a reference image guided by an optional prompt. Returns image URLs.',
    parameters: ImageToImageInputSchema,
  })
  async imageToImage(
    input: ImageToImageInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<ImageGenerateResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.IMAGE_GENERATION,
      body: {
        model: input.model,
        prompt: input.prompt,
        image_url: input.image_url,
        strength: input.strength,
        n: input.n,
        aspect_ratio: input.aspect_ratio,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        callback_url: input.callback_url,
      },
      timeoutMs: 60_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      task_id: b.task_id,
      images: b.data?.images,
      image_urls: b.data?.image_urls,
      base_resp: b.base_resp,
    }));
  }
}
