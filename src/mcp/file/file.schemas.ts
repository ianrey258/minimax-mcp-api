import { z } from 'zod';

export const FILE_PURPOSES = [
  'voice_clone',
  'document',
  'audio',
  'video',
  'image',
] as const;

// TODO(refine): confirm exact list/query params against platform docs.

const fileBaseSchema = z.object({
  file_id: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .describe('Numeric file_id returned by files_upload'),
});

export const FilesUploadInputSchema = z.object({
  purpose: z
    .enum(FILE_PURPOSES)
    .describe('What the file will be used for; affects validation rules'),
  /** Absolute path to the file on disk. */
  file_path: z
    .string()
    .min(1)
    .describe('Absolute filesystem path of the file to upload'),
  filename: z
    .string()
    .min(1)
    .optional()
    .describe('Override filename (defaults to basename of file_path)'),
});
export type FilesUploadInput = z.infer<typeof FilesUploadInputSchema>;

export const FilesListInputSchema = z.object({
  purpose: z.enum(FILE_PURPOSES).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  after: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
export type FilesListInput = z.infer<typeof FilesListInputSchema>;

export const FilesRetrieveInputSchema = fileBaseSchema;
export type FilesRetrieveInput = z.infer<typeof FilesRetrieveInputSchema>;

export const FilesRetrieveContentInputSchema = z.object({
  file_id: fileBaseSchema.shape.file_id,
  as_hex: z
    .boolean()
    .default(false)
    .describe('If true, encode the binary content as hex. Useful for small files.'),
});
export type FilesRetrieveContentInput = z.infer<typeof FilesRetrieveContentInputSchema>;

export const FilesDeleteInputSchema = fileBaseSchema;
export type FilesDeleteInput = z.infer<typeof FilesDeleteInputSchema>;
