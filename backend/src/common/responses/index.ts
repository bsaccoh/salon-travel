import { Response } from 'express';

// ── Types ───────────────────────────────────────────────

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SuccessResponse<T> {
  data: T;
}

export interface CollectionResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    requestId: string;
    details: Record<string, unknown>;
    fields: Array<{ field: string; message: string; code: string }>;
  };
}

// ── Helpers ─────────────────────────────────────────────

/**
 * Send a single-resource success response.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ data });
}

/**
 * Send a created response (201).
 */
export function sendCreated<T>(res: Response, data: T): void {
  res.status(201).json({ data });
}

/**
 * Send a paginated collection response.
 */
export function sendCollection<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta = { nextCursor: null, hasMore: false },
): void {
  res.status(200).json({ data, pagination });
}

/**
 * Send a 204 No Content response.
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send a standard error response.
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
  fields: Array<{ field: string; message: string; code: string }> = [],
): void {
  res.status(statusCode).json({
    error: { code, message, requestId, details, fields },
  });
}
