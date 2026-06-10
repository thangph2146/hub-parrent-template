"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSyncExternalStore } from "react"
import { toast } from "sonner"
import {
  readEventSession,
  subscribeEventSession,
  type EventSessionUser,
} from "@/lib/event-auth"
import {
  cancelMyEventRegistration,
  computeMyRegisteredEventStats,
  fetchMyRegisteredEvents,
  type MyRegisteredEvent,
} from "@/lib/my-registered-events"

export function useEventSession(): EventSessionUser | null {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null
  )
}

export function useMyRegisteredEvents() {
  const session = useEventSession()
  const [rows, setRows] = useState<MyRegisteredEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!session?.id) {
      setRows([])
      setLoading(false)
      return
    }

    if (!options?.silent) {
      setLoading(true)
    }
    setError(null)
    try {
      setRows(await fetchMyRegisteredEvents())
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải dữ liệu."
      setError(message)
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
    }
  }, [session?.id])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(
    () => computeMyRegisteredEventStats(rows),
    [rows]
  )

  const cancelRegistration = useCallback(async (row: MyRegisteredEvent) => {
    setCancellingId(row.id)
    try {
      const updated = await cancelMyEventRegistration(row.id)
      setRows((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      toast.success("Đã hủy đăng ký sự kiện.")
      return updated
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể hủy đăng ký.")
      throw err
    } finally {
      setCancellingId(null)
    }
  }, [])

  return {
    session,
    rows,
    setRows,
    loading,
    error,
    load,
    stats,
    cancellingId,
    cancelRegistration,
  }
}
