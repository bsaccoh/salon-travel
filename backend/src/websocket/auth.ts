import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { UserRole, UserStatus } from '@prisma/client';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('ws-auth');

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      userId: string;
      role: UserRole;
      email?: string;
    };
  };
}

export async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
      socket.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication token required'));
    }

    const payload = jwt.verify(token, env.JWT_SIGNING_KEY) as {
      sub: string;
      role: UserRole;
      jti?: string;
    };

    // Verify user is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, email: true },
    });

    if (!user || user.status === UserStatus.suspended) {
      return next(new Error('Account suspended or user not found'));
    }

    socket.data.user = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    log.debug({ userId: user.id, role: user.role }, 'WebSocket client authenticated');
    next();
  } catch (err: any) {
    log.warn({ err: err.message }, 'WebSocket authentication failed');
    next(new Error('Invalid or expired authentication token'));
  }
}
