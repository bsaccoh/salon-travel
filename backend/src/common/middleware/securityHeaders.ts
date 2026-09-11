import helmet from 'helmet';

/**
 * Security headers via Helmet.
 * Configured for a pure API backend (no HTML rendering).
 */
export const securityHeaders = helmet({
  // API-only — disable Content-Security-Policy HTML concerns
  contentSecurityPolicy: false,
  // Allow cross-origin requests (handled by CORS middleware)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // HSTS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Prevent MIME sniffing
  noSniff: undefined, // uses default (X-Content-Type-Options: nosniff)
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
