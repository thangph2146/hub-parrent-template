/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** CRUD runtime — template local (pnpm api:sync-template). */
/**
 * Apply Column Filters.
 *
 * Bám sát pattern `apps/main/api/src/common/apply-column-filters.ts`.
 *
 * Helper dựng WHERE clause cho filter dạng cột (text / exact / number /
 * numberRange / dateRange / boolean / entityId). Dùng cho admin list API.
 */
import type { FilterQuery } from '@mikro-orm/core';

export type AdminColumnFilterType =
  | 'text'
  | 'exact'
  | 'number'
  | 'numberRange'
  | 'dateRange'
  | 'boolean'
  | 'entityId';

export interface AdminColumnFilterField {
  type: AdminColumnFilterType;
  /** Đường dẫn field entity — hỗ trợ nested quan hệ, vd. `['linkedEvent', 'title']`. */
  path: string | string[];
}

export type AdminColumnFiltersConfig = Record<string, AdminColumnFilterField>;

function toPathSegments(path: string | string[]): string[] {
  return Array.isArray(path) ? path : [path];
}

function setNestedWhere(
  where: Record<string, unknown>,
  path: string[],
  value: unknown,
): void {
  if (path.length === 0) return;

  let current = where;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    const next = current[key];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = path[path.length - 1];
  const existing = current[lastKey];
  if (
    existing &&
    typeof existing === 'object' &&
    !Array.isArray(existing) &&
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    current[lastKey] = { ...existing, ...value };
    return;
  }
  current[lastKey] = value;
}

function applyDateRange(
  where: Record<string, unknown>,
  path: string[],
  raw: string,
): void {
  const dates = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  if (dates.length === 0) return;

  if (dates.length === 1) {
    setNestedWhere(where, path, { $gte: new Date(dates[0]) });
    return;
  }

  setNestedWhere(where, path, {
    $gte: new Date(dates[0]),
    $lte: new Date(dates[1]),
  });
}

function applyFieldFilter(
  where: Record<string, unknown>,
  field: AdminColumnFilterField,
  raw: string,
): void {
  const path = toPathSegments(field.path);

  switch (field.type) {
    case 'text': {
      const term = `%${raw}%`;
      setNestedWhere(where, path, { $like: term });
      return;
    }
    case 'exact': {
      setNestedWhere(where, path, raw);
      return;
    }
    case 'number': {
      const n = Number(raw);
      if (!Number.isNaN(n)) {
        setNestedWhere(where, path, n);
      }
      return;
    }
    case 'numberRange': {
      const parts = raw
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .map(Number);
      if (parts.length === 1 && !Number.isNaN(parts[0])) {
        setNestedWhere(where, path, { $gte: parts[0] });
        return;
      }
      if (parts.length >= 2) {
        const [from, to] = parts;
        const range: Record<string, number> = {};
        if (!Number.isNaN(from)) range.$gte = from;
        if (!Number.isNaN(to)) range.$lte = to;
        setNestedWhere(where, path, range);
      }
      return;
    }
    case 'dateRange': {
      applyDateRange(where, path, raw);
      return;
    }
    case 'boolean': {
      if (raw === 'true' || raw === 'false') {
        setNestedWhere(where, path, raw === 'true');
      }
      return;
    }
    case 'entityId': {
      const n = Number(raw);
      if (!Number.isNaN(n) && n > 0) {
        setNestedWhere(where, path, n);
      }
      return;
    }
    default:
      return;
  }
}

/** Áp `filter[columnId]` lên MikroORM `where` theo config từng cột. */
export function applyColumnFilters(
  where: Record<string, unknown>,
  filters: Record<string, string> | undefined,
  config: AdminColumnFiltersConfig,
): void {
  if (!filters) return;

  for (const [key, value] of Object.entries(filters)) {
    if (!value?.trim()) continue;
    const field = config[key];
    if (!field) continue;
    applyFieldFilter(where, field, value);
  }
}

export type StandardAdminListParams = {
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  statusFilter?: number;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  deletedAtFrom?: string;
  deletedAtTo?: string;
  filters?: Record<string, string>;
  searchFields?: string[];
  filterConfig?: AdminColumnFiltersConfig;
};

function applySoftDeleteStatus(
  where: Record<string, unknown>,
  status: StandardAdminListParams['status'],
): void {
  const s = status ?? 'active';
  if (s === 'deleted') where.deletedAt = { $ne: null };
  else if (s === 'active') where.deletedAt = null;
}

function applyLegacyRangeFilters(
  where: Record<string, unknown>,
  params: StandardAdminListParams,
): void {
  if (params.statusFilter != null) where.status = params.statusFilter;

  if (params.updatedAtFrom) {
    where.updatedAt = {
      ...(where.updatedAt as object),
      $gte: new Date(params.updatedAtFrom),
    };
  }
  if (params.updatedAtTo) {
    where.updatedAt = {
      ...(where.updatedAt as object),
      $lte: new Date(params.updatedAtTo),
    };
  }
  if (params.deletedAtFrom) {
    where.deletedAt = {
      ...(where.deletedAt as object),
      $gte: new Date(params.deletedAtFrom),
    };
  }
  if (params.deletedAtTo) {
    where.deletedAt = {
      ...(where.deletedAt as object),
      $lte: new Date(params.deletedAtTo),
    };
  }
}

/** Ghép soft-delete, search, legacy date/status và `filter[column]`. */
export function buildStandardAdminListWhere(
  params: StandardAdminListParams,
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  applySoftDeleteStatus(where, params.status);
  applyLegacyRangeFilters(where, params);

  if (params.search?.trim() && params.searchFields?.length) {
    const q = params.search.trim();
    where.$or = params.searchFields.map((field) => ({
      [field]: { $like: `%${q}%` },
    }));
  }

  if (params.filterConfig) {
    applyColumnFilters(where, params.filters, params.filterConfig);
  }

  return where;
}

/**
 * Build a FilterQuery từ admin column filters + soft-delete status.
 */
export function buildStandardAdminWhere<T extends object>(
  filters: Record<string, string> | undefined,
  config: AdminColumnFiltersConfig,
  status: 'active' | 'deleted' | 'all' = 'active',
  options: { softDeleteField?: string } = {},
): FilterQuery<T> {
  const where: Record<string, unknown> = {};
  const softDeleteField = options.softDeleteField ?? 'deletedAt';

  // Soft-delete status filter
  if (status === 'active') {
    where[softDeleteField] = null;
  } else if (status === 'deleted') {
    where[softDeleteField] = { $ne: null };
  }
  // 'all' -> không thêm soft-delete filter

  if (!filters) return where as FilterQuery<T>;

  for (const [key, raw] of Object.entries(filters)) {
    if (raw == null || raw === '') continue;
    const field = config[key];
    if (!field) continue;
    applyFieldFilter(where, field, raw);
  }

  return where as FilterQuery<T>;
}
