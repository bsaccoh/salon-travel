import request from 'supertest';
import { createApp } from '../../src/app';
import { conversationService } from '../../src/modules/conversations/service';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

// Mock Redis
jest.mock('../../src/config/redis', () => {
  const mRedis = {
    ping: jest.fn().mockResolvedValue('PONG'),
    multi: jest.fn().mockReturnValue({
      zremrangebyscore: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, 1], [null, 1], [null, 1], [null, 1]]),
    }),
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    quit: jest.fn().mockResolvedValue('OK'),
  };
  return {
    getRedis: jest.fn().mockReturnValue(mRedis),
    createRedisClient: jest.fn().mockReturnValue(mRedis),
    disconnectRedis: jest.fn().mockResolvedValue(undefined),
  };
});

describe('Conversations & Messaging APIs (/v1/conversations)', () => {
  const app = createApp();

  const travelerToken = jwt.sign(
    { sub: 'traveler-user-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const conciergeToken = jwt.sign(
    { sub: 'concierge-user-1', role: 'concierge', jti: 'sess-concierge' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockConversation = {
    id: 'conv-uuid-1',
    travelerId: 'traveler-user-1',
    conciergeId: null,
    bookingId: 'booking-uuid-1',
    subject: 'Inquiry regarding Airport Pickup',
    isEmergency: false,
    isClosed: false,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    traveler: { id: 'traveler-user-1', fullName: 'Alex Johnson', email: 'alex@example.com' },
    concierge: null,
    messages: [],
  };

  const mockMessage = {
    id: 'msg-uuid-1',
    conversationId: 'conv-uuid-1',
    senderId: 'traveler-user-1',
    content: 'Hello, what time does the boat leave tomorrow?',
    attachments: [],
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    sender: { id: 'traveler-user-1', fullName: 'Alex Johnson', role: 'traveler' as const },
  };

  describe('POST /v1/conversations (Create Conversation)', () => {
    it('should create conversation thread for traveler and return 201', async () => {
      jest.spyOn(conversationService, 'createConversation').mockResolvedValueOnce(mockConversation);

      const res = await request(app)
        .post('/v1/conversations')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          subject: 'Inquiry regarding Airport Pickup',
          bookingId: '550e8400-e29b-41d4-a716-446655440000',
          initialMessage: 'Hello, what time does the boat leave tomorrow?',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subject).toBe('Inquiry regarding Airport Pickup');
    });
  });

  describe('GET /v1/conversations/mine (Traveler Conversations)', () => {
    it('should list conversations for authenticated traveler', async () => {
      jest.spyOn(conversationService, 'getMine').mockResolvedValueOnce({
        data: [mockConversation],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/conversations/mine')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /v1/conversations/inbox (Concierge Inbox)', () => {
    it('should list inbox threads for concierge', async () => {
      jest.spyOn(conversationService, 'getInbox').mockResolvedValueOnce({
        data: [mockConversation],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/conversations/inbox?filter=unclaimed')
        .set('Authorization', `Bearer ${conciergeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should reject traveler from accessing staff inbox with 403', async () => {
      const res = await request(app)
        .get('/v1/conversations/inbox')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Conversation Assignment & Emergency Lifecycle', () => {
    it('POST /v1/conversations/:id/assign should allow concierge to self-claim', async () => {
      jest.spyOn(conversationService, 'claimConversation').mockResolvedValueOnce({
        ...mockConversation,
        conciergeId: 'concierge-user-1',
      });

      const res = await request(app)
        .post('/v1/conversations/conv-uuid-1/assign')
        .set('Authorization', `Bearer ${conciergeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conciergeId).toBe('concierge-user-1');
    });

    it('POST /v1/conversations/:id/release should allow concierge to release thread', async () => {
      jest.spyOn(conversationService, 'releaseConversation').mockResolvedValueOnce(mockConversation);

      const res = await request(app)
        .post('/v1/conversations/conv-uuid-1/release')
        .set('Authorization', `Bearer ${conciergeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conciergeId).toBeNull();
    });

    it('POST /v1/conversations/:id/emergency should escalate emergency', async () => {
      jest.spyOn(conversationService, 'flagEmergency').mockResolvedValueOnce({
        ...mockConversation,
        isEmergency: true,
      });

      const res = await request(app)
        .post('/v1/conversations/conv-uuid-1/emergency')
        .set('Authorization', `Bearer ${conciergeToken}`)
        .send({ notes: 'Medical emergency on boat tour' });

      expect(res.status).toBe(200);
      expect(res.body.data.isEmergency).toBe(true);
    });
  });

  describe('Messages History & Sending', () => {
    it('POST /v1/conversations/:id/messages should persist message and return 201', async () => {
      jest.spyOn(conversationService, 'sendMessage').mockResolvedValueOnce(mockMessage);

      const res = await request(app)
        .post('/v1/conversations/conv-uuid-1/messages')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          content: 'Hello, what time does the boat leave tomorrow?',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Hello, what time does the boat leave tomorrow?');
    });

    it('GET /v1/conversations/:id/messages should list messages with cursor pagination', async () => {
      jest.spyOn(conversationService, 'listMessages').mockResolvedValueOnce({
        data: [mockMessage],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/conversations/conv-uuid-1/messages')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
