import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import { mapProductRow, type ProductRow } from "./types"

export const productDetailQueryKey = (id: string) =>
  ["products", "detail", id] as const

export function prefetchProductDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, productDetailQueryKey(id), () =>
    api.products.get(Number(id))
  )
}

export function useProductDetailQuery(api: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      productDetailQueryKey(id),
      async () => api.products.get(Number(id)),
      id
    ),
  })
}

export function useProductsListQuery(
  api: StoreSyncSdk,
  params: {
    page: number
    limit: number
    q?: string
    status?: "active" | "deleted"
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: async () => {
      const result = await api.products.list({
        page: params.page,
        limit: params.limit,
        q: params.q,
        status: params.status === "deleted" ? "deleted" : "active",
      })
      return {
        items: result.items.map(mapProductRow),
        total: result.total,
      }
    },
    enabled: params.enabled !== false,
  })
}

export function useProductsTrashQuery(
  api: StoreSyncSdk,
  params: { page: number; limit: number; q?: string; enabled: boolean }
) {
  return useProductsListQuery(api, {
    ...params,
    status: "deleted",
  })
}

export type { ProductRow }
