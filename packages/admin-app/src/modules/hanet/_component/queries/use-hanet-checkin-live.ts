"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import type { EventHanetSyncSocketPayload } from "@workspace/api-client/realtime"
import {
  ADMIN_SOCKET_PATH,
  getAdminSocketOrigin,
  resolveAdminSocketAuth,
} from "@workspace/admin-app/lib/admin-socket"
import {
  dispatchHanetCheckinSyncEvent,
  HANET_CHECKIN_SYNC_EVENT,
  hanetSyncMatchesCheckinView,
  isHanetCheckinSyncPayload,
} from "../shared/hanet-checkin-realtime"

type CheckinViewFilter = {
  placeId: string
  mode: "day" | "timestamp"
  date?: string
  fromAt?: string
  toAt?: string
}

function applySyncPayload(
  payload: EventHanetSyncSocketPayload,
  filter: CheckinViewFilter,
  onMatch: (payload: EventHanetSyncSocketPayload) => void,
): void {
  if (!isHanetCheckinSyncPayload(payload)) return
  if (!hanetSyncMatchesCheckinView(payload, filter)) return
  onMatch(payload)
  dispatchHanetCheckinSyncEvent(payload)
}

/** Socket riêng + custom event — hiển thị check-in ngay khi webhook tới. */
export function useHanetCheckinLive(
  enabled: boolean,
  filter: CheckinViewFilter,
) {
  const filterRef = useRef(filter)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [lastPayload, setLastPayload] =
    useState<EventHanetSyncSocketPayload | null>(null)
  const [syncRevision, setSyncRevision] = useState(0)
  const [socketConnected, setSocketConnected] = useState(false)
  const [socketError, setSocketError] = useState(false)

  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  const handlePayload = (payload: EventHanetSyncSocketPayload) => {
    setLastPayload(payload)
    setLastSyncAt(new Date())
    setSyncRevision((value) => value + 1)
  }

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const onSync = (event: Event) => {
      const payload = (event as CustomEvent<EventHanetSyncSocketPayload>).detail
      if (!payload?.kind) return
      applySyncPayload(payload, filterRef.current, handlePayload)
    }

    window.addEventListener(HANET_CHECKIN_SYNC_EVENT, onSync)
    return () => window.removeEventListener(HANET_CHECKIN_SYNC_EVENT, onSync)
  }, [enabled])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setSocketConnected(false)
      setSocketError(false)
      return
    }

    const auth = resolveAdminSocketAuth()
    if (!auth) {
      setSocketConnected(false)
      setSocketError(true)
      return
    }

    let disposed = false
    const socket: Socket = io(getAdminSocketOrigin(), {
      path: ADMIN_SOCKET_PATH,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 12,
      withCredentials: true,
      auth,
    })

    const onConnect = () => {
      if (disposed) return
      setSocketConnected(true)
      setSocketError(false)
    }

    const onDisconnect = () => {
      if (disposed) return
      setSocketConnected(false)
    }

    const onConnectError = () => {
      if (disposed) return
      setSocketConnected(false)
      setSocketError(true)
    }

    const onHanetSync = (payload: EventHanetSyncSocketPayload) => {
      if (disposed || !payload?.kind) return
      applySyncPayload(payload, filterRef.current, handlePayload)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)
    socket.on("event:hanet-sync", onHanetSync)

    return () => {
      disposed = true
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      socket.off("event:hanet-sync", onHanetSync)
      socket.close()
      setSocketConnected(false)
      setSocketError(false)
    }
  }, [enabled])

  return {
    lastSyncAt,
    lastPayload,
    syncRevision,
    socketConnected,
    socketError,
  }
}
