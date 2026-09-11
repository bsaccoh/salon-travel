import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus, VerificationPurpose } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  ARGON2_CONFIG,
  REFRESH_TOKEN_TTL_DAYS,
  VERIFICATION_CODE_LENGTH,
  VERIFICATION_CODE_TTL_MINUTES,
} from '../../config/constants';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { authRepository, AuthRepository } from './auth.repository';
import { AuthResponseData, AuthTokens, toUserDto } from './auth.types';
import { RegisterInput, LoginInput, ResetPasswordInput, UpdateProfileInput } from './auth.validation';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('auth-service');

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  // ── Cryptographic Helpers ──────────────────────────────

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: ARGON2_CONFIG.memoryCost,
      timeCost: ARGON2_CONFIG.timeCost,
      parallelism: ARGON2_CONFIG.parallelism,
    });
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch (err) {
      log.warn({ err }, 'Argon2 verification failed unexpectedly');
      return false;
    }
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateOpaqueToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateNumericCode(length = VERIFICATION_CODE_LENGTH): string {
    // Generate secure random digits
    const digits = '0123456789';
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits[bytes[i] % 10];
    }
    return result;
  }

  createAccessToken(userId: string, role: string, sessionId: string): string {
    return jwt.sign(
      {
        sub: userId,
        role,
        jti: sessionId,
      },
      env.JWT_SIGNING_KEY,
      {
        expiresIn: `${ACCESS_TOKEN_TTL_SECONDS}s`,
      },
    );
  }

  // ── Registration ────────────────────────────────────────

  async register(
    input: RegisterInput,
    context: { ipAddress?: string; userAgent?: string; requestId?: string },
  ): Promise<{ authData: AuthResponseData; verificationCode: string }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check email uniqueness
    const existing = await this.repo.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await this.hashPassword(input.password);
    const verificationCode = this.generateNumericCode();
    const verificationCodeHash = this.hashToken(verificationCode);

    const refreshToken = this.generateOpaqueToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const codeExpiry = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);

    // Atomic transaction for registration
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await this.repo.createUser(
        {
          email: normalizedEmail,
          fullName: input.fullName.trim(),
          phone: input.phone || null,
          passwordHash,
          role: input.role,
          locale: input.locale || 'en-SL',
          status: UserStatus.active,
        },
        tx,
      );

      // 2. If traveler, create traveler profile stub
      if (user.role === UserRole.traveler) {
        await tx.travelerProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      // 3. Create initial refresh session
      const session = await this.repo.createRefreshSession(
        {
          userId: user.id,
          tokenHash: refreshTokenHash,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          expiresAt: refreshExpiry,
        },
        tx,
      );

      // 4. Create email verification code
      await this.repo.createVerificationCode(
        {
          userId: user.id,
          purpose: VerificationPurpose.email_verify,
          codeHash: verificationCodeHash,
          expiresAt: codeExpiry,
        },
        tx,
      );

      // 5. Create audit log
      await auditService.logInTransaction(
        tx,
        {
          actorId: user.id,
          actorRole: user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'USER_REGISTERED',
          resource: 'user',
          resourceId: user.id,
          metadata: { email: user.email, role: user.role },
        },
      );

      return { user, session };
    });

    const accessToken = this.createAccessToken(result.user.id, result.user.role, result.session.id);

    const authData: AuthResponseData = {
      user: toUserDto(result.user),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    };

    return { authData, verificationCode };
  }

  // ── Login ───────────────────────────────────────────────

  async login(
    input: LoginInput,
    context: { ipAddress?: string; userAgent?: string; requestId?: string },
  ): Promise<AuthResponseData> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.repo.findUserByEmail(normalizedEmail);

    const auditCtx: AuditContext = {
      actorId: user?.id,
      actorRole: user?.role,
      requestId: context.requestId,
      ipAddress: context.ipAddress,
    };

    if (!user) {
      await auditService.log(auditCtx, {
        action: 'LOGIN_FAILED',
        resource: 'user',
        metadata: { email: normalizedEmail, reason: 'user_not_found' },
      });
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status === UserStatus.suspended) {
      await auditService.log(auditCtx, {
        action: 'LOGIN_BLOCKED_SUSPENDED',
        resource: 'user',
        resourceId: user.id,
        metadata: { email: normalizedEmail },
      });
      throw new AuthorizationError('Account is suspended. Please contact support.');
    }

    const isValid = await this.verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      await auditService.log(auditCtx, {
        action: 'LOGIN_FAILED',
        resource: 'user',
        resourceId: user.id,
        metadata: { email: normalizedEmail, reason: 'invalid_password' },
      });
      throw new AuthenticationError('Invalid email or password');
    }

    const refreshToken = this.generateOpaqueToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const session = await prisma.$transaction(async (tx) => {
      const createdSession = await this.repo.createRefreshSession(
        {
          userId: user.id,
          tokenHash: refreshTokenHash,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          expiresAt: refreshExpiry,
        },
        tx,
      );

      await auditService.logInTransaction(
        tx,
        {
          actorId: user.id,
          actorRole: user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'LOGIN_SUCCESS',
          resource: 'user',
          resourceId: user.id,
          metadata: { sessionId: createdSession.id },
        },
      );

      return createdSession;
    });

    const accessToken = this.createAccessToken(user.id, user.role, session.id);

    return {
      user: toUserDto(user),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    };
  }

  // ── Refresh Token Rotation & Theft Detection ────────────

  async refresh(
    refreshToken: string,
    context: { ipAddress?: string; userAgent?: string; requestId?: string },
  ): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.repo.findRefreshSessionByTokenHash(tokenHash);

    if (!session) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Check if session was already revoked (Theft / Reuse detection)
    if (session.revokedAt !== null) {
      log.warn(
        { userId: session.userId, sessionId: session.id },
        'SECURITY ALERT: Revoked refresh token reuse detected! Revoking all user sessions.',
      );

      // Security action: revoke all sessions belonging to this user
      await this.repo.revokeAllUserSessions(session.userId);

      await auditService.log(
        {
          actorId: session.userId,
          actorRole: session.user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'REFRESH_TOKEN_THEFT_DETECTED',
          resource: 'refresh_session',
          resourceId: session.id,
          metadata: {
            revokedAt: session.revokedAt,
            actionTaken: 'all_sessions_revoked',
          },
        },
      );

      throw new AuthenticationError(
        'Invalid refresh token. All active sessions have been terminated for security.',
      );
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      throw new AuthenticationError('Refresh token has expired. Please log in again.');
    }

    if (session.user.status === UserStatus.suspended) {
      throw new AuthorizationError('Account is suspended');
    }

    // Token rotation: Revoke old session and issue new pair
    const newRefreshToken = this.generateOpaqueToken();
    const newRefreshTokenHash = this.hashToken(newRefreshToken);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const newSession = await prisma.$transaction(async (tx) => {
      // 1. Revoke current session
      await this.repo.revokeRefreshSession(session.id, tx);

      // 2. Create new session
      const createdSession = await this.repo.createRefreshSession(
        {
          userId: session.userId,
          tokenHash: newRefreshTokenHash,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          expiresAt: refreshExpiry,
        },
        tx,
      );

      return createdSession;
    });

    const newAccessToken = this.createAccessToken(
      session.user.id,
      session.user.role,
      newSession.id,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  // ── Logout ──────────────────────────────────────────────

  async logout(
    refreshToken: string | undefined,
    sessionId: string | undefined,
    context: { actorId?: string; actorRole?: string; requestId?: string; ipAddress?: string },
  ): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      const session = await this.repo.findRefreshSessionByTokenHash(tokenHash);
      if (session && !session.revokedAt) {
        await this.repo.revokeRefreshSession(session.id);
      }
    } else if (sessionId) {
      await this.repo.revokeRefreshSession(sessionId);
    }

    if (context.actorId) {
      await auditService.log(
        {
          actorId: context.actorId,
          actorRole: context.actorRole,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'LOGOUT',
          resource: 'user',
          resourceId: context.actorId,
        },
      );
    }
  }

  // ── Forgot Password ─────────────────────────────────────

  async forgotPassword(
    email: string,
    context: { ipAddress?: string; requestId?: string },
  ): Promise<{ code?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repo.findUserByEmail(normalizedEmail);

    // If user does not exist, return silently (204 No Content at controller level)
    if (!user || user.status === UserStatus.suspended) {
      return {};
    }

    const code = this.generateNumericCode();
    const codeHash = this.hashToken(code);
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      // Invalidate previous password_reset codes
      await this.repo.invalidatePreviousVerificationCodes(
        user.id,
        VerificationPurpose.password_reset,
        tx,
      );

      // Create new verification code
      await this.repo.createVerificationCode(
        {
          userId: user.id,
          purpose: VerificationPurpose.password_reset,
          codeHash,
          expiresAt,
        },
        tx,
      );

      await auditService.logInTransaction(
        tx,
        {
          actorId: user.id,
          actorRole: user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'PASSWORD_RESET_REQUESTED',
          resource: 'user',
          resourceId: user.id,
        },
      );
    });

    return { code };
  }

  // ── Reset Password ──────────────────────────────────────

  async resetPassword(
    input: ResetPasswordInput,
    context: { ipAddress?: string; requestId?: string },
  ): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.repo.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new ValidationError('Invalid email or verification code');
    }

    const codeHash = this.hashToken(input.code);
    const validCode = await this.repo.findValidVerificationCode(
      user.id,
      VerificationPurpose.password_reset,
      codeHash,
    );

    if (!validCode) {
      throw new ValidationError('Invalid or expired verification code');
    }

    const newPasswordHash = await this.hashPassword(input.newPassword);

    await prisma.$transaction(async (tx) => {
      // 1. Mark verification code consumed
      await this.repo.markVerificationCodeConsumed(validCode.id, tx);

      // 2. Update user password
      await this.repo.updateUser(user.id, { passwordHash: newPasswordHash }, tx);

      // 3. Revoke all active sessions for security
      await this.repo.revokeAllUserSessions(user.id, tx);

      // 4. Record audit log
      await auditService.logInTransaction(
        tx,
        {
          actorId: user.id,
          actorRole: user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'PASSWORD_RESET_COMPLETED',
          resource: 'user',
          resourceId: user.id,
        },
      );
    });
  }

  // ── Email Verification: Send ────────────────────────────

  async sendEmailVerification(
    userId: string,
    context: { ipAddress?: string; requestId?: string },
  ): Promise<{ code: string }> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.emailVerifiedAt) {
      throw new ConflictError('Email is already verified', 'EMAIL_ALREADY_VERIFIED');
    }

    const code = this.generateNumericCode();
    const codeHash = this.hashToken(code);
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await this.repo.invalidatePreviousVerificationCodes(
        user.id,
        VerificationPurpose.email_verify,
        tx,
      );

      await this.repo.createVerificationCode(
        {
          userId: user.id,
          purpose: VerificationPurpose.email_verify,
          codeHash,
          expiresAt,
        },
        tx,
      );

      await auditService.logInTransaction(
        tx,
        {
          actorId: user.id,
          actorRole: user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'EMAIL_VERIFICATION_SENT',
          resource: 'user',
          resourceId: user.id,
        },
      );
    });

    return { code };
  }

  // ── Email Verification: Confirm ─────────────────────────

  async confirmEmailVerification(
    email: string,
    code: string,
    context: { ipAddress?: string; requestId?: string },
  ): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repo.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new ValidationError('Invalid email or verification code');
    }

    if (user.emailVerifiedAt) {
      return; // Already verified, treat as idempotent success
    }

    const codeHash = this.hashToken(code);
    const validCode = await this.repo.findValidVerificationCode(
      user.id,
      VerificationPurpose.email_verify,
      codeHash,
    );

    if (!validCode) {
      throw new ValidationError('Invalid or expired verification code');
    }

    await prisma.$transaction(async (tx) => {
      await this.repo.markVerificationCodeConsumed(validCode.id, tx);

      await this.repo.updateUser(user.id, { emailVerifiedAt: new Date() }, tx);

      await auditService.logInTransaction(
        tx,
        {
          actorId: user.id,
          actorRole: user.role,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
        },
        {
          action: 'EMAIL_VERIFIED',
          resource: 'user',
          resourceId: user.id,
        },
      );
    });
  }

  // ── Profile (Me) ────────────────────────────────────────

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        travelerProfile: true,
        provider: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      ...toUserDto(user),
      travelerProfile: user.travelerProfile,
      provider: user.provider
        ? {
            id: user.provider.id,
            businessName: user.provider.businessName,
            category: user.provider.category,
            status: user.provider.status,
            verificationStatus: user.provider.verificationStatus,
          }
        : null,
    };
  }

  async updateMe(userId: string, input: UpdateProfileInput, context: AuditContext) {
    const updated = await this.repo.updateUser(userId, {
      ...(input.fullName ? { fullName: input.fullName.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.locale ? { locale: input.locale } : {}),
    });

    await auditService.log(context, {
      action: 'USER_PROFILE_UPDATED',
      resource: 'user',
      resourceId: userId,
      metadata: { fields: Object.keys(input) },
    });

    return toUserDto(updated);
  }
}

export const authService = new AuthService();
