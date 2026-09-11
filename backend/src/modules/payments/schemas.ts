import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

export const createPaymentIntentSchema = z
  .object({
    bookingId: z.string().uuid('Invalid booking ID format'),
  })
  .strict();

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export const listPaymentsQuerySchema = paginationSchema
  .extend({
    status: z.nativeEnum(PaymentStatus).optional(),
    bookingId: z.string().uuid().optional(),
  })
  .strict();

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
