import { AuthenticatedSocket } from './auth';
import { conversationRepository } from '../modules/conversations/repository';
import { UserRole } from '@prisma/client';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('ws-rooms');

export class RoomManager {
  /**
   * Authorize and join a conversation room.
   */
  static async joinConversationRoom(
    socket: AuthenticatedSocket,
    conversationId: string,
  ): Promise<boolean> {
    const { userId, role } = socket.data.user;

    const conv = await conversationRepository.findById(conversationId);
    if (!conv) {
      log.warn({ userId, conversationId }, 'Room join failed: conversation not found');
      return false;
    }

    // Role-based room authorization
    const isParticipant =
      (role === UserRole.traveler && conv.travelerId === userId) ||
      (role === UserRole.concierge && (conv.conciergeId === userId || conv.conciergeId === null)) ||
      role === UserRole.admin;

    if (!isParticipant) {
      log.warn({ userId, role, conversationId }, 'Unauthorized attempt to join conversation room');
      return false;
    }

    const roomName = `conv:${conversationId}`;
    await socket.join(roomName);
    log.debug({ userId, roomName }, 'Socket joined conversation room');
    return true;
  }

  /**
   * Join personal and role-specific channels.
   */
  static async joinDefaultRooms(socket: AuthenticatedSocket): Promise<void> {
    const { userId, role } = socket.data.user;

    // 1. Personal user channel
    await socket.join(`user:${userId}`);

    // 2. Staff channel for concierges/admins
    if (role === UserRole.concierge || role === UserRole.admin) {
      await socket.join('staff:concierge');
    }
  }
}
