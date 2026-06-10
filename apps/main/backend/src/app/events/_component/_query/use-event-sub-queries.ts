import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list"
import { useQuery } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import type { EventLiveQueryOptions } from "./use-events-queries"

type Dict = Record<string, unknown>

const LIVE_LIST_LIMIT = 200

function liveQueryOptions(eventId: string, options?: EventLiveQueryOptions) {
  return {
    enabled: !!eventId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: Boolean(options?.refetchInterval),
    refetchOnWindowFocus: true,
  }
}

export function useEventRegistrationsQuery(
  apiParam: StoreSyncSdk,
  eventId: string,
  options?: EventLiveQueryOptions
): UseQueryResult<Dict[]> {
  return useQuery({
    queryKey: ["events", eventId, "registrations"],
    queryFn: async (): Promise<Dict[]> => {
      const result = await apiParam.eventRegistrations.list<Dict>({
        eventId,
        limit: LIVE_LIST_LIMIT,
      })
      return result.items
    },
    ...liveQueryOptions(eventId, options),
    /** Luôn re-render bảng khi patch cache optimistic (tránh structural sharing giữ reference cũ). */
    structuralSharing: false,
  })
}

export function useEventCheckinsQuery(
  apiParam: StoreSyncSdk,
  eventId: string,
  options?: EventLiveQueryOptions
): UseQueryResult<Dict[]> {
  return useQuery({
    queryKey: ["events", eventId, "checkins"],
    queryFn: async (): Promise<Dict[]> => {
      const result = await apiParam.eventCheckins.list<Dict>({
        eventId,
        limit: LIVE_LIST_LIMIT,
      })
      return result.items
    },
    ...liveQueryOptions(eventId, options),
  })
}

export function useEventCheckoutsQuery(
  apiParam: StoreSyncSdk,
  eventId: string,
  options?: EventLiveQueryOptions
): UseQueryResult<Dict[]> {
  return useQuery({
    queryKey: ["events", eventId, "checkouts"],
    queryFn: async (): Promise<Dict[]> => {
      const result = await apiParam.eventCheckouts.list<Dict>({
        eventId,
        limit: LIVE_LIST_LIMIT,
      })
      return result.items
    },
    ...liveQueryOptions(eventId, options),
  })
}

export function useEventSpeakersQuery(
  apiParam: StoreSyncSdk,
  eventId: string
): UseQueryResult<Dict[]> {
  return useQuery({
    queryKey: ["events", eventId, "speakers"],
    queryFn: async (): Promise<Dict[]> => {
      const result = await apiParam.eventSpeakers.list<Dict>({
        eventId,
        limit: ADMIN_LIST_EXPORT_FETCH_LIMIT,
      })
      return result.items
    },
    enabled: !!eventId,
  })
}
