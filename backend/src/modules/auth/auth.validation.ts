import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Phone E.164 regex (e.g. +23276123456)
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

// Password policy: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address').max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone: z
      .string()
      .regex(PHONE_REGEX, 'Phone must be in E.164 format (e.g. +23276000001)')
      .optional(),
    role: z.nativeEnum(UserRole).default(UserRole.traveler),
    locale: z.string().default('en-SL'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z
  .object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })
  .strict();

export type RefreshInput = z.infer<typeof refreshSchema>;

export const forgotPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    code: z
      .string()
      .length(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Code must be numeric'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
  })
  .strict();

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const sendEmailVerificationSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
  })
  .strict();

export type SendEmailVerificationInput = z.infer<typeof sendEmailVerificationSchema>;

export const confirmEmailVerificationSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    code: z
      .string()
      .length(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Code must be numeric'),
  })
  .strict();

export type ConfirmEmailVerificationInput = z.infer<typeof confirmEmailVerificationSchema>;

export const updateProfileSchema = z
  .object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().regex(PHONE_REGEX, 'Phone must be in E.164 format').optional().nullable(),
    locale: z.string().max(10).optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
