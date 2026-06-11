import { api } from "@workspace/admin-app/lib/api"
import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { CategoryDetail, CategoryRow } from "../types"
import { normalizeCategoryRow } from "../utils"

export const categoryDetailQueryKey = (categoryId: string) =>
  ["categories", "detail", categoryId] as const

export function prefetchCategoryDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  categoryId: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    categoryDetailQueryKey(categoryId),
    () => api.categories.rawGet<CategoryDetail>(categoryId)
  )
}

export function useCategoryDetailQuery(api: StoreSyncSdk, categoryId: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      categoryDetailQueryKey(categoryId),
      async () => api.categories.rawGet<CategoryDetail>(categoryId),
      categoryId
    ),
  })
}

export interface UseCategoriesQueryProps {
  api: StoreSyncSdk
  debouncedQ: string
  columnFilterQuery: Record<string, unknown>
}

export function useCategoriesQuery({
  api,
  debouncedQ,
  columnFilterQuery,
}: UseCategoriesQueryProps): UseQueryResult<PagedResult<CategoryRow>> {
  return useQuery({
    queryKey: ["categories", "list", debouncedQ, columnFilterQuery],
    queryFn: async (): Promise<PagedResult<CategoryRow>> => {
      const result = await api.categories.rawList<CategoryRow>({
        page: 1,
        limit: 1000,
        q: debouncedQ.trim() || undefined,
        status: "active",
        filters: columnFilterQuery,
      })
      return {
        items: result.items.map(normalizeCategoryRow),
        total: result.total,
      }
    },
  })
}

export interface UseTrashQueryProps {
  api: StoreSyncSdk
  debouncedTrashQ: string
  trashColumnFilterQuery?: Record<string, unknown>
  enabled: boolean
}

export function useTrashQuery({
  api,
  debouncedTrashQ,
  trashColumnFilterQuery,
  enabled,
}: UseTrashQueryProps): UseQueryResult<PagedResult<CategoryRow>> {
  return useQuery({
    queryKey: ["categories", "trash", debouncedTrashQ, trashColumnFilterQuery],
    enabled,
    queryFn: async (): Promise<PagedResult<CategoryRow>> => {
      const result = await api.categories.rawList<CategoryRow>({
        page: 1,
        limit: 1000,
        q: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters: trashColumnFilterQuery,
      })
      return {
        items: result.items.map(normalizeCategoryRow),
        total: result.total,
      }
    },
  })
}

export function useCategoriesOptionsQuery(
  api: StoreSyncSdk
): UseQueryResult<CategoryRow[]> {
  return useQuery({
    queryKey: ["categories", "options"],
    queryFn: async (): Promise<CategoryRow[]> => {
      const paged = await api.categories.rawList<CategoryRow>({
        page: 1,
        limit: 1000,
        status: "active",
      })
      return paged.items.map(normalizeCategoryRow)
    },
  })
}
