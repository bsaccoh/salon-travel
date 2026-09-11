import request from 'supertest';
import { createApp } from '../../src/app';
import { refundService } from '../../src/modules/refunds/service';
import { RefundReason, RefundStatus } from '@prisma/client';
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

describe('Refunds APIs (/v1/payments/:id/refund & /v1/admin/refunds)', () => {
  const app = createApp();

  const conciergeToken = jwt.sign(
    { sub: 'concierge-user-1', role: 'concierge', jti: 'sess-concierge' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const travelerToken = jwt.sign(
    { sub: 'traveler-user-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockRefund = {
    id: 'refund-uuid-1',
    bookingId: 'booking-uuid-1',
    stripeRefundId: 're_test_123',
    reason: RefundReason.service_failure,
    status: RefundStatus.pending,
    amountCents: 10000,
    currency: 'SLE',
    initiatedBy: 'concierge-user-1',
    notes: 'Tour cancelled due to heavy storm',
    processedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  describe('POST /v1/payments/:paymentId/refund', () => {
    it('should allow concierge to issue refund for eligible payment', async () => {
      jest.spyOn(refundService, 'createRefund').mockResolvedValueOnce(mockRefund);

      const res = await request(app)
        .post('/v1/payments/payment-uuid-1/refund')
        .set('Authorization', `Bearer ${conciergeToken}`)
        .send({
          amountCents: 10000,
          reason: 'service_failure',
          notes: 'Tour cancelled due to heavy storm',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amountCents).toBe(10000);
      expect(res.body.data.status).toBe('pending');
    });

    it('should reject traveler role from initiating refund directly (403)', async () => {
      const res = await request(app)
        .post('/v1/payments/payment-uuid-1/refund')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          amountCents: 10000,
          reason: 'service_failure',
        });

      expect(res.status).toBe(403);
    });
  });
});
