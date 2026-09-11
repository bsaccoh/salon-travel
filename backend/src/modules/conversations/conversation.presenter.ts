import { Conversation, Message } from '@prisma/client';

export interface PresentedConversation {
  id: string;
  travelerId: string;
  conciergeId: string | null;
  bookingId: string | null;
  subject: string;
  isEmergency: boolean;
  isClosed: boolean;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  traveler?: any;
  concierge?: any;
  booking?: any;
  messages?: PresentedMessage[];
}

export interface PresentedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  sender?: any;
}

export function messagePresenter(m: Message | any): PresentedMessage {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    attachments: m.attachments || [],
    isRead: Boolean(m.isRead),
    readAt: m.readAt || null,
    createdAt: m.createdAt,
    ...(m.sender ? { sender: m.sender } : {}),
  };
}

export function messageListPresenter(items: (Message | any)[]): PresentedMessage[] {
  return items.map(messagePresenter);
}

export function conversationPresenter(c: Conversation | any): PresentedConversation {
  return {
    id: c.id,
    travelerId: c.travelerId,
    conciergeId: c.conciergeId || null,
    bookingId: c.bookingId || null,
    subject: c.subject,
    isEmergency: Boolean(c.isEmergency),
    isClosed: Boolean(c.isClosed),
    closedAt: c.closedAt || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    ...(c.traveler ? { traveler: c.traveler } : {}),
    ...(c.concierge ? { concierge: c.concierge } : {}),
    ...(c.booking ? { booking: c.booking } : {}),
    ...(c.messages ? { messages: c.messages.map(messagePresenter) } : {}),
  };
}

export function conversationListPresenter(items: (Conversation | any)[]): PresentedConversation[] {
  return items.map(conversationPresenter);
}
