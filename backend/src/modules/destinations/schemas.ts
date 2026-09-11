import { z } from 'zod';
import { DestinationCategory } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

export const createDestinationSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    category: z.nativeEnum(DestinationCategory),
    description: z.string().max(5000).optional(),
    shortDescription: z.string().max(255).optional(),
    region: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    images: z.array(z.string().url()).default([]),
    highlights: z.array(z.string()).default([]),
    isFeatured: z.boolean().default(false),
  })
  .strict();

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;

export const updateDestinationSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    category: z.nativeEnum(DestinationCategory).optional(),
    description: z.string().max(5000).optional().nullable(),
    shortDescription: z.string().max(255).optional().nullable(),
    region: z.string().max(100).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    images: z.array(z.string().url()).optional(),
    highlights: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict();

export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;

export const listDestinationsQuerySchema = paginationSchema
  .extend({
    category: z.nativeEnum(DestinationCategory).optional(),
    featured: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    q: z.string().max(100).optional(),
    near: z
      .string()
      .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?(,\d+(\.\d+)?)?$/, 'Invalid near format (lat,lng,radiusKm)')
      .optional(),
    sort: z.enum(['name', '-name', 'created_at', '-created_at']).default('-created_at'),
  })
  .strict();

export type ListDestinationsQuery = z.infer<typeof listDestinationsQuerySchema>;
