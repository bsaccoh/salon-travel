import { prisma } from '../../config/database';
import { Conversation, Message, Prisma } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ConflictError } from '../../common/errors';
import { ListInboxQuery, ListMessagesQuery } from './schemas';

export class ConversationRepository {
  async findById(id: string, tx: Prisma.TransactionClient = prisma): Promise<Conversation | null> {
    return tx.conversation.findUnique({
      where: { id },
      include: {
        traveler: { select: { id: true, fullName: true, email: true, phone: true } },
        concierge: { select: { id: true, fullName: true, email: true } },
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            service: { select: { name: true } },
            provider: { select: { businessName: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findActiveByTraveler(travelerId: string, bookingId?: string): Promise<Conversation | null> {
    return prisma.conversation.findFirst({
      where: {
        travelerId,
        ...(bookingId ? { bookingId } : {}),
        isClosed: false,
      },
    });
  }

  async listForTraveler(travelerId: string, query: ListInboxQuery) {
    const { isClosed, limit } = query;

    const where: Prisma.ConversationWhereInput = {
      travelerId,
      ...(isClosed !== undefined ? { isClosed } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      ...paginationArgs,
      include: {
        concierge: { select: { id: true, fullName: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return paginateResults(items, limit);
  }

  async listInbox(query: ListInboxQuery, currentConciergeId?: string) {
    const { filter, isClosed, limit } = query;

    const where: Prisma.ConversationWhereInput = {
      ...(isClosed !== undefined ? { isClosed } : { isClosed: false }),
      ...(filter === 'unclaimed' ? { conciergeId: null } : {}),
      ...(filter === 'mine' && currentConciergeId ? { conciergeId: currentConciergeId } : {}),
      ...(filter === 'emergency' ? { isEmergency: true } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.conversation.findMany({
      where,
      orderBy: [
        { isEmergency: 'desc' },
        { updatedAt: 'desc' },
      ],
      ...paginationArgs,
      include: {
        traveler: { select: { id: true, fullName: true, email: true } },
        concierge: { select: { id: true, fullName: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return paginateResults(items, limit);
  }

  async create(
    data: Prisma.ConversationUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Conversation> {
    return tx.conversation.create({
      data,
    });
  }

  /**
   * Atomic first-write-wins self-assignment.
   */
  async claim(
    conversationId: string,
    conciergeId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Conversation> {
    const result = await tx.conversation.updateMany({
      where: {
        id: conversationId,
        conciergeId: null,
      },
      data: {
        conciergeId,
      },
    });

    if (result.count === 0) {
      throw new ConflictError(
        'This conversation has already been assigned to another concierge',
        'ALREADY_ASSIGNED',
      );
    }

    return tx.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: {
        concierge: { select: { id: true, fullName: true } },
      },
    });
  }

  async release(
    conversationId: string,
    conciergeId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Conversation> {
    const result = await tx.conversation.updateMany({
      where: {
        id: conversationId,
        conciergeId,
      },
      data: {
        conciergeId: null,
      },
    });

    if (result.count === 0) {
      throw new ConflictError(
        'Conversation is not assigned to this concierge',
        'NOT_ASSIGNED_TO_CALLER',
      );
    }

    return tx.conversation.findUniqueOrThrow({
      where: { id: conversationId },
    });
  }

  async adminReassign(
    conversationId: string,
    newConciergeId: string | null,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Conversation> {
    return tx.conversation.update({
      where: { id: conversationId },
      data: { conciergeId: newConciergeId },
      include: {
        concierge: { select: { id: true, fullName: true } },
      },
    });
  }

  async setEmergency(
    conversationId: string,
    isEmergency: boolean,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Conversation> {
    return tx.conversation.update({
      where: { id: conversationId },
      data: { isEmergency },
    });
  }

  // ── Messages ──────────────────────────────────────────

  async createMessage(
    data: Prisma.MessageUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Message> {
    const msg = await tx.message.create({
      data,
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
      },
    });

    // Touch conversation updatedAt timestamp
    await tx.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return msg;
  }

  async listMessages(conversationId: string, query: ListMessagesQuery) {
    const { limit } = query;
    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
      },
    });

    return paginateResults(items, limit);
  }

  async markMessagesRead(conversationId: string, readerUserId: string): Promise<void> {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: readerUserId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}

export const conversationRepository = new ConversationRepository();
