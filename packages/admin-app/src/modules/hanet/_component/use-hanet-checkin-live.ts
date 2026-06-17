"use client"

import { useEffect, useState } from "react"
import type { EventHanetSyncSocketPayload } from "@workspace/api-client/realtime"
import { HANET_CHECKIN_SYNC_EVENT } from "@workspace/admin-app/lib/hanet-checkin-realtime"

/** Lắng nghe webhook check-in/out (qua global admin socket) để cập nhật UI. */
export function useHanetCheckinLive(enabled: boolean) {
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [lastPayload, setLastPayload] =
    useState<EventHanetSyncSocketPayload | null>(null)
  const [syncRevision, setSyncRevision] = useState(0)

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const onSync = (event: Event) => {
      const payload = (event as CustomEvent<EventHanetSyncSocketPayload>).detail
      if (!payload?.kind) return
      setLastPayload(payload)
      setLastSyncAt(new Date())
      setSyncRevision((value) => value + 1)
    }

    window.addEventListener(HANET_CHECKIN_SYNC_EVENT, onSync)
    return () => window.removeEventListener(HANET_CHECKIN_SYNC_EVENT, onSync)
  }, [enabled])

  return { lastSyncAt, lastPayload, syncRevision }
}
