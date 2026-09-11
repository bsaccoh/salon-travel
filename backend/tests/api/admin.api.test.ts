import request from 'supertest';
import { createApp } from '../../src/app';
import { adminService } from '../../src/modules/admin/service';
import { providerService } from '../../src/modules/providers/service';
import { UserRole, UserStatus, ProviderStatus, VerificationStatus } from '@prisma/client';
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

describe('Admin Operational APIs (/v1/admin)', () => {
  const app = createApp();

  const adminToken = jwt.sign(
    { sub: 'admin-user-1', role: 'admin', jti: 'sess-admin' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const travelerToken = jwt.sign(
    { sub: 'traveler-user-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockProvider = {
    id: 'provider-uuid-1',
    userId: 'provider-user-1',
    businessName: 'Banana Island Resort',
    slug: 'banana-island-resort',
    category: 'hotel',
    status: ProviderStatus.under_review,
    verificationStatus: VerificationStatus.pending,
    verifiedAt: null,
    verifiedBy: null,
    commissionRate: 15,
    avgRating: null,
    reviewCount: 0,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'traveler@example.com',
    fullName: 'John Doe',
    phone: '+23276000002',
    role: UserRole.traveler,
    status: UserStatus.active,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Provider Verification Workflow', () => {
    it('POST /v1/admin/providers/:id/approve should approve and list provider', async () => {
      jest.spyOn(providerService, 'approveProvider').mockResolvedValueOnce({
        ...mockProvider,
        status: ProviderStatus.listed,
        verificationStatus: VerificationStatus.verified,
      } as any);

      const res = await request(app)
        .post('/v1/admin/providers/provider-uuid-1/approve')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('listed');
      expect(res.body.data.verificationStatus).toBe('verified');
    });

    it('POST /v1/admin/providers/:id/reject should reject provider with reason', async () => {
      jest.spyOn(providerService, 'rejectProvider').mockResolvedValueOnce({
        ...mockProvider,
        status: ProviderStatus.rejected,
        verificationStatus: VerificationStatus.rejected,
      } as any);

      const res = await request(app)
        .post('/v1/admin/providers/provider-uuid-1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Invalid business license' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('rejected');
    });

    it('should reject unauthorized access by traveler (403)', async () => {
      const res = await request(app)
        .post('/v1/admin/providers/provider-uuid-1/approve')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('User Administration', () => {
    it('GET /v1/admin/users should list platform users', async () => {
      jest.spyOn(adminService, 'listUsers').mockResolvedValueOnce({
        data: [mockUser],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('POST /v1/admin/users/:id/suspend should suspend user and revoke sessions (204)', async () => {
      jest.spyOn(adminService, 'suspendUser').mockResolvedValueOnce(undefined as any);

      const res = await request(app)
        .post('/v1/admin/users/user-uuid-1/suspend')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Terms of service violation' });

      expect(res.status).toBe(204);
    });
  });

  describe('Platform Bookings', () => {
    it('GET /v1/admin/bookings should list all bookings', async () => {
      jest.spyOn(adminService, 'listBookings').mockResolvedValueOnce({
        data: [],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });
});
