import request from 'supertest';
import { createApp } from '../../src/app';
import { bookingService } from '../../src/modules/bookings/service';
import { BookingStatus } from '@prisma/client';
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

// Mock BullMQ queue
jest.mock('../../src/jobs/queues', () => ({
  getQueue: jest.fn().mockReturnValue({
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  }),
  QUEUE_NAMES: {
    NOTIFICATIONS: 'notifications',
    BOOKING: 'booking',
    MAINTENANCE: 'maintenance',
  },
}));

describe('Booking Lifecycle APIs (/v1/bookings)', () => {
  const app = createApp();

  const travelerToken = jwt.sign(
    { sub: 'traveler-user-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const providerToken = jwt.sign(
    { sub: 'provider-user-1', role: 'provider', jti: 'sess-provider' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockBooking = {
    id: 'booking-uuid-1',
    travelerId: 'traveler-user-1',
    providerId: 'provider-uuid-1',
    serviceId: 'service-uuid-1',
    status: BookingStatus.pending,
    scheduledDate: new Date('2026-10-20T10:00:00.000Z'),
    scheduledEndDate: null,
    guestCount: 2,
    totalCents: 24000, // $240.00
    commissionCents: 3600, // $36.00 (15%)
    providerEarningsCents: 20400, // $204.00
    currency: 'SLE',
    specialRequests: 'Airport transfer needed',
    cancellationReason: null,
    declinedReason: null,
    expiresAt: new Date(Date.now() + 86400000),
    confirmedAt: null,
    completedAt: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    service: { id: 'service-uuid-1', name: 'Deluxe Beachfront Suite', type: 'accommodation' },
    provider: { id: 'provider-uuid-1', businessName: 'Freetown Beach Lodge' },
    traveler: { id: 'traveler-user-1', fullName: 'Alex Johnson', email: 'alex@example.com' },
    events: [
      {
        id: 'event-1',
        fromStatus: null,
        toStatus: 'pending',
        actorId: 'traveler-user-1',
        actorRole: 'traveler',
        reason: 'Booking requested by traveler',
        createdAt: new Date(),
      },
    ],
  };

  describe('POST /v1/bookings (Create Booking Request)', () => {
    it('should create booking request with server-calculated pricing and return 201', async () => {
      jest.spyOn(bookingService, 'createBooking').mockResolvedValueOnce(mockBooking as any);

      const res = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          providerId: '550e8400-e29b-41d4-a716-446655440000',
          serviceId: '550e8400-e29b-41d4-a716-446655440001',
          scheduledDate: '2026-10-20T10:00:00.000Z',
          guestCount: 2,
          specialRequests: 'Airport transfer needed',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.totalCents).toBe(24000);
      expect(res.body.data.commissionCents).toBe(3600);
    });

    it('should reject booking request without authentication', async () => {
      const res = await request(app)
        .post('/v1/bookings')
        .send({
          providerId: '550e8400-e29b-41d4-a716-446655440000',
          serviceId: '550e8400-e29b-41d4-a716-446655440001',
          scheduledDate: '2026-10-20T10:00:00.000Z',
          guestCount: 1,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /v1/bookings/mine (Traveler Bookings)', () => {
    it('should list bookings for authenticated traveler', async () => {
      jest.spyOn(bookingService, 'listTravelerBookings').mockResolvedValueOnce({
        data: [mockBooking as any],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/bookings/mine')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('booking-uuid-1');
    });
  });

  describe('GET /v1/provider/bookings (Provider Bookings)', () => {
    it('should list bookings for authenticated provider', async () => {
      jest.spyOn(bookingService, 'listProviderBookings').mockResolvedValueOnce({
        data: [mockBooking as any],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/provider/bookings')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /v1/bookings/:id (Booking Detail & Event Timeline)', () => {
    it('should return booking detail with event timeline', async () => {
      jest.spyOn(bookingService, 'getBookingById').mockResolvedValueOnce(mockBooking as any);

      const res = await request(app)
        .get('/v1/bookings/booking-uuid-1')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('booking-uuid-1');
      expect(res.body.data.events).toBeDefined();
    });
  });

  describe('Booking Lifecycle Actions', () => {
    it('POST /v1/bookings/:id/accept should transition booking to accepted', async () => {
      const acceptedBooking = {
        ...mockBooking,
        status: BookingStatus.accepted,
        version: 2,
      };

      jest.spyOn(bookingService, 'acceptBooking').mockResolvedValueOnce(acceptedBooking as any);

      const res = await request(app)
        .post('/v1/bookings/booking-uuid-1/accept')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('accepted');
    });

    it('POST /v1/bookings/:id/decline should transition booking to declined', async () => {
      const declinedBooking = {
        ...mockBooking,
        status: BookingStatus.declined,
        declinedReason: 'No availability',
        version: 2,
      };

      jest.spyOn(bookingService, 'declineBooking').mockResolvedValueOnce(declinedBooking as any);

      const res = await request(app)
        .post('/v1/bookings/booking-uuid-1/decline')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ reason: 'No availability' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('declined');
    });

    it('POST /v1/bookings/:id/cancel should transition booking to cancelled', async () => {
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.cancelled_by_traveler,
        version: 2,
      };

      jest.spyOn(bookingService, 'cancelBooking').mockResolvedValueOnce(cancelledBooking as any);

      const res = await request(app)
        .post('/v1/bookings/booking-uuid-1/cancel')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({ reason: 'Change of plans' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled_by_traveler');
    });

    it('POST /v1/bookings/:id/complete should mark booking completed', async () => {
      const completedBooking = {
        ...mockBooking,
        status: BookingStatus.completed,
        completedAt: new Date(),
        version: 2,
      };

      jest.spyOn(bookingService, 'completeBooking').mockResolvedValueOnce(completedBooking as any);

      const res = await request(app)
        .post('/v1/bookings/booking-uuid-1/complete')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });
});
