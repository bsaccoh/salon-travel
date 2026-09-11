import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { UserRole, UserStatus, VerificationPurpose } from '@prisma/client';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  ValidationError,
} from '../../src/common/errors';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

// Mock audit service so tests don't require database for audit logging
jest.mock('../../src/modules/audit', () => ({
  auditService: {
    log: jest.fn().mockResolvedValue(undefined),
    logInTransaction: jest.fn().mockResolvedValue(undefined),
  },
  AuditService: {
    contextFromRequest: jest.fn().mockReturnValue({}),
  },
}));

// Mock Prisma client transactions
jest.mock('../../src/config/database', () => {
  const mPrisma: Record<string, any> = {
    $transaction: jest.fn(async (callback: (tx: any) => Promise<any>): Promise<any> => {
      return callback(mPrisma);
    }),
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    travelerProfile: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
    refreshSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerification: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };
  return { prisma: mPrisma };
});

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let mockRepo: jest.Mocked<AuthRepository>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'traveler@test.com',
    fullName: 'Test Traveler',
    passwordHash: '',
    phone: '+23276123456',
    role: UserRole.traveler,
    status: UserStatus.active,
    locale: 'en-SL',
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  beforeEach(async () => {
    mockRepo = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      createRefreshSession: jest.fn(),
      findRefreshSessionByTokenHash: jest.fn(),
      revokeRefreshSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
      createVerificationCode: jest.fn(),
      findValidVerificationCode: jest.fn(),
      markVerificationCodeConsumed: jest.fn(),
      invalidatePreviousVerificationCodes: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    authService = new AuthService(mockRepo);
    mockUser.passwordHash = await authService.hashPassword('SecurePass123!');
  });

  describe('Password Hashing (Argon2id)', () => {
    it('should hash and verify passwords correctly using Argon2id', async () => {
      const hash = await authService.hashPassword('MySecretPassword123!');
      expect(hash).toContain('$argon2id$');

      const isValid = await authService.verifyPassword(hash, 'MySecretPassword123!');
      expect(isValid).toBe(true);

      const isInvalid = await authService.verifyPassword(hash, 'WrongPassword!');
      expect(isInvalid).toBe(false);
    });
  });

  describe('Registration', () => {
    it('should register a new traveler, create refresh session, verification code, and issue tokens', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      mockRepo.createUser.mockResolvedValue(mockUser);
      mockRepo.createRefreshSession.mockResolvedValue({
        id: 'session-uuid-1',
        userId: mockUser.id,
        tokenHash: 'hash',
        userAgent: 'test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      });
      mockRepo.createVerificationCode.mockResolvedValue({
        id: 'code-uuid-1',
        userId: mockUser.id,
        purpose: VerificationPurpose.email_verify,
        codeHash: 'hash',
        expiresAt: new Date(),
        consumedAt: null,
        createdAt: new Date(),
      });

      const result = await authService.register(
        {
          email: 'traveler@test.com',
          password: 'SecurePassword123!',
          fullName: 'Test Traveler',
          phone: '+23276123456',
          role: UserRole.traveler,
          locale: 'en-SL',
        },
        { ipAddress: '127.0.0.1', userAgent: 'test', requestId: 'req-1' },
      );

      expect(result.authData.user.email).toBe('traveler@test.com');
      expect(result.authData.tokens.accessToken).toBeDefined();
      expect(result.authData.tokens.refreshToken).toBeDefined();
      expect(result.authData.tokens.tokenType).toBe('Bearer');
      expect(result.verificationCode).toMatch(/^\d{6}$/);

      // Verify JWT claims
      const decoded = jwt.verify(result.authData.tokens.accessToken, env.JWT_SIGNING_KEY) as any;
      expect(decoded.sub).toBe(mockUser.id);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.jti).toBe('session-uuid-1');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register(
          {
            email: 'traveler@test.com',
            password: 'SecurePassword123!',
            fullName: 'Test Traveler',
            role: UserRole.traveler,
            locale: 'en-SL',
          },
          {},
        ),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('Login', () => {
    it('should successfully log in with valid credentials', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      mockRepo.createRefreshSession.mockResolvedValue({
        id: 'session-uuid-2',
        userId: mockUser.id,
        tokenHash: 'hash-value',
        userAgent: null,
        ipAddress: null,
        expiresAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      });

      const result = await authService.login(
        { email: 'traveler@test.com', password: 'SecurePass123!' },
        { ipAddress: '127.0.0.1' },
      );

      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login({ email: 'traveler@test.com', password: 'WrongPassword123!' }, {}),
      ).rejects.toThrow(AuthenticationError);
    });

    it('should fail when user does not exist', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@test.com', password: 'Password123!' }, {}),
      ).rejects.toThrow(AuthenticationError);
    });

    it('should reject login for suspended user', async () => {
      mockRepo.findUserByEmail.mockResolvedValue({
        ...mockUser,
        status: UserStatus.suspended,
      });

      await expect(
        authService.login({ email: 'traveler@test.com', password: 'SecurePass123!' }, {}),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('Refresh Token Rotation & Theft Detection', () => {
    it('should rotate refresh token and issue new token pair', async () => {
      const oldSession = {
        id: 'session-1',
        userId: mockUser.id,
        tokenHash: authService.hashToken('valid-refresh-token'),
        userAgent: 'test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 86400000), // 1 day in future
        revokedAt: null,
        createdAt: new Date(),
        user: mockUser,
      };

      mockRepo.findRefreshSessionByTokenHash.mockResolvedValue(oldSession);
      mockRepo.revokeRefreshSession.mockResolvedValue({ ...oldSession, revokedAt: new Date() });
      mockRepo.createRefreshSession.mockResolvedValue({
        id: 'session-2',
        userId: mockUser.id,
        tokenHash: 'new-hash',
        userAgent: 'test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 86400000 * 30),
        revokedAt: null,
        createdAt: new Date(),
      });

      const result = await authService.refresh('valid-refresh-token', {});

      expect(mockRepo.revokeRefreshSession).toHaveBeenCalledWith('session-1', expect.anything());
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe('valid-refresh-token');
    });

    it('should detect reuse of revoked token (token theft) and revoke all user sessions', async () => {
      const revokedSession = {
        id: 'session-revoked',
        userId: mockUser.id,
        tokenHash: authService.hashToken('stolen-refresh-token'),
        userAgent: 'test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: new Date(Date.now() - 3600000), // Revoked 1 hour ago
        createdAt: new Date(),
        user: mockUser,
      };

      mockRepo.findRefreshSessionByTokenHash.mockResolvedValue(revokedSession);
      mockRepo.revokeAllUserSessions.mockResolvedValue({ count: 3 });

      await expect(authService.refresh('stolen-refresh-token', {})).rejects.toThrow(
        AuthenticationError,
      );

      // Verify that all user sessions were revoked
      expect(mockRepo.revokeAllUserSessions).toHaveBeenCalledWith(mockUser.id);
    });

    it('should reject expired refresh token', async () => {
      const expiredSession = {
        id: 'session-expired',
        userId: mockUser.id,
        tokenHash: authService.hashToken('expired-token'),
        userAgent: 'test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
        revokedAt: null,
        createdAt: new Date(),
        user: mockUser,
      };

      mockRepo.findRefreshSessionByTokenHash.mockResolvedValue(expiredSession);

      await expect(authService.refresh('expired-token', {})).rejects.toThrow(AuthenticationError);
    });
  });

  describe('Password Reset', () => {
    it('forgotPassword should return empty object for unknown user (not reveal existence)', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);

      const result = await authService.forgotPassword('unknown@test.com', {});
      expect(result.code).toBeUndefined();
    });

    it('forgotPassword should generate verification code for existing user', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      mockRepo.invalidatePreviousVerificationCodes.mockResolvedValue({ count: 0 });
      mockRepo.createVerificationCode.mockResolvedValue({} as any);

      const result = await authService.forgotPassword('traveler@test.com', {});
      expect(result.code).toMatch(/^\d{6}$/);
    });

    it('resetPassword should verify code, update password, and revoke all active sessions', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      mockRepo.findValidVerificationCode.mockResolvedValue({
        id: 'code-1',
        userId: mockUser.id,
        purpose: VerificationPurpose.password_reset,
        codeHash: 'hash',
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: null,
        createdAt: new Date(),
      });
      mockRepo.markVerificationCodeConsumed.mockResolvedValue({} as any);
      mockRepo.updateUser.mockResolvedValue(mockUser);
      mockRepo.revokeAllUserSessions.mockResolvedValue({ count: 2 });

      await authService.resetPassword(
        {
          email: 'traveler@test.com',
          code: '123456',
          newPassword: 'NewSecurePassword123!',
        },
        {},
      );

      expect(mockRepo.markVerificationCodeConsumed).toHaveBeenCalledWith(
        'code-1',
        expect.anything(),
      );
      expect(mockRepo.updateUser).toHaveBeenCalled();
      expect(mockRepo.revokeAllUserSessions).toHaveBeenCalledWith(mockUser.id, expect.anything());
    });

    it('resetPassword should reject invalid verification code', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      mockRepo.findValidVerificationCode.mockResolvedValue(null);

      await expect(
        authService.resetPassword(
          {
            email: 'traveler@test.com',
            code: '999999',
            newPassword: 'NewSecurePassword123!',
          },
          {},
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Email Verification', () => {
    it('sendEmailVerification should generate 6-digit code', async () => {
      mockRepo.findUserById.mockResolvedValue(mockUser);
      mockRepo.invalidatePreviousVerificationCodes.mockResolvedValue({ count: 0 });
      mockRepo.createVerificationCode.mockResolvedValue({} as any);

      const result = await authService.sendEmailVerification(mockUser.id, {});
      expect(result.code).toMatch(/^\d{6}$/);
    });

    it('sendEmailVerification should reject if already verified', async () => {
      mockRepo.findUserById.mockResolvedValue({
        ...mockUser,
        emailVerifiedAt: new Date(),
      });

      await expect(authService.sendEmailVerification(mockUser.id, {})).rejects.toThrow(
        ConflictError,
      );
    });

    it('confirmEmailVerification should mark email as verified', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      mockRepo.findValidVerificationCode.mockResolvedValue({
        id: 'code-email-1',
        userId: mockUser.id,
        purpose: VerificationPurpose.email_verify,
        codeHash: 'hash',
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: null,
        createdAt: new Date(),
      });
      mockRepo.markVerificationCodeConsumed.mockResolvedValue({} as any);
      mockRepo.updateUser.mockResolvedValue({ ...mockUser, emailVerifiedAt: new Date() });

      await authService.confirmEmailVerification('traveler@test.com', '123456', {});

      expect(mockRepo.markVerificationCodeConsumed).toHaveBeenCalledWith(
        'code-email-1',
        expect.anything(),
      );
      expect(mockRepo.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        { emailVerifiedAt: expect.any(Date) },
        expect.anything(),
      );
    });
  });
});
