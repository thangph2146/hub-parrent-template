import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/admin/fetch-all-admin-list"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { EventDetail, EventRow } from "../types"

export type EventLiveQueryOptions = {
  enabled?: boolean
  refetchInterval?: number | false
}

export const eventDetailQueryKey = (id: string) =>
  ["events", "detail", id] as const

export function prefetchEventDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, eventDetailQueryKey(id), () =>
    apiParam.events.get<EventDetail>(id)
  )
}

export function useEventDetailQuery(
  apiParam: StoreSyncSdk,
  id: string,
  options?: EventLiveQueryOptions
) {
  return useQuery({
    ...adminDetailQueryOptions(
      eventDetailQueryKey(id),
      async () => apiParam.events.get<EventDetail>(id),
      id
    ),
    ...options,
    enabled: !!id && (options?.enabled ?? true),
  })
}

export function useEventsListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<EventRow[]> {
  return useQuery({
    queryKey: ["events", "list", filters],
    queryFn: async (): Promise<EventRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
      const items: EventRow[] = []
      let page = 1
      let total = Number.POSITIVE_INFINITY
      while (items.length < total) {
        const result = await apiParam.events.list<EventRow>({
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

export function useEventsTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<
  PagedResult<EventRow>
> {
  return useQuery({
    queryKey: [
      "events",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<EventRow>> =>
      apiParam.events.list<EventRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters,
      }),
  })
}
