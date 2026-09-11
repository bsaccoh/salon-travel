import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../config/constants';

/**
 * Zod schema for cursor-based pagination query parameters.
 */
export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Build Prisma cursor-based pagination arguments.
 */
export function buildPaginationArgs(params: PaginationParams) {
  const { cursor, limit } = params;

  return {
    take: limit + 1, // Fetch one extra to detect hasMore
    ...(cursor
      ? {
          skip: 1, // Skip the cursor record itself
          cursor: { id: cursor },
        }
      : {}),
  };
}

/**
 * Process paginated results and build pagination metadata.
 */
export function paginateResults<T extends { id: string }>(
  items: T[],
  limit: number,
): { data: T[]; pagination: { nextCursor: string | null; hasMore: boolean } } {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  };
}
