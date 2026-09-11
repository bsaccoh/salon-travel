import request from 'supertest';
import { createApp } from '../../src/app';
import { reviewService } from '../../src/modules/reviews/service';
import { ReviewStatus } from '@prisma/client';
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

describe('Reviews & Ratings APIs (/v1/reviews)', () => {
  const app = createApp();

  const travelerToken = jwt.sign(
    { sub: 'traveler-user-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const adminToken = jwt.sign(
    { sub: 'admin-user-1', role: 'admin', jti: 'sess-admin' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockReview = {
    id: 'review-uuid-1',
    bookingId: '550e8400-e29b-41d4-a716-446655440000',
    authorId: 'traveler-user-1',
    providerId: 'provider-uuid-1',
    rating: 5,
    title: 'Unforgettable stay!',
    content: 'The beachfront views and concierge service were world-class.',
    status: ReviewStatus.published,
    moderatedBy: null,
    moderatedAt: null,
    deletedAt: null,
    version: 1,
    author: { id: 'traveler-user-1', fullName: 'Alex Johnson' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('POST /v1/reviews (Create Review)', () => {
    it('should submit review for completed booking and return 201', async () => {
      jest.spyOn(reviewService, 'createReview').mockResolvedValueOnce(mockReview);

      const res = await request(app)
        .post('/v1/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          bookingId: '550e8400-e29b-41d4-a716-446655440000',
          rating: 5,
          title: 'Unforgettable stay!',
          content: 'The beachfront views and concierge service were world-class.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });

    it('should reject invalid rating outside 1-5 with 422', async () => {
      const res = await request(app)
        .post('/v1/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          bookingId: '550e8400-e29b-41d4-a716-446655440000',
          rating: 6, // Invalid
          content: 'Test content with enough characters.',
        });

      expect(res.status).toBe(422);
    });
  });

  describe('PATCH /v1/reviews/:id (Update Review within 24h)', () => {
    it('should update review when within 24-hour window', async () => {
      jest.spyOn(reviewService, 'updateReview').mockResolvedValueOnce({
        ...mockReview,
        rating: 4,
      });

      const res = await request(app)
        .patch('/v1/reviews/review-uuid-1')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({ rating: 4 });

      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(4);
    });
  });

  describe('POST /v1/reviews/:id/moderate (Admin Moderation)', () => {
    it('should allow admin to hide review', async () => {
      jest.spyOn(reviewService, 'moderateReview').mockResolvedValueOnce({
        ...mockReview,
        status: ReviewStatus.hidden,
      });

      const res = await request(app)
        .post('/v1/reviews/review-uuid-1/moderate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'hidden', notes: 'Inappropriate content' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('hidden');
    });

    it('should reject non-admin from moderating with 403', async () => {
      const res = await request(app)
        .post('/v1/reviews/review-uuid-1/moderate')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({ status: 'hidden' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /v1/reviews/provider/:providerId (Public Provider Reviews)', () => {
    it('should list published reviews for provider', async () => {
      jest.spyOn(reviewService, 'listProviderReviews').mockResolvedValueOnce({
        data: [mockReview],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app).get('/v1/reviews/provider/provider-uuid-1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
