/**
 * Global test setup — runs before each test suite.
 *
 * Sets environment variables needed by the config module
 * so tests can run without a real .env file.
 */

// Set test environment variables before any module imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3999'; // Test port
process.env.LOG_LEVEL = 'fatal'; // Minimal logging in tests
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://salone_test:salone_test_password@localhost:5433/salone_travel_test?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SIGNING_KEY = 'test_signing_key_not_for_production_use_min_32_chars';
process.env.JWT_ACCESS_TTL = '15m';
process.env.REFRESH_TOKEN_TTL = '30d';
process.env.CORS_ORIGINS = 'http://localhost:3000';
