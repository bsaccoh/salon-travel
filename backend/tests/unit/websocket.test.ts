import { authenticateSocket } from '../../src/websocket/auth';
import { RoomManager } from '../../src/websocket/rooms';
import { conversationRepository } from '../../src/modules/conversations/repository';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import { prisma } from '../../src/config/database';
import { UserRole, UserStatus } from '@prisma/client';

describe('WebSocket Layer (Unit)', () => {
  const validToken = jwt.sign(
    { sub: 'user-uuid-1', role: 'traveler', jti: 'sess-ws' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  describe('WebSocket Authentication Middleware', () => {
    it('should authenticate socket with valid token and active user', async () => {
      const mockSocket: any = {
        handshake: {
          auth: { token: validToken },
          headers: {},
        },
        data: {},
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-uuid-1',
        role: UserRole.traveler,
        status: UserStatus.active,
        email: 'traveler@example.com',
      } as any);

      const next = jest.fn();
      await authenticateSocket(mockSocket, next);

      expect(next).toHaveBeenCalledWith();
      expect(mockSocket.data.user.userId).toBe('user-uuid-1');
      expect(mockSocket.data.user.role).toBe('traveler');
    });

    it('should reject socket with missing token', async () => {
      const mockSocket: any = {
        handshake: {
          auth: {},
          headers: {},
        },
        data: {},
      };

      const next = jest.fn();
      await authenticateSocket(mockSocket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject socket for suspended user', async () => {
      const mockSocket: any = {
        handshake: {
          auth: { token: validToken },
          headers: {},
        },
        data: {},
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-uuid-1',
        role: UserRole.traveler,
        status: UserStatus.suspended,
        email: 'traveler@example.com',
      } as any);

      const next = jest.fn();
      await authenticateSocket(mockSocket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Room Authorization', () => {
    it('should allow participant to join conversation room', async () => {
      const mockSocket: any = {
        data: {
          user: { userId: 'traveler-user-1', role: UserRole.traveler },
        },
        join: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(conversationRepository, 'findById').mockResolvedValueOnce({
        id: 'conv-1',
        travelerId: 'traveler-user-1',
        conciergeId: null,
      } as any);

      const result = await RoomManager.joinConversationRoom(mockSocket, 'conv-1');

      expect(result).toBe(true);
      expect(mockSocket.join).toHaveBeenCalledWith('conv:conv-1');
    });

    it('should reject non-participant from joining conversation room', async () => {
      const mockSocket: any = {
        data: {
          user: { userId: 'unrelated-traveler', role: UserRole.traveler },
        },
        join: jest.fn(),
      };

      jest.spyOn(conversationRepository, 'findById').mockResolvedValueOnce({
        id: 'conv-1',
        travelerId: 'traveler-user-1',
        conciergeId: 'concierge-1',
      } as any);

      const result = await RoomManager.joinConversationRoom(mockSocket, 'conv-1');

      expect(result).toBe(false);
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });
});
