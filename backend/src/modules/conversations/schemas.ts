import { z } from 'zod';
import { paginationSchema } from '../../common/pagination';

export const createConversationSchema = z
  .object({
    subject: z.string().max(150).optional(),
    bookingId: z.string().uuid('Invalid booking ID format').optional(),
    initialMessage: z.string().min(1).max(4000).optional(),
  })
  .strict();

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const listInboxQuerySchema = paginationSchema
  .extend({
    filter: z.enum(['unclaimed', 'mine', 'emergency', 'all']).default('all'),
    isClosed: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export type ListInboxQuery = z.infer<typeof listInboxQuerySchema>;

export const sendMessageSchema = z
  .object({
    content: z.string().min(1, 'Message content cannot be empty').max(4000, 'Message content must not exceed 4000 characters'),
    attachments: z.array(z.string().url()).default([]),
  })
  .strict();

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const assignConversationSchema = z
  .object({
    conciergeId: z.string().uuid('Invalid concierge ID format').optional(),
  })
  .strict();

export type AssignConversationInput = z.infer<typeof assignConversationSchema>;

export const emergencyActionSchema = z
  .object({
    notes: z.string().max(500).optional(),
  })
  .strict();

export type EmergencyActionInput = z.infer<typeof emergencyActionSchema>;

export const listMessagesQuerySchema = paginationSchema.extend({});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
