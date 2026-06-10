/**
 * Helper pagination dùng chung cho list API.
 */

/** Giới hạn `limit` mặc định cho danh sách admin (phân trang UI). */
export const ADMIN_TABLE_MAX_LIMIT = 100;

/** Giới hạn khi client tải toàn bộ để xuất Excel / hiển thị đầy đủ. */
export const ADMIN_TABLE_EXPORT_MAX_LIMIT = 5000;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Chuẩn hóa page, limit và tính skip.
 * @param page - trang (>= 1)
 * @param limit - số bản ghi/trang (1..maxLimit)
 * @param maxLimit - giới hạn tối đa (mặc định 100)
 */
export function normalizePageLimit(
  page: number,
  limit: number,
  maxLimit: number = ADMIN_TABLE_MAX_LIMIT,
): PaginationParams {
  const p = Math.max(1, page);
  const l = Math.min(maxLimit, Math.max(1, limit));
  return {
    page: p,
    limit: l,
    skip: (p - 1) * l,
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Tạo object pagination cho response.
 */
export function paginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/** Phân trang khi client yêu cầu tải đủ bản ghi (xuất Excel, xem tất cả). */
export function normalizeExportPageLimit(
  page: number,
  limit: number,
): PaginationParams {
  return normalizePageLimit(page, limit, ADMIN_TABLE_EXPORT_MAX_LIMIT);
}
