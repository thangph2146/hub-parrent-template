import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { LocationDetail, LocationRow } from "../types"

export const locationDetailQueryKey = (id: string) =>
  ["locations", "detail", id] as const

export function prefetchLocationDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, locationDetailQueryKey(id), () =>
    apiParam.locations.get<LocationDetail>(id)
  )
}

export function useLocationDetailQuery(apiParam: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      locationDetailQueryKey(id),
      async () => apiParam.locations.get<LocationDetail>(id),
      id
    ),
  })
}

export function useLocationsListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<LocationRow[]> {
  return useQuery({
    queryKey: ["locations", "list", filters],
    queryFn: async (): Promise<LocationRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
      const items: LocationRow[] = []
      let page = 1
      let total = Number.POSITIVE_INFINITY

      while (items.length < total) {
        const result = await apiParam.locations.list<LocationRow>({
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

export function useLocationsTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<
  PagedResult<LocationRow>
> {
  return useQuery({
    queryKey: [
      "locations",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<LocationRow>> => {
      return apiParam.locations.list<LocationRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        ...filters,
      })
    },
  })
}
