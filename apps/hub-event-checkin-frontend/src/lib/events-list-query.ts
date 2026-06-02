export type EventsListQuery = {
  filter?: string
  categorySlug?: string
  search?: string
  page: number
  limit: number
}

export function buildEventsHref(
  current: EventsListQuery,
  next: Partial<EventsListQuery>,
): string {
  const merged = { ...current, ...next }
  const params = new URLSearchParams()
  if (merged.filter?.trim()) params.set("filter", merged.filter.trim())
  if (merged.categorySlug?.trim()) {
    params.set("categorySlug", merged.categorySlug.trim())
  }
  if (merged.search?.trim()) params.set("search", merged.search.trim())
  if (merged.limit > 0) params.set("limit", String(merged.limit))
  if (merged.page > 1) params.set("page", String(merged.page))
  const query = params.toString()
  return query ? `/su-kien?${query}` : "/su-kien"
}
