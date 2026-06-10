import type { QueryClient, QueryFunction } from "@tanstack/react-query"

export function adminDetailQueryOptions<TData>(
  queryKey: readonly unknown[],
  queryFn: QueryFunction<TData, readonly unknown[], never>,
  id: string
) {
  return {
    queryKey,
    queryFn,
    enabled: !!id,
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
  })
}
