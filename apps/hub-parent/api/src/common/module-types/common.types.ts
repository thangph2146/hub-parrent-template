/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Common Types and Utilities
 * Shared types across API servers
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, unknown>
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Standard list query parameters
 */
export interface ListQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: "active" | "deleted" | "all"
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

/**
 * Filter operator types for database queries
 */
export type FilterOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$like"
  | "$in"
  | "$nin"
  | "$or"
  | "$and"

/**
 * Generic filter condition
 */
export interface FilterCondition {
  [key: string]: unknown
}

/**
 * Standard timestamp fields
 */
export interface Timestamps {
  createdAt: Date | string
  updatedAt: Date | string
  deletedAt?: Date | string | null
}

/** Soft-deletable entity — `deletedAt` kế thừa từ `Timestamps`. */
export type SoftDeletable = Pick<Timestamps, 'deletedAt'>;

/**
 * Active status entity interface
 */
export interface Activable {
  isActive: boolean
}

/**
 * Base entity with common fields
 */
export interface BaseEntity extends Timestamps, SoftDeletable, Activable {
  id: number | string
}

/**
 * Pagination helper type
 */
export interface PaginationInput {
  page: number
  limit: number
}

/**
 * Normalize pagination with defaults
 */
export function normalizePagination(
  page: number,
  limit: number,
  maxLimit = 100
): { page: number; limit: number; skip: number } {
  const normalizedPage = Math.max(1, Number(page) || 1)
  const normalizedLimit = Math.min(maxLimit, Math.max(1, Number(limit) || 10))
  const skip = (normalizedPage - 1) * normalizedLimit
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip,
  }
}
