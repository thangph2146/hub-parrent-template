/**
 * Parse List Query.
 *
 * Bám sát pattern `apps/main/api/src/common/parse-list-query.ts`.
 *
 * Parse page/limit/status/search + extra filters từ raw query object.
 */
import { DEFAULT_PAGE_LIMIT, ADMIN_TABLE_EXPORT_MAX_LIMIT } from './pagination';

export interface ParsedListQuery {
  page: number;
  limit: number;
  search: string;
  status: 'active' | 'deleted' | 'all';
  filters: Record<string, string>;
}

const RESERVED_KEYS = new Set(['page', 'limit', 'search', 'status']);
const FILTER_QUERY_KEY_REGEX = /^filter\[(.+)\]$/;

export function parseAdminListLimit(
  raw: unknown,
  defaultLimit = DEFAULT_PAGE_LIMIT,
): number {
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  // Đồng bộ behavior với `apps/main/api`: query invalid thì fallback
  // về default limit thay vì ném 400.
  if (!Number.isFinite(parsed)) return defaultLimit;
  return Math.min(ADMIN_TABLE_EXPORT_MAX_LIMIT, Math.max(1, parsed));
}

export function parseAdminListPage(raw: unknown): number {
  if (raw == null) return 1;
  const parsed = Number(raw);
  // Đồng bộ behavior với `apps/main/api`: page invalid -> trang 1.
  if (Number.isNaN(parsed) || parsed <= 0) return 1;
  return parsed;
}

export function parseListQuery(raw: Record<string, unknown>): ParsedListQuery {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (RESERVED_KEYS.has(key)) continue;
    if (value == null || value === '') continue;
    // Contract từ `api-client.toApiFilterQuery()`: `filter[columnId]=value`.
    // Giữ nguyên key trong `filters` (bỏ tiền tố `filter[...]`) để service
    // có thể dùng thẳng cho `buildStandardAdminWhere()`.
    const filterKeyMatch = FILTER_QUERY_KEY_REGEX.exec(key);
    if (filterKeyMatch) {
      const filterKey = filterKeyMatch[1];
      const stringValue = Array.isArray(value)
        ? value[0] != null
          ? String(value[0])
          : ''
        : String(value);
      if (stringValue.trim()) {
        filters[filterKey] = stringValue;
      }
      continue;
    }
    if (Array.isArray(value)) {
      // take first if array
      if (value.length > 0) filters[key] = String(value[0]);
    } else if (typeof value === 'object') {
      // skip nested objects
      continue;
    } else {
      filters[key] = String(value);
    }
  }

  const statusRaw = String(raw.status ?? 'active');
  const status: 'active' | 'deleted' | 'all' =
    statusRaw === 'deleted' || statusRaw === 'all' ? statusRaw : 'active';

  return {
    page: parseAdminListPage(raw.page),
    limit: parseAdminListLimit(raw.limit),
    search: typeof raw.search === 'string' ? raw.search : '',
    status,
    filters,
  };
}
