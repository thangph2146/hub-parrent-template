"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAdminApi } from "@workspace/admin-app/runtime"
import type { EventHanetReconcileResult } from "@workspace/api-client"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"

/** Khoảng cách tối thiểu giữa 2 lần đối soát (mọi tab / remount). */
const MIN_RECONCILE_INTERVAL_MS = 45_000
/** Backoff khi server trả 429. */
const RECONCILE_429_COOLDOWN_MS = 90_000

function buildReconcileBody(
  placeId?: string | null,
  eventDay?: string | null,
): { placeId?: string; date?: string } {
  const body: { placeId?: string; date?: string } = {}
  if (placeId?.trim()) body.placeId = placeId.trim()
  if (eventDay?.trim()) body.date = eventDay.trim().slice(0, 10)
  return body
}

type ReconcileGate = {
  inFlight: boolean
  cooldownUntil: number
}

/** Khóa theo eventId — tránh spam khi Strict Mode / HMR / nhiều remount. */
const reconcileGates = new Map<string, ReconcileGate>()

function getReconcileGate(eventId: string): ReconcileGate {
  let gate = reconcileGates.get(eventId)
  if (!gate) {
    gate = { inFlight: false, cooldownUntil: 0 }
    reconcileGates.set(eventId, gate)
  }
  return gate
}

function isRateLimitedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const status = (err as { status?: number }).status
  if (status === 429) return true
  const message = (err as { message?: string }).message ?? ""
  return /too many requests|429/i.test(message)
}

function canStartReconcile(eventId: string): boolean {
  const gate = getReconcileGate(eventId)
  const now = Date.now()
  return !gate.inFlight && now >= gate.cooldownUntil
}

export function useEventHanetReconcile(options: {
  eventId: string
  enabled: boolean
  placeId?: string | null
  eventDay?: string | null
}) {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const { eventId, enabled, placeId, eventDay } = options
  const [lastResult, setLastResult] =
    useState<EventHanetReconcileResult | null>(null)
  const placeIdRef = useRef(placeId)
  const eventDayRef = useRef(eventDay)

  useEffect(() => {
    placeIdRef.current = placeId
    eventDayRef.current = eventDay
  }, [placeId, eventDay])

  const invalidateEventQueries = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["events", eventId, "registrations"],
    })
    void queryClient.invalidateQueries({
      queryKey: ["events", "detail", eventId],
    })
  }, [queryClient, eventId])

  const mutation = useAdminMutation({
    mutationKey: ["hanet", "events", eventId, "reconcile-checkins"],
    toast: {
      loading: "Đang đồng bộ check-in HANET…",
      success: (result) => {
        const data = result as EventHanetReconcileResult
        if (data.applied > 0) {
          return `Đã cập nhật ${data.applied} đăng ký từ HANET`
        }
        if (data.total === 0) {
          return "Không có bản ghi HANET trong ngày sự kiện"
        }
        return `Đối soát ${data.total} bản ghi — không có thay đổi mới`
      },
      error: (err) =>
        err instanceof Error ? err.message : "Không đồng bộ được HANET",
    },
    mutationFn: async () => {
      if (!canStartReconcile(eventId)) {
        throw new Error("Đang đồng bộ HANET hoặc vừa đối soát — vui lòng đợi")
      }

      const gate = getReconcileGate(eventId)
      gate.inFlight = true
      const startedAt = Date.now()

      try {
        const result = await api.hanet.reconcileEventCheckins(
          eventId,
          buildReconcileBody(placeIdRef.current, eventDayRef.current),
        )
        gate.cooldownUntil = startedAt + MIN_RECONCILE_INTERVAL_MS
        return result
      } catch (err) {
        if (isRateLimitedError(err)) {
          gate.cooldownUntil = Date.now() + RECONCILE_429_COOLDOWN_MS
        }
        throw err
      } finally {
        gate.inFlight = false
      }
    },
    onSuccess: (result) => {
      setLastResult(result)
      if (result.applied > 0) {
        invalidateEventQueries()
      }
    },
  })

  const mutateRef = useRef(mutation.mutate)

  useEffect(() => {
    mutateRef.current = mutation.mutate
  }, [mutation.mutate])

  /** Chỉ gọi thủ công (nút) — không auto poll. */
  const reconcile = useCallback(() => {
    if (!enabled || !eventId || !canStartReconcile(eventId)) return
    mutateRef.current()
  }, [enabled, eventId])

  return {
    reconcile,
    isReconciling: mutation.isPending,
    lastResult,
  }
}
