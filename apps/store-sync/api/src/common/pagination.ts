/**
 * Pagination Utilities.
 *
 * Bám sát pattern `apps/main/api/src/common/pagination.ts` + mở rộng
 * `isValidPagination()`, `getPaginationRange()` cho UI.
 */

// Đồng bộ với `apps/main/api/src/common/pagination.ts`.
export const ADMIN_TABLE_EXPORT_MAX_LIMIT = 5000;
export const DEFAULT_PAGE_LIMIT = 10;

/**
 * Normalize page/limit về giá trị hợp lệ.
 * Đảm bảo: page >= 1, 1 <= limit <= maxLimit.
 */
export function normalizePageLimit(
  page: number | string | undefined,
  limit: number | string | undefined,
  maxLimit: number = ADMIN_TABLE_EXPORT_MAX_LIMIT,
  defaultLimit: number = DEFAULT_PAGE_LIMIT,
): { page: number; limit: number; skip: number } {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.min(
    maxLimit,
    Math.max(1, Number(limit) || defaultLimit),
  );
  const skip = (normalizedPage - 1) * normalizedLimit;
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip,
  };
}

/**
 * Build pagination metadata từ page/limit/total.
 */
export function paginationMeta(
  page: number,
  limit: number,
  total: number,
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** Alias for buildPaginationMeta - kept for backward compat. */
export const buildPaginationMeta = paginationMeta;

/**
 * Calculate offset từ page + limit.
 */
export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Calculate total pages từ total + limit.
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

// ────────────────────────────────────────────────────────────
// Backward-compat helpers (kept cho tests / downstream apps)
// ────────────────────────────────────────────────────────────

/** Check pagination có hợp lệ không. */
export function isValidPagination(page: number, limit: number): boolean {
  return page >= 1 && limit >= 1;
}

/** Tính pagination range cho UI hiển thị "X–Y / total". */
export function getPaginationRange(
  page: number,
  limit: number,
  total: number,
): { start: number; end: number; total: number } {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return { start, end, total };
}
