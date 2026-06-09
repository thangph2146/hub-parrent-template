import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { MajorDetail, MajorRow } from "../types"

export const majorDetailQueryKey = (id: string) =>
  ["majors", "detail", id] as const

export function prefetchMajorDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, majorDetailQueryKey(id), () =>
    apiParam.majors.get<MajorDetail>(id)
  )
}

export function useMajorDetailQuery(apiParam: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      majorDetailQueryKey(id),
      async () => apiParam.majors.get<MajorDetail>(id),
      id
    ),
  })
}

export function useMajorsListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<MajorRow[]> {
  return useQuery({
    queryKey: ["majors", "list", filters],
    queryFn: async (): Promise<MajorRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
      const items: MajorRow[] = []
      let page = 1
      let total = Number.POSITIVE_INFINITY

      while (items.length < total) {
        const result = await apiParam.majors.list<MajorRow>({
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

export function useMajorsTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<
  PagedResult<MajorRow>
> {
  return useQuery({
    queryKey: [
      "majors",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<MajorRow>> => {
      return apiParam.majors.list<MajorRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        ...filters,
      })
    },
  })
}
