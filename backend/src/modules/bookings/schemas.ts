import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

export const createBookingSchema = z
  .object({
    providerId: z.string().uuid('Invalid provider ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    scheduledDate: z.string().datetime({ message: 'scheduledDate must be an ISO 8601 date string' }),
    scheduledEndDate: z.string().datetime({ message: 'scheduledEndDate must be an ISO 8601 date string' }).optional(),
    guestCount: z.number().int().min(1, 'guestCount must be at least 1').max(100),
    specialRequests: z.string().max(1000).optional(),
  })
  .strict();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const bookingActionSchema = z
  .object({
    reason: z.string().max(1000).optional(),
  })
  .strict();

export type BookingActionInput = z.infer<typeof bookingActionSchema>;

export const listBookingsQuerySchema = paginationSchema
  .extend({
    status: z.nativeEnum(BookingStatus).optional(),
    upcoming: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    past: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
