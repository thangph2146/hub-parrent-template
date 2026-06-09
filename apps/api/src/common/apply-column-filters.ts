export type AdminColumnFilterType =
  | 'text'
  | 'exact'
  | 'number'
  | 'numberRange'
  | 'dateRange'
  | 'boolean'
  | 'uuid';

export type AdminColumnFilterField = {
  type: AdminColumnFilterType;
  /** Đường dẫn field entity — hỗ trợ nested quan hệ, vd. `['linkedEvent', 'title']`. */
  path: string | string[];
};

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
  const value = raw.trim();
  if (!value) return;

  const path = toPathSegments(field.path);

  switch (field.type) {
    case 'text':
      setNestedWhere(where, path, { $like: `%${value}%` });
      return;
    case 'exact':
      setNestedWhere(where, path, value);
      return;
    case 'number': {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        setNestedWhere(where, path, parsed);
      }
      return;
    }
    case 'numberRange': {
      const [minStr = '', maxStr = ''] = value.split(',');
      const min = minStr.trim() ? Number(minStr) : undefined;
      const max = maxStr.trim() ? Number(maxStr) : undefined;
      const range: { $gte?: number; $lte?: number } = {};
      if (min != null && Number.isFinite(min)) range.$gte = min;
      if (max != null && Number.isFinite(max)) range.$lte = max;
      if (Object.keys(range).length > 0) {
        setNestedWhere(where, path, range);
      }
      return;
    }
    case 'boolean':
      setNestedWhere(where, path, value === 'true' || value === '1');
      return;
    case 'uuid':
      setNestedWhere(where, path, value);
      return;
    case 'dateRange':
      applyDateRange(where, path, value);
      return;
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
      ...(where.updatedAt ?? {}),
      $gte: new Date(params.updatedAtFrom),
    };
  }
  if (params.updatedAtTo) {
    where.updatedAt = {
      ...(where.updatedAt ?? {}),
      $lte: new Date(params.updatedAtTo),
    };
  }
  if (params.deletedAtFrom) {
    where.deletedAt = {
      ...(where.deletedAt ?? {}),
      $gte: new Date(params.deletedAtFrom),
    };
  }
  if (params.deletedAtTo) {
    where.deletedAt = {
      ...(where.deletedAt ?? {}),
      $lte: new Date(params.deletedAtTo),
    };
  }
}

/** Ghép soft-delete, search, legacy date/status và `filter[column]`. */
export function buildStandardAdminWhere(
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
