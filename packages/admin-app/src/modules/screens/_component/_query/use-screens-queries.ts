import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@workspace/admin-app/lib/fetch-all-admin-list"
import type { StoreSyncSdk } from "@workspace/api-client"
import type { ScreenDetail, ScreenRow } from "../shared/types"

export const screenDetailQueryKey = (id: string) =>
  ["screens", "detail", id] as const

export function prefetchScreenDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, screenDetailQueryKey(id), () =>
    api.screens.get<ScreenDetail>(id)
  )
}

export function useScreenDetailQuery(api: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      screenDetailQueryKey(id),
      async () => api.screens.get<ScreenDetail>(id),
      id
    ),
  })
}
export function useScreensListQuery(
  api: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
) {
  return useQuery({
    queryKey: ["screens", "list", filters],
    queryFn: async () => {
      const items: ScreenRow[] = []
      let page = 1,
        total = Infinity
      while (items.length < total) {
        const r = await api.screens.list<ScreenRow>({
          page,
          limit: ADMIN_LIST_EXPORT_FETCH_LIMIT,
          status: "active",
          filters,
        })
        items.push(...r.items)
        total = r.total
        if (!r.items.length) break
        page++
      }
      return items
    },
    enabled,
  })
}
export function useScreensTrashQuery({
  api,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: {
  api: StoreSyncSdk
  trashPage: number
  trashPageSize: number
  debouncedTrashQ: string
  enabled: boolean
  filters?: Record<string, string>
}) {
  return useQuery({
    queryKey: [
      "screens",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: () =>
      api.screens.list<ScreenRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters,
      }),
  })
}
