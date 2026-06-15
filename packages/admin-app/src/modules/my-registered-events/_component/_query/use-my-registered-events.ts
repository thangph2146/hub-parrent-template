"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAdminApi, useAdminAuth } from "@workspace/admin-app/runtime"
import {
  cancelMyEventRegistration,
  computeMyRegisteredEventStats,
  fetchMyRegisteredEvents,
  type MyRegisteredEvent,
} from "../../_lib/my-registered-events"

export function useMyRegisteredEvents() {
  const api = useAdminApi()
  const { user: session, isLoading: authLoading } = useAdminAuth()
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
      setRows(await fetchMyRegisteredEvents(api))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải dữ liệu."
      setError(message)
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
    }
  }, [api, session?.id])

  useEffect(() => {
    if (authLoading) return
    void load()
  }, [authLoading, load])

  const stats = useMemo(
    () => computeMyRegisteredEventStats(rows),
    [rows],
  )

  const cancelRegistration = useCallback(
    async (row: MyRegisteredEvent) => {
      setCancellingId(row.id)
      try {
        const updated = await cancelMyEventRegistration(api, row.id)
        setRows((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        )
        toast.success("Đã hủy đăng ký sự kiện.")
        return updated
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Không thể hủy đăng ký.",
        )
        throw err
      } finally {
        setCancellingId(null)
      }
    },
    [api],
  )

  return {
    session,
    rows,
    setRows,
    loading: loading || authLoading,
    error,
    load,
    stats,
    cancellingId,
    cancelRegistration,
  }
}
