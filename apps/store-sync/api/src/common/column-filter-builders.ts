/** Builder helpers cho AdminColumnFiltersConfig (per-field). */
export const columnFilterText = (path: string | string[]) => ({
  type: 'text' as const,
  path,
});
export const columnFilterExact = (path: string | string[]) => ({
  type: 'exact' as const,
  path,
});
export const columnFilterNumber = (path: string | string[]) => ({
  type: 'number' as const,
  path,
});
export const columnFilterNumberRange = (path: string | string[]) => ({
  type: 'numberRange' as const,
  path,
});
export const columnFilterDateRange = (path: string | string[]) => ({
  type: 'dateRange' as const,
  path,
});
export const columnFilterBoolean = (path: string | string[]) => ({
  type: 'boolean' as const,
  path,
});
export const columnFilterEntityId = (path: string | string[]) => ({
  type: 'number' as const,
  path,
});
