import type { EventHanetSyncSocketPayload } from "@workspace/api-client/realtime"

/** Prefix React Query cho GET check-in HANET (ngày / timestamp). */
export const HANET_CHECKINS_QUERY_KEY = ["hanet", "checkins"] as const

/** Custom event — `useAdminRealtimeSync` phát khi webhook check-in/out. */
export const HANET_CHECKIN_SYNC_EVENT = "hub:hanet-checkin-sync"

/** Polling dự phòng khi bật realtime (webhook vẫn là nguồn chính). */
export const HANET_CHECKIN_LIVE_POLL_MS = 45_000

export const HANET_CHECKIN_NEW_ROW_HIGHLIGHT_MS = 12_000

export function dispatchHanetCheckinSyncEvent(
  payload: EventHanetSyncSocketPayload,
): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<EventHanetSyncSocketPayload>(HANET_CHECKIN_SYNC_EVENT, {
      detail: payload,
    }),
  )
}

export function isHanetCheckinSyncPayload(
  payload: EventHanetSyncSocketPayload,
): boolean {
  return payload.kind === "checkin" || payload.kind === "checkout"
}
