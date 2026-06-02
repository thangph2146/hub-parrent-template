"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Activity,
  LogIn,
  LogOut,
  Pause,
  Play,
  Radio,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card"
import { cn } from "@ui/lib/utils"
import { api } from "@/lib/api"
import type { EventDetail } from "../types"
import {
  useEventCheckoutsQuery,
  useEventDetailQuery,
  useEventRegistrationsQuery,
  type EventLiveQueryOptions,
} from "../_query"
import {
  asAttendanceBool,
  mergeRegistrationRowsForDisplay,
} from "./event-attendance-sync"
import { useEventAttendanceContext } from "./event-attendance-provider"
import { EventHanetConfigCard } from "./event-hanet-config-card"

const LIVE_POLL_MS = 15_000
const LIVE_POLL_SOCKET_MS = 60_000
const NEW_HIGHLIGHT_MS = 12_000

type Dict = Record<string, unknown>

type ActivityKind = "checkin" | "checkout"

type ActivityItem = {
  id: string
  kind: ActivityKind
  at: string
  email: string
  fullName: string
  detail?: string
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function checkinTypeLabel(value: unknown): string {
  const v = Number(value)
  if (v === 2) return "Face ID"
  if (v === 1) return "QR Code"
  if (v === 3) return "Thủ công"
  return "—"
}

function buildActivities(
  registrations: Dict[],
  checkouts: Dict[],
): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const row of registrations) {
    if (!asAttendanceBool(row.hasCheckin)) continue
    const at = String(row.updatedAt ?? row.registeredAt ?? "")
    if (!at) continue
    items.push({
      id: `checkin:${String(row.id)}`,
      kind: "checkin",
      at,
      email: String(row.email ?? ""),
      fullName: String(row.fullName ?? ""),
      detail: checkinTypeLabel(row.checkinMethod),
    })
  }

  for (const row of checkouts) {
    const at = String(row.checkoutTime ?? "")
    if (!at) continue
    items.push({
      id: `checkout:${String(row.id)}`,
      kind: "checkout",
      at,
      email: String(row.email ?? ""),
      fullName: String(row.fullName ?? ""),
      detail: "Check-out",
    })
  }

  return items.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
}

export function EventLiveMonitorTab({
  eventId,
  initialStats,
}: {
  eventId: string
  initialStats: Pick<
    EventDetail,
    "totalRegistrations" | "totalCheckins" | "totalCheckouts"
  >
}) {
  const [liveEnabled, setLiveEnabled] = useState(true)
  const {
    connected: socketConnected,
    lastPayload,
    liveRevision,
  } = useEventAttendanceContext()
  const pollOptions = useMemo<EventLiveQueryOptions>(
    () => ({
      enabled: liveEnabled,
      refetchInterval: liveEnabled
        ? socketConnected
          ? LIVE_POLL_SOCKET_MS
          : LIVE_POLL_MS
        : false,
    }),
    [liveEnabled, socketConnected],
  )

  const detailQuery = useEventDetailQuery(api, eventId, pollOptions)
  const checkoutsQuery = useEventCheckoutsQuery(api, eventId, pollOptions)
  const registrationsQuery = useEventRegistrationsQuery(api, eventId, pollOptions)

  const checkouts = checkoutsQuery.data ?? []
  const registrations = useMemo(
    () =>
      mergeRegistrationRowsForDisplay(
        registrationsQuery.data,
        lastPayload,
      ),
    [registrationsQuery.data, lastPayload, liveRevision],
  )

  const stats = detailQuery.data ?? initialStats

  const hanetCameras = useMemo(() => {
    const d = detailQuery.data
    if (!d) return undefined
    return {
      checkinCameraName: d.checkinCameraName ?? null,
      checkinCameraCode: d.checkinCameraCode ?? null,
      checkoutCameraName: d.checkoutCameraName ?? null,
      checkoutCameraCode: d.checkoutCameraCode ?? null,
    }
  }, [detailQuery.data])

  const activities = useMemo(
    () => buildActivities(registrations, checkouts),
    [registrations, checkouts],
  )

  const pendingCheckin = useMemo(
    () =>
      registrations.filter(
        (r) => !asAttendanceBool(r.hasCheckin) && r.status !== 2,
      ).length,
    [registrations],
  )

  const seenIdsRef = useRef<Set<string>>(new Set())
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const isFetching =
    detailQuery.isFetching ||
    registrationsQuery.isFetching ||
    checkoutsQuery.isFetching

  useEffect(() => {
    if (!liveEnabled || isFetching) return

    const currentIds = new Set(activities.map((a) => a.id))
    const fresh = new Set<string>()

    if (seenIdsRef.current.size > 0) {
      for (const id of currentIds) {
        if (!seenIdsRef.current.has(id)) fresh.add(id)
      }
    }

    seenIdsRef.current = currentIds
    setLastSyncedAt(new Date())

    if (fresh.size === 0) return

    setNewIds((prev) => new Set([...prev, ...fresh]))
    const timer = window.setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev)
        for (const id of fresh) next.delete(id)
        return next
      })
    }, NEW_HIGHLIGHT_MS)

    return () => window.clearTimeout(timer)
  }, [activities, isFetching, liveEnabled])

  useEffect(() => {
    if (!liveEnabled || !lastPayload) return
    const id =
      lastPayload.kind === "checkin"
        ? `checkin:${lastPayload.registrationId ?? lastPayload.checkinId ?? lastPayload.email}`
        : lastPayload.kind === "checkout"
          ? `checkout:${lastPayload.registrationId ?? lastPayload.email}`
          : null
    if (!id) return
    setNewIds((prev) => new Set([...prev, id]))
    const timer = window.setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, NEW_HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [lastPayload, liveRevision, liveEnabled])

  const isLoading =
    registrationsQuery.isLoading ||
    checkoutsQuery.isLoading ||
    registrationsQuery.isLoading

  return (
    <div className="space-y-4">
      <EventHanetConfigCard eventId={eventId} cameras={hanetCameras} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "relative flex size-2.5 rounded-full",
              liveEnabled ? "bg-emerald-500" : "bg-muted-foreground/40",
            )}
          >
            {liveEnabled ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            ) : null}
          </span>
          <Radio className="size-4 text-primary" />
          {liveEnabled && socketConnected ? (
            <Badge variant="secondary" className="text-[10px]">
              HANET live
            </Badge>
          ) : null}
          <div>
            <p className="text-sm font-medium">Theo dõi realtime</p>
            <p className="text-xs text-muted-foreground">
              {liveEnabled
                ? socketConnected
                  ? "HANET → Socket đã kết nối · polling dự phòng 60s"
                  : `Polling mỗi ${LIVE_POLL_MS / 1000}s (chờ Socket)`
                : "Đã tạm dừng"}
              {lastSyncedAt
                ? ` · Cập nhật ${formatDateTime(lastSyncedAt.toISOString())}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && liveEnabled ? (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setLiveEnabled((v) => !v)}
          >
            {liveEnabled ? (
              <>
                <Pause className="size-3.5" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Tiếp tục
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              void detailQuery.refetch()
              void registrationsQuery.refetch()
              void checkoutsQuery.refetch()
              void registrationsQuery.refetch()
            }}
          >
            <RefreshCw className="size-3.5" /> Làm mới ngay
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Đăng ký"
          value={stats.totalRegistrations}
          icon={<Users className="size-4 text-primary" />}
        />
        <StatCard
          label="Check-in"
          value={stats.totalCheckins}
          icon={<UserCheck className="size-4 text-emerald-600" />}
          tone="emerald"
        />
        <StatCard
          label="Check-out"
          value={stats.totalCheckouts}
          icon={<LogOut className="size-4 text-amber-600" />}
          tone="amber"
        />
        <StatCard
          label="Chưa check-in"
          value={pendingCheckin}
          icon={<Activity className="size-4 text-muted-foreground" />}
        />
      </div>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-5 text-primary" />
            Luồng hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Đang tải dữ liệu…
            </p>
          ) : activities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có check-in hoặc check-out nào.
            </p>
          ) : (
            <ul className="max-h-[min(520px,60vh)] space-y-2 overflow-y-auto pr-1">
              {activities.map((item) => {
                const isNew = newIds.has(item.id)
                const isCheckin = item.kind === "checkin"
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                      isNew
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/70 bg-muted/20",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        isCheckin
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-amber-500/15 text-amber-700",
                      )}
                    >
                      {isCheckin ? (
                        <LogIn className="size-4" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {item.fullName || item.email || "—"}
                        </p>
                        <Badge
                          variant={isCheckin ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {isCheckin ? "Check-in" : "Check-out"}
                        </Badge>
                        {isNew ? (
                          <Badge variant="outline" className="text-[10px]">
                            Mới
                          </Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.email}
                        {item.detail ? ` · ${item.detail}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {formatDateTime(item.at)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: ReactNode
  tone?: "emerald" | "amber"
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums",
          tone === "emerald" && "text-emerald-600",
          tone === "amber" && "text-amber-600",
          !tone && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  )
}
