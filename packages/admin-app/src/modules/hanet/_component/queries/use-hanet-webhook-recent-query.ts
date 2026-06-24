"use client"

import { useAdminApi } from "@workspace/admin-app/runtime"
import { useQuery } from "@tanstack/react-query"
import type { HanetWebhookIngestEntry } from "@workspace/api-client"

export function hanetWebhookRecentQueryKey(limit = 20) {
  return ["admin", "hanet", "webhook", "recent", limit] as const
}

/** Poll webhook gần đây (in-memory trên instance API) — dùng khi bật realtime check-in. */
export function useHanetWebhookRecentQuery(
  enabled: boolean,
  options?: { limit?: number; refetchInterval?: number | false },
) {
  const api = useAdminApi()
  const limit = options?.limit ?? 20
  return useQuery({
    queryKey: hanetWebhookRecentQueryKey(limit),
    queryFn: () => api.hanet.webhookRecent(limit),
    enabled,
    staleTime: 0,
    refetchInterval: options?.refetchInterval ?? false,
    refetchIntervalInBackground: Boolean(options?.refetchInterval),
  })
}

export type { HanetWebhookIngestEntry }
