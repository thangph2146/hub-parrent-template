import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { SpeakerDetail, SpeakerRow } from "../types"

export const speakerDetailQueryKey = (id: string) =>
  ["speakers", "detail", id] as const

export function prefetchSpeakerDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, speakerDetailQueryKey(id), () =>
    apiParam.speakers.get<SpeakerDetail>(id)
  )
}

export function useSpeakerDetailQuery(apiParam: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      speakerDetailQueryKey(id),
      async () => apiParam.speakers.get<SpeakerDetail>(id),
      id
    ),
  })
}

export function useSpeakersListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<SpeakerRow[]> {
  return useQuery({
    queryKey: ["speakers", "list", filters],
    queryFn: async (): Promise<SpeakerRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
      const items: SpeakerRow[] = []
      let page = 1
      let total = Number.POSITIVE_INFINITY

      while (items.length < total) {
        const result = await apiParam.speakers.list<SpeakerRow>({
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

export function useSpeakersTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<
  PagedResult<SpeakerRow>
> {
  return useQuery({
    queryKey: [
      "speakers",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<SpeakerRow>> => {
      return apiParam.speakers.list<SpeakerRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters,
      })
    },
  })
}
