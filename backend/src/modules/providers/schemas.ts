import { z } from 'zod';
import { ProviderCategory, ProviderStatus } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const createProviderSchema = z
  .object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters').max(150),
    category: z.nativeEnum(ProviderCategory),
    description: z.string().max(3000).optional(),
    phone: z.string().regex(PHONE_REGEX, 'Phone must be in E.164 format').optional(),
    whatsapp: z.string().regex(PHONE_REGEX, 'WhatsApp must be in E.164 format').optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    address: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
    languages: z.array(z.string().min(2).max(10)).default(['en']),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    logoUrl: z.string().url().optional(),
    coverUrl: z.string().url().optional(),
  })
  .strict();

export type CreateProviderInput = z.infer<typeof createProviderSchema>;

export const updateProviderSchema = createProviderSchema.partial();

export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;

export const listProvidersQuerySchema = paginationSchema
  .extend({
    category: z.nativeEnum(ProviderCategory).optional(),
    verified: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    status: z.nativeEnum(ProviderStatus).optional(),
    q: z.string().max(100).optional(),
    near: z
      .string()
      .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?(,\d+(\.\d+)?)?$/, 'Invalid near format (lat,lng,radiusKm)')
      .optional(),
    sort: z.enum(['rating', '-rating', 'created_at', '-created_at']).default('-created_at'),
  })
  .strict();

export type ListProvidersQuery = z.infer<typeof listProvidersQuerySchema>;

export const adminProviderActionSchema = z
  .object({
    reason: z.string().max(1000).optional(),
  })
  .strict();

export type AdminProviderActionInput = z.infer<typeof adminProviderActionSchema>;
