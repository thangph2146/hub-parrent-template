"use client"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Activity,
  LogOut,
  Pause,
  Play,
  PlugZap,
  Radio,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react"
import { AdminDataTable } from "@ui/components/data-table"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import { buildEventDetailXlsxExport } from "@ui/components/admin"
import type { EventDetail } from "../shared/types"
import {
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
import { EventHanetSyncLog } from "./event-hanet-sync-log"
import {
  buildLiveActivitiesFromRegistrations,
  getEventLiveActivityColumns,
  getEventLiveActivityGlobalFilterText,
  type EventLiveActivityRow,
} from "./live-activity-columns"

const LIVE_POLL_MS = 15_000
const LIVE_POLL_SOCKET_MS = 60_000
const NEW_HIGHLIGHT_MS = 12_000

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

export function EventLiveMonitorTab({
  eventId,
  eventTitle,
  initialStats,
}: {
  eventId: string
  eventTitle?: string
  initialStats: Pick<
    EventDetail,
    "totalRegistrations" | "totalCheckins" | "totalCheckouts"
  >
}) {
  const api = useAdminApi()
  const [liveEnabled, setLiveEnabled] = useState(true)
  const {
    connected: socketConnected,
    socketError,
    lastPayload,
    liveRevision,
    hanetSyncLog,
    reconcileHanet,
    isReconcilingHanet,
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
    [liveEnabled, socketConnected]
  )

  const detailQuery = useEventDetailQuery(api, eventId, pollOptions)
  const registrationsQuery = useEventRegistrationsQuery(
    api,
    eventId,
    pollOptions
  )

  const registrations = useMemo(
    () => mergeRegistrationRowsForDisplay(registrationsQuery.data, lastPayload),
    [registrationsQuery.data, lastPayload]
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
    () => buildLiveActivitiesFromRegistrations(registrations),
    [registrations]
  )

  const activityColumns = useMemo(() => getEventLiveActivityColumns(), [])

  const pendingCheckin = useMemo(
    () =>
      registrations.filter(
        (r) => !asAttendanceBool(r.hasCheckin) && r.status !== 2
      ).length,
    [registrations]
  )

  const seenIdsRef = useRef<Set<string>>(new Set())
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set())
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const newActivityCount = useMemo(
    () => activities.filter((a) => newActivityIds.has(a.id)).length,
    [activities, newActivityIds]
  )

  const isFetching = detailQuery.isFetching || registrationsQuery.isFetching

  const isLoading = registrationsQuery.isLoading

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

    setNewActivityIds((prev) => new Set([...prev, ...fresh]))
    const timer = window.setTimeout(() => {
      setNewActivityIds((prev) => {
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
    setNewActivityIds((prev) => new Set([...prev, id]))
    const timer = window.setTimeout(() => {
      setNewActivityIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, NEW_HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [lastPayload, liveRevision, liveEnabled])

  const handleRefresh = () => {
    void detailQuery.refetch()
    void registrationsQuery.refetch()
  }

  return (
    <div className="space-y-4">
      <EventHanetConfigCard eventId={eventId} cameras={hanetCameras} />

      <EventHanetSyncLog entries={hanetSyncLog} connected={socketConnected} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "relative flex size-2.5 rounded-full",
              liveEnabled ? "bg-emerald-500" : "bg-muted-foreground/40"
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
          {socketError && liveEnabled ? (
            <Badge variant="destructive" className="text-[10px]">
              Socket lỗi
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
            disabled={!liveEnabled || isReconcilingHanet}
            onClick={reconcileHanet}
          >
            <PlugZap
              className={cn(
                "size-3.5",
                isReconcilingHanet && "animate-pulse",
              )}
            />
            Đồng bộ HANET
          </Button>
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

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-base font-semibold">
          <Activity className="size-5 text-primary" />
          Luồng hoạt động gần đây
        </p>
        <AdminDataTable<EventLiveActivityRow>
          data={activities}
          columns={activityColumns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          emptyLabel="Chưa có check-in hoặc check-out nào."
          globalFilterPlaceholder="Tìm theo tên, email, loại, thời gian…"
          filterColumnVisibilityKey="admin-table-filter-visibility:event-live-activities"
          getGlobalFilterText={getEventLiveActivityGlobalFilterText}
          getRowClassName={(row) =>
            newActivityIds.has(row.original.id)
              ? "ring-2 ring-inset ring-primary bg-primary/5"
              : undefined
          }
          filterToolbarExtra={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={isFetching}
              onClick={handleRefresh}
            >
              <RefreshCw
                className={cn("size-3.5", isFetching && "animate-spin")}
                aria-hidden
              />
              Làm mới
            </Button>
          }
          xlsxExport={buildEventDetailXlsxExport("live-activities", {
            eventId,
            eventTitle,
            pageCount: activities.length,
            total: activities.length,
          })}
          clientPagination={{
            initialPageSize: 15,
            itemLabel: "hoạt động",
            emptySummary: "Chưa có hoạt động nào",
            isLoading,
          }}
          footer={
            <span>
              {newActivityCount > 0 ? `${newActivityCount} mục mới · ` : ""}
              Sắp xếp mới nhất trước.
            </span>
          }
        />
      </div>
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
          !tone && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  )
}
