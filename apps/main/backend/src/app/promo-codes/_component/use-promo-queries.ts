import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import { mapPromoRow, type PromoRow } from "./types"

export const promoDetailQueryKey = (id: string) =>
  ["promo-codes", "detail", id] as const

export function prefetchPromoDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, promoDetailQueryKey(id), () =>
    api.promoCodes.get(Number(id))
  )
}

export function usePromoDetailQuery(api: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      promoDetailQueryKey(id),
      async () => api.promoCodes.get(Number(id)),
      id
    ),
  })
}

export function usePromoListQuery(
  api: StoreSyncSdk,
  params: {
    page: number
    limit: number
    q?: string
    filters?: Record<string, string>
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ["promo-codes", "list", params],
    queryFn: async () => {
      const result = await api.promoCodes.list({
        page: params.page,
        limit: params.limit,
        q: params.q,
        filters: params.filters,
      })
      return {
        items: result.items.map(mapPromoRow),
        total: result.total,
      }
    },
    enabled: params.enabled !== false,
  })
}

export type { PromoRow }
