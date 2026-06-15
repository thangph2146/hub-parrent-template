export type EventsListQuery = {
  filter?: string
  categorySlug?: string
  search?: string
  registerable?: boolean
  page: number
  limit: number
}

export type EventTimeFilterValue = "upcoming" | "ongoing" | "past" | "all"

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function toPositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

export function parseRegisterable(value: string, filter: string): boolean {
  if (filter !== "upcoming") return false
  const normalized = value.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes"
}

export function toValidEventFilter(filter?: string): EventTimeFilterValue {
  if (filter === "upcoming" || filter === "ongoing" || filter === "past") {
    return filter
  }
  return "all"
}

export function parseEventsListQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): EventsListQuery {
  const read = (key: string) =>
    params instanceof URLSearchParams
      ? params.get(key) ?? ""
      : firstParam(params[key])

  const filter = read("filter").trim()
  const categorySlug = read("categorySlug")
  const search = read("search").trim()
  const registerable = parseRegisterable(read("registerable"), filter)
  const page = toPositiveInt(read("page"), 1)
  const limit = Math.min(24, Math.max(6, toPositiveInt(read("limit"), 12)))

  return { filter, categorySlug, search, registerable, page, limit }
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
  if (merged.registerable) params.set("registerable", "1")
  if (merged.limit > 0) params.set("limit", String(merged.limit))
  if (merged.page > 1) params.set("page", String(merged.page))
  const query = params.toString()
  return query ? `/su-kien?${query}` : "/su-kien"
}
