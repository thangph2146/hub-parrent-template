import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  type PaginationParams,
} from './pagination';

/** Chuẩn hóa `limit` query admin — cho phép tải tới `ADMIN_TABLE_EXPORT_MAX_LIMIT`. */
export function parseAdminListLimit(raw: unknown, defaultLimit = 20): number {
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(parsed)) return defaultLimit;
  return Math.min(ADMIN_TABLE_EXPORT_MAX_LIMIT, Math.max(1, parsed));
}

export function parseAdminListPage(raw: unknown, defaultPage = 1): number {
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(parsed)) return defaultPage;
  return Math.max(1, parsed);
}

export function parseAdminListPagination(
  pageRaw: unknown,
  limitRaw: unknown,
  defaultLimit = 20,
): PaginationParams {
  return normalizePageLimit(
    parseAdminListPage(pageRaw),
    parseAdminListLimit(limitRaw, defaultLimit),
    ADMIN_TABLE_EXPORT_MAX_LIMIT,
  );
}
