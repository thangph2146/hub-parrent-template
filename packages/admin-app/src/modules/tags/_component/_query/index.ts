import { useAdminApi } from "@workspace/admin-app/runtime"
import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { TagDetail, TagRow } from "../shared/types"
import { buildTagsFilterQuery, toFilterQuery } from "../shared/utils"

export const tagDetailQueryKey = (tagId: string) =>
  ["media", "tags", "detail", tagId] as const

export function prefetchTagDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  tagId: string
) {
  return prefetchAdminDetailQuery(queryClient, tagDetailQueryKey(tagId), () =>
    api.tags.get<TagDetail>(tagId)
  )
}

export function useTagDetailQuery(api: StoreSyncSdk, tagId: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      tagDetailQueryKey(tagId),
      async () => api.tags.get<TagDetail>(tagId),
      tagId
    ),
  })
}

export function useTagsListQuery(
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<TagRow[]> {
  const api = useAdminApi()
  return useQuery({
    queryKey: ["media", "tags", "tree", filters],
    queryFn: async (): Promise<TagRow[]> => {
      const result = await api.tags.list<TagRow>({
        page: 1,
        limit: 500,
        status: "active",
        filters,
      })
      return result.items
    },
    enabled,
  })
}

export interface UseTrashQueryProps {
  api: StoreSyncSdk
  trashPage: number
  trashPageSize: number
  debouncedTrashQ: string
  trashColumnFilters: { id: string; value: unknown }[]
  enabled: boolean
  filters?: Record<string, string>
}

export function useTrashQuery({
  api,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  trashColumnFilters,
  enabled,
  filters,
}: UseTrashQueryProps): UseQueryResult<PagedResult<TagRow>> {
  return useQuery({
    queryKey: [
      "media",
      "tags",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      trashColumnFilters,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<TagRow>> => {
      return api.tags.list<TagRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        ...toFilterQuery(buildTagsFilterQuery(trashColumnFilters)),
        ...filters,
      })
    },
  })
}
