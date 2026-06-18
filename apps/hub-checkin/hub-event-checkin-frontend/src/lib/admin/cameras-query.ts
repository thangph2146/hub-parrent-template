import { prefetchAdminDetailQuery } from "@/lib/admin/admin-detail-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/admin/fetch-all-admin-list"
import type { StoreSyncSdk } from "@workspace/api-client"

export type CameraRow = {
  id: string | number
  name: string
  code?: string | null
  deviceId?: string | null
}

export type CameraDetail = CameraRow & Record<string, unknown>

export const cameraDetailQueryKey = (id: string) =>
  ["cameras", "detail", id] as const

export function prefetchCameraDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string,
) {
  return prefetchAdminDetailQuery(queryClient, cameraDetailQueryKey(id), () =>
    api.cameras.get<CameraDetail>(id),
  )
}

export function useCamerasListQuery(
  api: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>,
) {
  return useQuery({
    queryKey: ["cameras", "list", filters],
    queryFn: async () => {
      const items: CameraRow[] = []
      let page = 1
      let total = Infinity
      while (items.length < total) {
        const r = await api.cameras.list<CameraRow>({
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
