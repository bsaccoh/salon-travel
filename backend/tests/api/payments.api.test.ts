import request from 'supertest';
import { createApp } from '../../src/app';
import { paymentService } from '../../src/modules/payments/service';
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

describe('Payments & Stripe Webhook APIs (/v1/payments)', () => {
  const app = createApp();

  const travelerToken = jwt.sign(
    { sub: 'traveler-user-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockIntentResponse = {
    paymentId: 'payment-uuid-1',
    bookingId: '550e8400-e29b-41d4-a716-446655440000',
    clientSecret: 'pi_test_123_secret_xyz',
    status: 'requires_payment_method',
    amountCents: 24000,
    currency: 'SLE',
  };

  describe('POST /v1/payments/intents (Create PaymentIntent)', () => {
    it('should create Stripe PaymentIntent using server booking price and return 201', async () => {
      jest.spyOn(paymentService, 'createPaymentIntent').mockResolvedValueOnce(mockIntentResponse);

      const res = await request(app)
        .post('/v1/payments/intents')
        .set('Authorization', `Bearer ${travelerToken}`)
        .set('Idempotency-Key', 'idem-key-123')
        .send({
          bookingId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.clientSecret).toBe('pi_test_123_secret_xyz');
      expect(res.body.data.amountCents).toBe(24000);
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/v1/payments/intents')
        .send({ bookingId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /v1/payments/webhooks/stripe (Stripe Webhook Handler)', () => {
    it('should process payment_intent.succeeded and return 204', async () => {
      jest.spyOn(paymentService, 'handleWebhookEvent').mockResolvedValueOnce({ received: true });

      const res = await request(app)
        .post('/v1/payments/webhooks/stripe')
        .set('stripe-signature', 't=123,v1=signature_valid')
        .send(
          JSON.stringify({
            id: 'evt_test_123',
            type: 'payment_intent.succeeded',
            data: { object: { id: 'pi_test_123', amount: 24000 } },
          }),
        );

      expect(res.status).toBe(204);
    });

    it('should acknowledge duplicate webhook gracefully with 200/204 without reprocessing', async () => {
      jest.spyOn(paymentService, 'handleWebhookEvent').mockResolvedValueOnce({
        received: true,
        duplicate: true,
      });

      const res = await request(app)
        .post('/v1/payments/webhooks/stripe')
        .set('stripe-signature', 't=123,v1=signature_valid')
        .send(
          JSON.stringify({
            id: 'evt_test_123',
            type: 'payment_intent.succeeded',
            data: { object: { id: 'pi_test_123' } },
          }),
        );

      expect(res.status).toBe(200);
    });
  });

  describe('GET /v1/payments/:id', () => {
    it('should return payment detail for authorized caller', async () => {
      jest.spyOn(paymentService, 'getPaymentById').mockResolvedValueOnce({
        id: 'payment-uuid-1',
        bookingId: 'booking-uuid-1',
        amountCents: 24000,
        currency: 'SLE',
        status: 'succeeded',
      } as any);

      const res = await request(app)
        .get('/v1/payments/payment-uuid-1')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.amountCents).toBe(24000);
    });
  });
});
