import { z } from 'zod';

export const SPEECH_MODELS = [
  'speech-2.8-hd',
  'speech-2.8-turbo',
  'speech-2.6-hd',
  'speech-2.6-turbo',
  'speech-02-hd',
  'speech-02-turbo',
  'speech-01-hd',
  'speech-01-turbo',
] as const;

export const SPEECH_EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'fearful',
  'disgusted',
  'surprised',
  'calm',
  'fluent',
  'whisper',
] as const;

export const AUDIO_FORMATS = [
  'mp3',
  'pcm',
  'flac',
  'wav',
  'pcmu_raw',
  'pcmu_wav',
  'opus',
] as const;

const pronunciationDictSchema = z
  .object({
    tone: z.array(z.string()).optional(),
  })
  .optional();

const voiceModifySchema = z
  .object({
    pitch: z.number().int().min(-100).max(100).optional(),
    intensity: z.number().int().min(-100).max(100).optional(),
    timbre: z.number().int().min(-100).max(100).optional(),
    sound_effects: z
      .enum(['spacious_echo', 'auditorium_echo', 'lofi_telephone', 'robotic'])
      .optional(),
  })
  .optional();

export const T2aHttpInputSchema = z.object({
  model: z.enum(SPEECH_MODELS).describe('T2A model identifier'),
  text: z
    .string()
    .max(10_000, 'text may not exceed 10,000 characters')
    .describe('Plain text or SSML up to 10,000 chars'),
  voice_id: z.string().min(1).describe('System or cloned voice id'),
  speed: z.number().min(0.5).max(2).optional(),
  vol: z.number().min(0).max(10).optional(),
  pitch: z.number().int().min(-12).max(12).optional(),
  emotion: z.enum(SPEECH_EMOTIONS).optional(),
  text_normalization: z.boolean().optional(),
  latex_read: z.boolean().optional(),
  sample_rate: z.number().int().positive().optional(),
  bitrate: z.number().int().optional(),
  format: z.enum(AUDIO_FORMATS).optional(),
  channel: z.union([z.literal(1), z.literal(2)]).optional(),
  force_cbr: z.boolean().optional(),
  language_boost: z
    .string()
    .optional()
    .describe('Language hint, e.g. "auto", "en", "zh"'),
  pronunciation_dict: pronunciationDictSchema,
  voice_modify: voiceModifySchema,
  subtitle_enable: z.boolean().optional(),
  subtitle_type: z.enum(['sentence', 'word', 'word_streaming']).optional(),
  output_format: z
    .enum(['url', 'hex'])
    .optional()
    .describe('Use "url" to receive a 24h-valid audio URL.'),
  aigc_watermark: z.boolean().optional(),
  stream: z.boolean().optional(),
});
export type T2aHttpInput = z.infer<typeof T2aHttpInputSchema>;

export const T2aAsyncCreateInputSchema = z.object({
  model: z.enum(SPEECH_MODELS).describe('T2A model identifier'),
  text: z.string().max(50_000).optional(),
  text_file_id: z.number().int().optional(),
  voice_id: z.string().min(1).describe('System or cloned voice id'),
  speed: z.number().min(0.5).max(2).optional(),
  vol: z.number().min(0).max(10).optional(),
  pitch: z.number().int().min(-12).max(12).optional(),
  emotion: z.enum(SPEECH_EMOTIONS).optional(),
  english_normalization: z.boolean().optional(),
  latex_read: z.boolean().optional(),
  sample_rate: z.number().int().positive().optional(),
  bitrate: z.number().int().optional(),
  format: z.enum(AUDIO_FORMATS).optional(),
  channel: z.union([z.literal(1), z.literal(2)]).optional(),
  pronunciation_dict: pronunciationDictSchema,
  language_boost: z.string().optional(),
  voice_modify: voiceModifySchema,
});
export type T2aAsyncCreateInput = z.infer<typeof T2aAsyncCreateInputSchema>;

export const T2aAsyncQueryInputSchema = z.object({
  task_id: z.string().min(1).describe('Returned by speech_t2a_async_create'),
});
export type T2aAsyncQueryInput = z.infer<typeof T2aAsyncQueryInputSchema>;

export const VoiceCloneInputSchema = z.object({
  file_id: z
    .number()
    .int()
    .describe('file_id from files_upload with purpose=voice_clone'),
  voice_id: z
    .string()
    .min(8)
    .max(256)
    .regex(/^[A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9]$/)
    .describe('Unique voice id, 8-256 chars; letter start; no trailing - or _'),
  text: z.string().max(1000).optional(),
  model: z.enum(SPEECH_MODELS).optional(),
  language_boost: z.string().optional(),
  text_validation: z.string().max(200).optional(),
  accuracy: z.number().min(0).max(1).optional(),
  need_noise_reduction: z.boolean().optional(),
  need_volume_normalization: z.boolean().optional(),
  aigc_watermark: z.boolean().optional(),
});
export type VoiceCloneInput = z.infer<typeof VoiceCloneInputSchema>;
