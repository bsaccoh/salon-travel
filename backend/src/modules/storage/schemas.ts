import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const directUploadSchema = z
  .object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().refine(
      (val) => ALLOWED_MIME_TYPES.includes(val as any),
      `Allowed file types are PDF, JPEG, PNG, and WebP`,
    ),
    base64Data: z.string().min(1, 'Base64 data is required'),
    folder: z.enum(['documents', 'services', 'avatars', 'general']).default('general'),
  })
  .strict();

export type DirectUploadInput = z.infer<typeof directUploadSchema>;

export const presignedUrlSchema = z
  .object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().refine(
      (val) => ALLOWED_MIME_TYPES.includes(val as any),
      `Allowed file types are PDF, JPEG, PNG, and WebP`,
    ),
    fileSize: z
      .number()
      .int()
      .positive()
      .max(MAX_FILE_SIZE_BYTES, 'File size exceeds maximum 10MB limit'),
    folder: z.enum(['documents', 'services', 'avatars', 'general']).default('general'),
  })
  .strict();

export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;
