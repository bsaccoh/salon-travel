import request from 'supertest';
import { createApp } from '../../src/app';
import { authService } from '../../src/modules/auth/auth.service';
import { UserRole, UserStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

// Mock Redis for rate limiting in tests
jest.mock('../../src/config/redis', () => {
  const mRedis = {
    ping: jest.fn().mockResolvedValue('PONG'),
    multi: jest.fn().mockReturnValue({
      zremrangebyscore: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        [null, 1],
        [null, 1],
        [null, 1], // count = 1
        [null, 1],
      ]),
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

describe('Auth API & Authorization (/v1/auth)', () => {
  const app = createApp();

  describe('POST /v1/auth/register', () => {
    it('should validate request body and return 422 if invalid', async () => {
      const res = await request(app).post('/v1/auth/register').send({
        email: 'invalid-email',
        password: 'short',
      });

      expect(res.status).toBe(422);
      expect(res.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        fields: expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
          expect.objectContaining({ field: 'fullName' }),
        ]),
      });
    });

    it('should reject unknown properties in request body (strict validation)', async () => {
      const res = await request(app).post('/v1/auth/register').send({
        email: 'valid@example.com',
        password: 'Password123!@#',
        fullName: 'Valid User',
        unrecognizedField: 'malicious-data',
      });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 201 on valid registration', async () => {
      const mockResult = {
        authData: {
          user: {
            id: 'uuid-1',
            email: 'newuser@example.com',
            phone: null,
            fullName: 'New User',
            role: UserRole.traveler,
            status: UserStatus.active,
            emailVerifiedAt: null,
            phoneVerifiedAt: null,
            locale: 'en-SL',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            tokenType: 'Bearer' as const,
            expiresIn: 900,
          },
        },
        verificationCode: '123456',
      };

      jest.spyOn(authService, 'register').mockResolvedValueOnce(mockResult);

      const res = await request(app).post('/v1/auth/register').send({
        email: 'newuser@example.com',
        password: 'Password123!@#',
        fullName: 'New User',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.tokens.accessToken).toBe('mock-access-token');
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should return 200 with tokens on successful login', async () => {
      const mockAuthData = {
        user: {
          id: 'uuid-1',
          email: 'user@example.com',
          phone: null,
          fullName: 'Test User',
          role: UserRole.traveler,
          status: UserStatus.active,
          emailVerifiedAt: null,
          phoneVerifiedAt: null,
          locale: 'en-SL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken: 'valid-jwt',
          refreshToken: 'valid-refresh',
          tokenType: 'Bearer' as const,
          expiresIn: 900,
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValueOnce(mockAuthData);

      const res = await request(app).post('/v1/auth/login').send({
        email: 'user@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBe('valid-jwt');
    });
  });

  describe('POST /v1/auth/password/forgot', () => {
    it('should always return 204 No Content', async () => {
      jest.spyOn(authService, 'forgotPassword').mockResolvedValueOnce({});

      const res = await request(app)
        .post('/v1/auth/password/forgot')
        .send({ email: 'anyuser@example.com' });

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });
  });

  describe('Protected Routes & Authorization', () => {
    it('GET /v1/auth/me should return 401 without Authorization header', async () => {
      const res = await request(app).get('/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('GET /v1/auth/me should return 401 with invalid JWT', async () => {
      const res = await request(app)
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('GET /v1/auth/me should return 200 with valid JWT', async () => {
      const token = jwt.sign(
        { sub: 'user-123', role: 'traveler', jti: 'sess-123' },
        env.JWT_SIGNING_KEY,
        { expiresIn: '15m' },
      );

      const mockMe = {
        id: 'user-123',
        email: 'traveler@example.com',
        phone: null,
        fullName: 'Traveler Name',
        role: UserRole.traveler,
        status: UserStatus.active,
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
        locale: 'en-SL',
        createdAt: new Date(),
        updatedAt: new Date(),
        travelerProfile: null,
        provider: null,
      };

      jest.spyOn(authService, 'getMe').mockResolvedValueOnce(mockMe);

      const res = await request(app).get('/v1/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('user-123');
      expect(res.body.data.email).toBe('traveler@example.com');
    });
  });
});
