import { z } from 'zod';

export const VIDEO_MODELS = [
  'MiniMax-Hailuo-02',
  'MiniMax-Hailuo-2.3',
  'T2V-01',
  'I2V-01',
] as const;

// TODO(refine): verify exact field set against platform docs (api-reference URLs returned 404 during research).

export const VideoTextToVideoInputSchema = z.object({
  model: z.enum(VIDEO_MODELS).describe('Video generation model id'),
  prompt: z
    .string()
    .min(1)
    .max(2000)
    .describe('Text description of the desired video'),
  duration: z
    .union([z.literal(6), z.literal(10)])
    .optional()
    .describe('Target duration in seconds'),
  resolution: z
    .enum(['720p', '1080p'])
    .optional()
    .describe('Output resolution (model-dependent)'),
  prompt_optimizer: z.boolean().optional(),
  callback_url: z.string().url().optional(),
});
export type VideoTextToVideoInput = z.infer<typeof VideoTextToVideoInputSchema>;

export const VideoImageToVideoInputSchema = z.object({
  model: z.enum(VIDEO_MODELS).describe('Video generation model id'),
  prompt: z.string().min(1).max(2000).optional(),
  image_url: z
    .string()
    .url()
    .or(z.string().min(1))
    .describe('URL (or base64) of the input image'),
  duration: z.union([z.literal(6), z.literal(10)]).optional(),
  resolution: z.enum(['720p', '1080p']).optional(),
  prompt_optimizer: z.boolean().optional(),
  callback_url: z.string().url().optional(),
});
export type VideoImageToVideoInput = z.infer<typeof VideoImageToVideoInputSchema>;

export const VideoAgentQueryInputSchema = z.object({
  task_id: z.string().min(1).describe('task_id returned by video_text_to_video / video_image_to_video'),
});
export type VideoAgentQueryInput = z.infer<typeof VideoAgentQueryInputSchema>;

// Video template / agent task creation (template-based video generation).
export const VideoAgentCreateInputSchema = z.object({
  template_id: z.string().min(1).describe('Video template/agent identifier'),
  inputs: z
    .record(z.string(), z.string())
    .describe('Template-specific inputs as a string-keyed map (e.g. {character: "...", scene: "..."})'),
  callback_url: z.string().url().optional(),
});
export type VideoAgentCreateInput = z.infer<typeof VideoAgentCreateInputSchema>;
