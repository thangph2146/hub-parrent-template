"use client"

import { api } from "@workspace/admin-app/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { HanetAdminStatusDto } from "@workspace/api-client"

export function hanetStatusQueryKey(eventId?: string) {
  return ["admin", "hanet", "status", eventId ?? "global"] as const
}

export function useHanetStatusQuery(
  eventId?: string,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: hanetStatusQueryKey(eventId),
    queryFn: () => api.hanet.status(eventId),
    staleTime: options?.refetchInterval ? 0 : 60_000,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: Boolean(options?.refetchInterval),
  })
}

export type { HanetAdminStatusDto }
