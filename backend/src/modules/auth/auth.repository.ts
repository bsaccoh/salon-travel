import { prisma } from '../../config/database';
import {
  User,
  RefreshSession,
  EmailVerification,
  VerificationPurpose,
  Prisma,
} from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(
    email: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: {
        email: {
          equals: email.trim().toLowerCase(),
          mode: 'insensitive',
        },
      },
    });
  }

  async findUserById(id: string, tx: Prisma.TransactionClient = prisma): Promise<User | null> {
    return tx.user.findUnique({
      where: { id },
    });
  }

  async createUser(
    data: Prisma.UserCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<User> {
    return tx.user.create({
      data,
    });
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data,
    });
  }

  async createRefreshSession(
    data: {
      userId: string;
      tokenHash: string;
      userAgent?: string;
      ipAddress?: string;
      expiresAt: DateTimeOrDate;
    },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<RefreshSession> {
    return tx.refreshSession.create({
      data,
    });
  }

  async findRefreshSessionByTokenHash(
    tokenHash: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<(RefreshSession & { user: User }) | null> {
    return tx.refreshSession.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshSession(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<RefreshSession> {
    return tx.refreshSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Prisma.BatchPayload> {
    return tx.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async createVerificationCode(
    data: {
      userId: string;
      purpose: VerificationPurpose;
      codeHash: string;
      expiresAt: Date;
    },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<EmailVerification> {
    return tx.emailVerification.create({
      data,
    });
  }

  async findValidVerificationCode(
    userId: string,
    purpose: VerificationPurpose,
    codeHash: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<EmailVerification | null> {
    return tx.emailVerification.findFirst({
      where: {
        userId,
        purpose,
        codeHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markVerificationCodeConsumed(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<EmailVerification> {
    return tx.emailVerification.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async invalidatePreviousVerificationCodes(
    userId: string,
    purpose: VerificationPurpose,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Prisma.BatchPayload> {
    return tx.emailVerification.updateMany({
      where: {
        userId,
        purpose,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });
  }

  async deleteExpiredSessions(
    cutoffDate: Date = new Date(),
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Prisma.BatchPayload> {
    return tx.refreshSession.deleteMany({
      where: {
        expiresAt: { lt: cutoffDate },
      },
    });
  }

  async deleteExpiredVerifications(
    cutoffDate: Date = new Date(),
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Prisma.BatchPayload> {
    return tx.emailVerification.deleteMany({
      where: {
        expiresAt: { lt: cutoffDate },
      },
    });
  }
}

type DateTimeOrDate = Date;

export const authRepository = new AuthRepository();

