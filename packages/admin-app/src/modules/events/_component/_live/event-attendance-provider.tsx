"use client"
import { api } from "@workspace/admin-app/lib/api"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useEventRegistrationsQuery } from "../_query"
import { syncEventAttendanceUi } from "./event-attendance-sync"
import {
  eventRegistrationsPollInterval,
  useEventAttendanceSocket,
} from "./use-event-attendance-socket"
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

  const appendHanetSync = useCallback((payload: EventHanetSyncSocketPayload) => {
    setHanetSyncLog((prev) => [payload, ...prev].slice(0, MAX_HANET_SYNC_LOG))
  }, [])

  const { connected, socketError } = useEventAttendanceSocket(
    eventId,
    enabled,
    applyAttendance,
    appendHanetSync
  )

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
    }),
    [
      applyAttendance,
      connected,
      hanetSyncLog,
      lastPayload,
      liveRevision,
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
    }
  }
  return ctx
}
