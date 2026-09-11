import { z } from 'zod';
import { ServiceType } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

export const createServiceSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150),
    type: z.nativeEnum(ServiceType),
    description: z.string().max(3000).optional(),
    shortDescription: z.string().max(255).optional(),
    priceCents: z.number().int().min(0, 'Price must be a non-negative integer'),
    currency: z.string().default('SLL'),
    durationMinutes: z.number().int().positive().optional(),
    maxCapacity: z.number().int().positive().optional(),
    commissionRate: z.number().int().min(0).max(100).optional(),
    images: z.array(z.string().url()).default([]),
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial();

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export const listServicesQuerySchema = paginationSchema
  .extend({
    type: z.nativeEnum(ServiceType).optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
