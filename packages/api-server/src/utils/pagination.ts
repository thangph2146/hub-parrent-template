/**
 * Pagination Utilities
 * Helper functions for pagination
 */

/**
 * Normalize pagination parameters
 */
export function normalizePageLimit(
  page: number | string,
  limit: number | string,
  maxLimit = 100,
  defaultLimit = 10
): { page: number; limit: number; skip: number } {
  const normalizedPage = Math.max(1, Number(page) || 1)
  const normalizedLimit = Math.min(
    maxLimit,
    Math.max(1, Number(limit) || defaultLimit)
  )
  const skip = (normalizedPage - 1) * normalizedLimit
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip,
  }
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): {
  page: number
  limit: number
  total: number
  totalPages: number
} {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit
}

/**
 * Check if pagination is valid
 */
export function isValidPagination(page: number, limit: number): boolean {
  return page >= 1 && limit >= 1
}

/**
 * Get pagination range for display
 */
export function getPaginationRange(
  page: number,
  limit: number,
  total: number
): { start: number; end: number; total: number } {
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return { start, end, total }
}
