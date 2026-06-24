"use client"
import { useAdminApi } from "@workspace/admin-app/runtime"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useEventRegistrationsQuery, useEventDetailQuery } from "../_query"
import { syncEventAttendanceUi } from "./event-attendance-sync"
import {
  eventRegistrationsPollInterval,
  useEventAttendanceSocket,
} from "./use-event-attendance-socket"
import { useEventHanetReconcile } from "./use-event-hanet-reconcile"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/hanet/_component"
import type {
  EventAttendanceSocketPayload,
  EventHanetSyncSocketPayload,
} from "./use-event-attendance-socket"

const MAX_HANET_SYNC_LOG = 50

type EventAttendanceContextValue = {
  connected: boolean
  socketError: boolean
  lastPayload: EventAttendanceSocketPayload | null
  hanetSyncLog: EventHanetSyncSocketPayload[]
  /** Tăng mỗi lần check-in/out — ép bảng re-render tức thì. */
  liveRevision: number
  applyAttendance: (payload: EventAttendanceSocketPayload) => void
  reconcileHanet: () => void
  isReconcilingHanet: boolean
}

const EventAttendanceContext =
  createContext<EventAttendanceContextValue | null>(null)

/** Socket + cache đăng ký luôn sống trên trang chi tiết sự kiện. */
export function EventAttendanceProvider({
  eventId,
  enabled = true,
  children,
}: {
  eventId: string
  enabled?: boolean
  children: ReactNode
}) {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const [liveRevision, setLiveRevision] = useState(0)
  const [lastPayload, setLastPayload] =
    useState<EventAttendanceSocketPayload | null>(null)
  const [hanetSyncLog, setHanetSyncLog] = useState<
    EventHanetSyncSocketPayload[]
  >([])

  const applyAttendance = useCallback(
    (payload: EventAttendanceSocketPayload) => {
      setLastPayload(payload)
      setLiveRevision((r) => r + 1)
      syncEventAttendanceUi(queryClient, eventId, payload)
    },
    [queryClient, eventId]
  )

  const appendHanetSync = useCallback(
    (payload: EventHanetSyncSocketPayload) => {
      setHanetSyncLog((prev) => [payload, ...prev].slice(0, MAX_HANET_SYNC_LOG))

      if (
        payload.eventId != null &&
        String(payload.eventId) === eventId &&
        (payload.kind === "checkin" || payload.kind === "checkout") &&
        payload.registrationId
      ) {
        applyAttendance({
          kind: payload.kind,
          eventId,
          at: payload.at,
          email: String(payload.email ?? ""),
          fullName: String(payload.fullName ?? payload.personName ?? ""),
          source: "hanet",
          registrationId: String(payload.registrationId),
          deviceId: payload.deviceId ?? null,
          deviceName: payload.deviceName ?? null,
          duplicate: payload.duplicate,
        })
      }
    },
    [applyAttendance, eventId],
  )

  const { connected, socketError } = useEventAttendanceSocket(
    eventId,
    enabled,
    applyAttendance,
    appendHanetSync
  )

  const { data: hanetStatus } = useHanetStatusQuery(eventId)
  const { data: eventDetail } = useEventDetailQuery(api, eventId, {
    enabled: enabled && !!eventId,
    staleTime: 120_000,
    refetchInterval: false,
  })
  const { reconcile, isReconciling } = useEventHanetReconcile({
    eventId,
    enabled: enabled && !!eventId,
    placeId: hanetStatus?.defaultPlaceId,
    eventDay: eventDetail?.startDate ?? eventDetail?.checkinStart ?? null,
  })

  const pollMs = eventRegistrationsPollInterval(connected)

  useEventRegistrationsQuery(api, eventId, {
    enabled: enabled && !!eventId,
    refetchInterval: pollMs,
  })

  const value = useMemo<EventAttendanceContextValue>(
    () => ({
      connected,
      socketError,
      lastPayload,
      hanetSyncLog,
      liveRevision,
      applyAttendance,
      reconcileHanet: reconcile,
      isReconcilingHanet: isReconciling,
    }),
    [
      applyAttendance,
      connected,
      hanetSyncLog,
      isReconciling,
      lastPayload,
      liveRevision,
      reconcile,
      socketError,
    ]
  )

  return (
    <EventAttendanceContext.Provider value={value}>
      {children}
    </EventAttendanceContext.Provider>
  )
}

export function useEventAttendanceContext(): EventAttendanceContextValue {
  const ctx = useContext(EventAttendanceContext)
  if (!ctx) {
    return {
      connected: false,
      socketError: false,
      lastPayload: null,
      hanetSyncLog: [],
      liveRevision: 0,
      applyAttendance: () => {},
      reconcileHanet: () => {},
      isReconcilingHanet: false,
    }
  }
  return ctx
}
