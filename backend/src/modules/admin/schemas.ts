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

export const createUserSchema = z
  .object({
    email: z.string().email(),
    fullName: z.string().min(2).max(100),
    password: z.string().min(8).max(100),
    role: z.nativeEnum(UserRole).default(UserRole.traveler),
    phone: z.string().optional(),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
