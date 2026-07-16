import { z } from 'zod';

export const MUSIC_MODELS = [
  'music-2.6',
  'music-cover',
  'music-2.6-free',
  'music-cover-free',
] as const;

const audioSettingSchema = z
  .object({
    sample_rate: z
      .union([z.literal(16000), z.literal(24000), z.literal(32000), z.literal(44100)])
      .optional(),
    bitrate: z
      .union([z.literal(32000), z.literal(64000), z.literal(128000), z.literal(256000)])
      .optional(),
    format: z.enum(['mp3', 'wav', 'pcm']).optional(),
  })
  .optional();

export const MusicGenerateInputSchema = z
  .object({
    model: z.enum(MUSIC_MODELS),
    prompt: z.string().min(1).max(2000).optional(),
    lyrics: z
      .string()
      .min(1)
      .max(3500)
      .optional()
      .describe('Song lyrics; supports structure tags like [Verse], [Chorus]'),
    audio_url: z.string().min(1).optional(),
    audio_base64: z.string().min(1).optional(),
    cover_feature_id: z.string().optional(),
    is_instrumental: z.boolean().optional(),
    lyrics_optimizer: z.boolean().optional(),
    stream: z.boolean().optional(),
    output_format: z.enum(['url', 'hex']).optional(),
    audio_setting: audioSettingSchema,
  })
  .superRefine((val, payload) => {
    if (
      val.model.startsWith('music-cover') &&
      !val.audio_url &&
      !val.audio_base64 &&
      !val.cover_feature_id
    ) {
      payload.issues.push({
        origin: 'custom',
        code: 'custom',
        path: ['audio_url'],
        input: val,
        message:
          'audio_url, audio_base64, or cover_feature_id is required for music-cover* models',
      });
    }
    if (val.is_instrumental && val.lyrics) {
      payload.issues.push({
        origin: 'custom',
        code: 'custom',
        path: ['lyrics'],
        input: val,
        message: 'lyrics must not be set when is_instrumental is true',
      });
    }
  });
export type MusicGenerateInput = z.infer<typeof MusicGenerateInputSchema>;
