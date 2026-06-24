import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@workspace/admin-app/lib/fetch-all-admin-list"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { SeoMetaDetail, SeoMetaRow } from "../shared/types"

export const seoMetaDetailQueryKey = (id: string) =>
  ["seo-metas", "detail", id] as const

export function prefetchSeoMetaDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, seoMetaDetailQueryKey(id), () =>
    api.seoMetas.get<SeoMetaDetail>(id)
  )
}

export function useSeoMetaDetailQuery(api: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      seoMetaDetailQueryKey(id),
      async () => api.seoMetas.get<SeoMetaDetail>(id),
      id
    ),
  })
}

export function useSeoMetasListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<SeoMetaRow[]> {
  return useQuery({
    queryKey: ["seo-metas", "list", filters],
    queryFn: async (): Promise<SeoMetaRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
      const items: SeoMetaRow[] = []
      let page = 1
      let total = Number.POSITIVE_INFINITY

      while (items.length < total) {
        const result = await apiParam.seoMetas.list<SeoMetaRow>({
          page,
          limit,
          status: "active",
          filters,
        })
        items.push(...result.items)
        total = result.total
        if (result.items.length === 0) break
        page += 1
      }

      return items
    },
    enabled,
  })
}

export interface UseTrashQueryProps {
  api: StoreSyncSdk
  trashPage: number
  trashPageSize: number
  debouncedTrashQ: string
  enabled: boolean
}

export function useSeoMetasTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<
  PagedResult<SeoMetaRow>
> {
  return useQuery({
    queryKey: [
      "seo-metas",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<SeoMetaRow>> => {
      return apiParam.seoMetas.list<SeoMetaRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        ...filters,
      })
    },
  })
}
