import { z } from 'zod';
import { paginationSchema } from '../../common/pagination';

export const createReviewSchema = z
  .object({
    bookingId: z.string().uuid('Invalid booking ID'),
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    title: z.string().max(150).optional(),
    content: z
      .string()
      .min(10, 'Review content must be at least 10 characters')
      .max(2000, 'Review content must not exceed 2000 characters'),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(150).optional().nullable(),
    content: z
      .string()
      .min(10, 'Review content must be at least 10 characters')
      .max(2000, 'Review content must not exceed 2000 characters')
      .optional(),
  })
  .strict();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const moderateReviewSchema = z
  .object({
    status: z.enum(['published', 'hidden'] as const),
    notes: z.string().max(500).optional(),
  })
  .strict();

export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;

export const listReviewsQuerySchema = paginationSchema.extend({});

export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
