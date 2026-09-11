import request from 'supertest';
import { createApp } from '../../src/app';
import { providerService } from '../../src/modules/providers/service';
import { servicesService } from '../../src/modules/services/service';
import { providerDocumentsService } from '../../src/modules/provider-documents/service';
import { ProviderCategory, ProviderStatus, ServiceType, DocumentType, DocumentStatus, VerificationStatus } from '@prisma/client';
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

describe('Provider & Service Marketplace APIs', () => {
  const app = createApp();

  const travelerToken = jwt.sign(
    { sub: 'user-traveler-1', role: 'traveler', jti: 'sess-traveler' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const providerToken = jwt.sign(
    { sub: 'user-provider-1', role: 'provider', jti: 'sess-provider' },
    env.JWT_SIGNING_KEY,
    { expiresIn: '15m' },
  );

  const mockProvider = {
    id: 'provider-uuid-1',
    userId: 'user-provider-1',
    businessName: 'Freetown Beach Lodge',
    slug: 'freetown-beach-lodge',
    category: ProviderCategory.hotel,
    status: ProviderStatus.listed,
    description: 'Beachfront lodge on Lumley Beach',
    phone: '+23276000001',
    whatsapp: '+23276000001',
    email: 'info@beachlodge.dev',
    website: 'https://beachlodge.dev',
    address: '15 Lumley Beach Rd',
    city: 'Freetown',
    region: 'Western Area',
    languages: ['en'],
    latitude: 8.4657,
    longitude: -13.2317,
    logoUrl: null,
    coverUrl: null,
    verificationStatus: VerificationStatus.verified,
    verifiedAt: new Date(),
    verifiedBy: 'admin-1',
    commissionRate: 15,
    avgRating: 4.8,
    reviewCount: 12,
    services: [],
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const mockService = {
    id: 'service-uuid-1',
    providerId: 'provider-uuid-1',
    name: 'Ocean View Deluxe Suite',
    type: ServiceType.accommodation,
    description: 'Luxury suite with sea view',
    shortDescription: 'Deluxe suite',
    priceCents: 12000, // $120.00
    currency: 'SLE',
    durationMinutes: 1440,
    maxCapacity: 2,
    commissionRate: 15,
    images: [],
    inclusions: ['Breakfast', 'WiFi'],
    exclusions: ['Dinner'],
    isActive: true,
    avgRating: 5.0,
    reviewCount: 4,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const mockDocument = {
    id: 'doc-uuid-1',
    providerId: 'provider-uuid-1',
    type: DocumentType.business_registration,
    status: DocumentStatus.pending,
    fileName: 'business_cert.pdf',
    fileSize: 102400,
    mimeType: 'application/pdf',
    fileUrl: 'https://storage.salonetravel.com/docs/cert.pdf',
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Provider Onboarding & Self-Management', () => {
    it('POST /v1/providers should allow authenticated user to create provider profile', async () => {
      jest.spyOn(providerService, 'createProvider').mockResolvedValueOnce({
        ...mockProvider,
        status: ProviderStatus.draft,
        verificationStatus: VerificationStatus.pending,
      });

      const res = await request(app)
        .post('/v1/providers')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          businessName: 'Freetown Beach Lodge',
          category: 'hotel',
          description: 'A cozy lodge',
          phone: '+23276000001',
          address: '15 Lumley Beach Road',
          city: 'Freetown',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.businessName).toBe('Freetown Beach Lodge');
    });

    it('GET /v1/providers/me should return own provider profile', async () => {
      jest.spyOn(providerService, 'getOwnProvider').mockResolvedValueOnce(mockProvider);

      const res = await request(app)
        .get('/v1/providers/me')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('freetown-beach-lodge');
    });

    it('PATCH /v1/providers/me should update own profile', async () => {
      jest.spyOn(providerService, 'updateOwnProvider').mockResolvedValueOnce({
        ...mockProvider,
        description: 'Updated beachfront description',
      });

      const res = await request(app)
        .patch('/v1/providers/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          description: 'Updated beachfront description',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated beachfront description');
    });

    it('POST /v1/providers/me/submit should submit provider for verification', async () => {
      jest.spyOn(providerService, 'submitForVerification').mockResolvedValueOnce({
        ...mockProvider,
        status: ProviderStatus.submitted,
        verificationStatus: VerificationStatus.pending,
      });

      const res = await request(app)
        .post('/v1/providers/me/submit')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('submitted');
    });
  });

  describe('Provider Services Management', () => {
    it('POST /v1/providers/me/services should create a new service listing', async () => {
      jest.spyOn(servicesService, 'createService').mockResolvedValueOnce(mockService);

      const res = await request(app)
        .post('/v1/providers/me/services')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          name: 'Ocean View Deluxe Suite',
          type: 'accommodation',
          description: 'Luxury suite with sea view',
          priceCents: 12000,
          currency: 'SLE',
          maxCapacity: 2,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Ocean View Deluxe Suite');
      expect(res.body.data.priceCents).toBe(12000);
    });

    it('GET /v1/providers/me/services should list provider services', async () => {
      jest.spyOn(servicesService, 'getOwnServices').mockResolvedValueOnce({
        data: [mockService],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app)
        .get('/v1/providers/me/services')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('service-uuid-1');
    });

    it('DELETE /v1/providers/me/services/:id should soft delete service', async () => {
      jest.spyOn(servicesService, 'deleteOwnService').mockResolvedValueOnce(undefined);

      const res = await request(app)
        .delete('/v1/providers/me/services/service-uuid-1')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(204);
    });
  });

  describe('Provider Documents Management', () => {
    it('POST /v1/providers/me/documents should upload document metadata', async () => {
      jest.spyOn(providerDocumentsService, 'uploadDocument').mockResolvedValueOnce(mockDocument);

      const res = await request(app)
        .post('/v1/providers/me/documents')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          type: 'business_registration',
          fileName: 'business_cert.pdf',
          fileSize: 102400,
          mimeType: 'application/pdf',
          fileUrl: 'https://storage.salonetravel.com/docs/cert.pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('business_registration');
      expect(res.body.data.mimeType).toBe('application/pdf');
    });

    it('GET /v1/providers/me/documents should list uploaded documents', async () => {
      jest.spyOn(providerDocumentsService, 'listDocuments').mockResolvedValueOnce([mockDocument]);

      const res = await request(app)
        .get('/v1/providers/me/documents')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('Public Provider Discovery', () => {
    it('GET /v1/providers should list listed providers', async () => {
      jest.spyOn(providerService, 'listPublic').mockResolvedValueOnce({
        data: [mockProvider],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app).get('/v1/providers');

      expect(res.status).toBe(200);
      expect(res.body.data[0].slug).toBe('freetown-beach-lodge');
    });

    it('GET /v1/providers/:slug should return provider detail', async () => {
      jest.spyOn(providerService, 'getPublicBySlug').mockResolvedValueOnce({
        ...mockProvider,
        services: [mockService],
        reviews: [],
      });

      const res = await request(app).get('/v1/providers/freetown-beach-lodge');

      expect(res.status).toBe(200);
      expect(res.body.data.businessName).toBe('Freetown Beach Lodge');
    });

    it('GET /v1/providers/:providerId/services should list public active services', async () => {
      jest.spyOn(servicesService, 'listPublicProviderServices').mockResolvedValueOnce({
        data: [mockService],
        pagination: { nextCursor: null, hasMore: false },
      });

      const res = await request(app).get('/v1/providers/provider-uuid-1/services');

      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Ocean View Deluxe Suite');
    });
  });
});
