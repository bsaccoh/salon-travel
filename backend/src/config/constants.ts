export const APP_NAME = 'Salone Travel Concierge';
export const API_VERSION = 'v1';
export const API_PREFIX = `/${API_VERSION}`;

export const DEFAULT_LOCALE = 'en-SL';

// ── Rate Limiting ───────────────────────────────────────
export const RATE_LIMITS = {
  AUTH_AUTHENTICATED: { max: 10, windowSec: 60 },
  AUTH_UNAUTHENTICATED: { max: 20, windowSec: 60 },
  READ_AUTHENTICATED: { max: 300, windowSec: 60 },
  READ_UNAUTHENTICATED: { max: 100, windowSec: 60 },
  WRITE: { max: 60, windowSec: 60 },
  PAYMENT: { max: 20, windowSec: 60 },
} as const;

// ── Token TTLs ──────────────────────────────────────────
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_DAYS = 30;

// ── Verification ────────────────────────────────────────
export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_CODE_TTL_MINUTES = 15;

// ── Argon2id ────────────────────────────────────────────
export const ARGON2_CONFIG = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
} as const;

// ── Pagination ──────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ── Idempotency ─────────────────────────────────────────
export const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

// ── Request Limits ──────────────────────────────────────
export const MAX_REQUEST_BODY_SIZE = '10mb';
export const MAX_UPLOAD_SIZE = '50mb';

// ── User Roles ──────────────────────────────────────────
export const USER_ROLES = ['traveler', 'provider', 'concierge', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ── User Status ─────────────────────────────────────────
export const USER_STATUSES = ['active', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
