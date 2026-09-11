import request from 'supertest';
import { createApp } from '../../src/app';
import { destinationService } from '../../src/modules/destinations/service';
import { DestinationCategory } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

// Mock Redis for rate limiting
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

describe('Destinations API (/v1/destinations)', () => {
  const app = createApp();

  const adminToken = jwt.sign(
    { sub: 'admin-uuid-1', role: 'admin', jti: 'sess-admin' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const travelerToken = jwt.sign(
    { sub: 'traveler-uuid-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockDestination = {
    id: 'dest-uuid-1',
    name: 'Lumley Beach',
    slug: 'lumley-beach',
    category: DestinationCategory.beach,
    description: 'Iconic Atlantic beach',
    shortDescription: 'Freetown beach',
    region: 'Western Area',
    latitude: 8.4657,
    longitude: -13.2317,
    images: ['https://example.com/lumley.jpg'],
    highlights: ['Sunset', 'Bars'],
    isFeatured: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  describe('GET /v1/destinations (Public List & Search)', () => {
    it('should return paginated destinations list', async () => {
      jest.spyOn(destinationService, 'list').mockResolvedValueOnce({
        data: [mockDestination],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app).get('/v1/destinations');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].slug).toBe('lumley-beach');
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by category and search query', async () => {
      const listSpy = jest.spyOn(destinationService, 'list').mockResolvedValueOnce({
        data: [mockDestination],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/destinations')
        .query({ category: 'beach', q: 'Lumley', featured: 'true' });

      expect(res.status).toBe(200);
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: DestinationCategory.beach,
          q: 'Lumley',
          featured: true,
        }),
        false,
      );
    });

    it('should reject invalid sort field with 422', async () => {
      const res = await request(app)
        .get('/v1/destinations')
        .query({ sort: 'unsupported_field' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /v1/destinations/:slug (Public Detail)', () => {
    it('should return destination detail for existing slug', async () => {
      jest.spyOn(destinationService, 'getBySlug').mockResolvedValueOnce(mockDestination);

      const res = await request(app).get('/v1/destinations/lumley-beach');

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Lumley Beach');
    });
  });

  describe('Admin Operations (POST, PATCH, DELETE)', () => {
    it('POST /v1/destinations should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/v1/destinations')
        .send({
          name: 'Tiwai Island',
          category: 'wildlife',
        });

      expect(res.status).toBe(401);
    });

    it('POST /v1/destinations should reject traveler role with 403', async () => {
      const res = await request(app)
        .post('/v1/destinations')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          name: 'Tiwai Island',
          category: 'wildlife',
        });

      expect(res.status).toBe(403);
    });

    it('POST /v1/destinations should allow admin to create destination', async () => {
      const createdDest = {
        ...mockDestination,
        id: 'dest-uuid-2',
        name: 'Tiwai Island',
        slug: 'tiwai-island',
        category: DestinationCategory.wildlife,
      };

      jest.spyOn(destinationService, 'create').mockResolvedValueOnce(createdDest);

      const res = await request(app)
        .post('/v1/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tiwai Island',
          category: 'wildlife',
          description: 'Wildlife sanctuary',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('tiwai-island');
    });

    it('PATCH /v1/destinations/:id should allow admin to update destination', async () => {
      const updatedDest = {
        ...mockDestination,
        name: 'Lumley Beach Promenade',
      };

      jest.spyOn(destinationService, 'update').mockResolvedValueOnce(updatedDest);

      const res = await request(app)
        .patch('/v1/destinations/dest-uuid-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Lumley Beach Promenade',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Lumley Beach Promenade');
    });

    it('DELETE /v1/destinations/:id should allow admin to soft delete (204)', async () => {
      jest.spyOn(destinationService, 'softDelete').mockResolvedValueOnce(undefined);

      const res = await request(app)
        .delete('/v1/destinations/dest-uuid-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });
  });
});
