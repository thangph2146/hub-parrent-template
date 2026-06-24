import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import { mapOrderRow, type OrderRow } from "../shared/types"

export const orderDetailQueryKey = (id: string) =>
  ["orders", "detail", id] as const

export function prefetchOrderDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, orderDetailQueryKey(id), () =>
    api.orders.get(Number(id))
  )
}

export function useOrderDetailQuery(api: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      orderDetailQueryKey(id),
      async () => api.orders.get(Number(id)),
      id
    ),
  })
}

export function useOrdersListQuery(
  api: StoreSyncSdk,
  params: {
    page: number
    limit: number
    status?: string
    search?: string
    filters?: Record<string, string>
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ["orders", "list", params],
    queryFn: async () => {
      const result = await api.orders.list({
        page: params.page,
        limit: params.limit,
        status:
          params.status && params.status !== "all" ? params.status : undefined,
        search: params.search,
        filters: params.filters,
      })
      return {
        items: result.items.map(mapOrderRow),
        total: result.total,
      }
    },
    enabled: params.enabled !== false,
  })
}

export function useOrderStatusCountsQuery(api: StoreSyncSdk) {
  return useQuery({
    queryKey: ["orders", "status-counts"],
    queryFn: () => api.orders.getStaffStatusCounts(),
  })
}

export type { OrderRow }
