import { z } from 'zod';

export const IMAGE_MODELS = [
  'MiniMax-Image-01',
  'image-01',
  'image-02',
  'sdxl',
] as const;

// TODO(refine): confirm exact field set against platform docs (api-reference URLs returned 404 during research).

export const ImageTextToImageInputSchema = z.object({
  model: z.enum(IMAGE_MODELS).describe('Image generation model id'),
  prompt: z.string().min(1).max(2000),
  n: z.number().int().min(1).max(4).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  aspect_ratio: z
    .enum(['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4'])
    .optional(),
  seed: z.number().int().optional(),
  guidance_scale: z.number().min(0).max(20).optional(),
  prompt_optimizer: z.boolean().optional(),
  callback_url: z.string().url().optional(),
});
export type ImageTextToImageInput = z.infer<typeof ImageTextToImageInputSchema>;

export const ImageToImageInputSchema = z.object({
  model: z.enum(IMAGE_MODELS).describe('Image generation model id'),
  prompt: z.string().min(1).max(2000).optional(),
  image_url: z
    .string()
    .min(1)
    .describe('Reference image URL or base64'),
  strength: z.number().min(0).max(1).optional(),
  n: z.number().int().min(1).max(4).optional(),
  aspect_ratio: z
    .enum(['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4'])
    .optional(),
  seed: z.number().int().optional(),
  guidance_scale: z.number().min(0).max(20).optional(),
  callback_url: z.string().url().optional(),
});
export type ImageToImageInput = z.infer<typeof ImageToImageInputSchema>;
