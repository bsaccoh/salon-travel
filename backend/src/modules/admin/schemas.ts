import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';
import { paginationSchema } from '../../common/pagination';

export const listUsersQuerySchema = paginationSchema
  .extend({
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    q: z.string().max(100).optional(),
  })
  .strict();

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userStatusActionSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();

export type UserStatusActionInput = z.infer<typeof userStatusActionSchema>;
