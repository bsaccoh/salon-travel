import request from 'supertest';
import { createApp } from '../../src/app';

describe('Health Endpoints', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'ok',
      });
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include X-Request-Id header', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['x-request-id']).toBeDefined();
    });

    it('should echo client-supplied X-Request-Id', async () => {
      const clientId = '550e8400-e29b-41d4-a716-446655440000';
      const res = await request(app).get('/health').set('X-Request-Id', clientId);

      expect(res.headers['x-request-id']).toBe(clientId);
    });
  });

  describe('GET /ready', () => {
    it('should return checks object with database and redis', async () => {
      const res = await request(app).get('/ready');

      // Without real DB/Redis, this will likely return 503 (degraded)
      expect([200, 503]).toContain(res.status);
      expect(res.body.checks).toBeDefined();
      expect(res.body.checks.database).toBeDefined();
      expect(res.body.checks.redis).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });
});

describe('Error Handling', () => {
  const app = createApp();

  describe('404 — unknown routes', () => {
    it('should return standard error envelope for unknown route', async () => {
      const res = await request(app).get('/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toMatchObject({
        code: 'ROUTE_NOT_FOUND',
        message: expect.stringContaining('/nonexistent'),
      });
      expect(res.body.error.requestId).toBeDefined();
      expect(res.body.error.details).toEqual({});
      expect(res.body.error.fields).toEqual([]);
    });
  });

  describe('Request ID propagation', () => {
    it('should generate request ID if not supplied', async () => {
      const res = await request(app).get('/health');
      const reqId = res.headers['x-request-id'];

      expect(reqId).toBeDefined();
      // UUID v4 format
      expect(reqId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should reject invalid X-Request-Id and generate new one', async () => {
      const res = await request(app).get('/health').set('X-Request-Id', 'not-a-uuid');

      const reqId = res.headers['x-request-id'];
      expect(reqId).not.toBe('not-a-uuid');
      expect(reqId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});
