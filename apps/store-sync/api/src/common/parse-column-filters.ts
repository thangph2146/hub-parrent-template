/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Trích `filter[columnId]` từ query string admin list. */
export function parseColumnFiltersFromQuery(
  query?: Record<string, string | undefined>,
): Record<string, string> | undefined {
  if (!query) return undefined;

  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    const match = key.match(/^filter\[(.+)\]$/);
    if (match && value?.trim()) {
      filters[match[1]] = value.trim();
    }
  }

  return Object.keys(filters).length ? filters : undefined;
}
