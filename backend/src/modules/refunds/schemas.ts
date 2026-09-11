import { z } from 'zod';
import { RefundReason, RefundStatus } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

export const createRefundSchema = z
  .object({
    amountCents: z.number().int().positive('Refund amount must be a positive integer in cents'),
    reason: z.nativeEnum(RefundReason),
    notes: z.string().max(500).optional(),
  })
  .strict();

export type CreateRefundInput = z.infer<typeof createRefundSchema>;

export const listRefundsQuerySchema = paginationSchema
  .extend({
    status: z.nativeEnum(RefundStatus).optional(),
    bookingId: z.string().uuid().optional(),
  })
  .strict();

export type ListRefundsQuery = z.infer<typeof listRefundsQuerySchema>;
