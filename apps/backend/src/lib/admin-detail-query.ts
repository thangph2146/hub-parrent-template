import type { QueryClient, QueryFunction } from "@tanstack/react-query"

/** Cache chi tiết lâu hơn list — quay lại từ list/detail/edit gần như tức thì. */
export const ADMIN_DETAIL_QUERY_STALE_MS = 5 * 60 * 1000
export const ADMIN_DETAIL_QUERY_GC_MS = 30 * 60 * 1000

export function adminDetailQueryOptions<TData>(
  queryKey: readonly unknown[],
  queryFn: QueryFunction<TData, readonly unknown[], never>,
  id: string
) {
  return {
    queryKey,
    queryFn,
    enabled: !!id,
    staleTime: ADMIN_DETAIL_QUERY_STALE_MS,
    gcTime: ADMIN_DETAIL_QUERY_GC_MS,
  } as const
}

export function prefetchAdminDetailQuery<TData>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>
) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: ADMIN_DETAIL_QUERY_STALE_MS,
  })
}

/** Dùng dữ liệu từ cache list làm placeholder khi mở detail/edit. */
export function adminDetailPlaceholderFromList<
  TRow extends { id?: string | number | null },
  TDetail,
>(
  queryClient: QueryClient,
  listQueryKeyPrefix: readonly unknown[],
  id: string,
  mapRow: (row: TRow) => TDetail
): TDetail | undefined {
  const queries = queryClient.getQueriesData<TRow[]>({
    queryKey: listQueryKeyPrefix,
  })

  for (const [, data] of queries) {
    const rows = Array.isArray(data)
      ? data
      : data &&
          typeof data === "object" &&
          "items" in data &&
          Array.isArray((data as { items: TRow[] }).items)
        ? (data as { items: TRow[] }).items
        : undefined
    const row = rows?.find((item) => String(item.id ?? "") === id)
    if (row) return mapRow(row)
  }

  return undefined
}
