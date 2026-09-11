import { z } from 'zod';
import { DocumentType } from '@prisma/client';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const uploadDocumentSchema = z
  .object({
    type: z.nativeEnum(DocumentType),
    fileName: z.string().min(1).max(255),
    fileSize: z
      .number()
      .int()
      .positive()
      .max(MAX_DOCUMENT_SIZE_BYTES, 'File size exceeds maximum 10MB limit'),
    mimeType: z
      .string()
      .refine(
        (val) => ALLOWED_DOCUMENT_MIME_TYPES.includes(val),
        'Allowed file types are PDF, JPEG, and PNG',
      ),
    fileUrl: z.string().url('Invalid file URL'),
  })
  .strict();

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
