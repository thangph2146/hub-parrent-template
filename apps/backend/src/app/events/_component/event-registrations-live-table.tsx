"use client"

import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, Radio, RefreshCw } from "lucide-react"
import { AdminDataTable } from "@ui/components/data-table"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import { api } from "@/lib/api"
import { buildEventDetailXlsxExport } from "@/lib/admin-table-xlsx-export"
import { useEventRegistrationsQuery } from "./_query"
import {
  AttendanceStatusBadge,
  getAttendanceStatusLabel,
} from "./attendance-status"
import {
  asAttendanceBool,
  mergeRegistrationRowsForDisplay,
} from "./_live/event-attendance-sync"
import { useEventAttendanceContext } from "./_live/event-attendance-provider"
import { RegistrationAttendanceActions } from "./registration-attendance-actions"

type Dict = Record<string, unknown>

const HIGHLIGHT_MS = 4000

export function EventRegistrationsLiveTable({
  eventId,
  eventTitle,
}: {
  eventId: string
  eventTitle: string
}) {
  const {
    connected,
    socketError,
    lastPayload,
    liveRevision,
  } = useEventAttendanceContext()

  const { data: registrations, isLoading, refetch, isFetching } =
    useEventRegistrationsQuery(api, eventId, {
      enabled: true,
    })

  const displayRows = useMemo(
    () => mergeRegistrationRowsForDisplay(registrations, lastPayload),
    [registrations, lastPayload, liveRevision],
  )

  const [flashId, setFlashId] = useState<string | null>(null)

  useEffect(() => {
    if (!lastPayload?.registrationId) return
    setFlashId(String(lastPayload.registrationId))
    const timer = window.setTimeout(() => setFlashId(null), HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [lastPayload, liveRevision])

  const showSocketFallback = !connected

  const columns = useMemo<ColumnDef<Dict>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        enableColumnFilter: false,
        size: 48,
        cell: ({ row }) => row.index + 1,
      },
      { accessorKey: "email", header: "Email", enableColumnFilter: false },
      { accessorKey: "fullName", header: "Họ tên", enableColumnFilter: false },
      {
        accessorKey: "phone",
        header: "Điện thoại",
        enableColumnFilter: false,
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        id: "attendance",
        header: "Trạng thái check-in",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const rowId = String(row.original.id ?? "")
          const isFlash = flashId != null && rowId === flashId
          return (
            <div
              className={cn(
                "inline-flex rounded-md transition-colors duration-300",
                isFlash && "ring-2 ring-primary ring-offset-2 bg-primary/5",
              )}
            >
              <AttendanceStatusBadge
                row={{
                  hasCheckin: asAttendanceBool(row.original.hasCheckin),
                  hasCheckout: asAttendanceBool(row.original.hasCheckout),
                }}
              />
            </div>
          )
        },
      },
      {
        id: "attendanceActions",
        header: "Thao tác",
        enableColumnFilter: false,
        size: 120,
        cell: ({ row }) => (
          <RegistrationAttendanceActions
            eventId={eventId}
            row={row.original}
            compact={showSocketFallback}
          />
        ),
      },
    ],
    [flashId, eventId, showSocketFallback],
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          Danh sách đăng ký — cập nhật ngay khi ghi nhận check-in/check-out (socket
          hoặc thao tác thủ công).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {showSocketFallback ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" aria-hidden />
              {socketError ? "Socket lỗi" : "Mất realtime"}
            </Badge>
          ) : null}
          <Badge variant={connected ? "default" : "secondary"} className="gap-1">
            <Radio className={cn("size-3", connected && "animate-pulse")} />
            {connected ? "Realtime" : "Đang kết nối…"}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
              aria-hidden
            />
            Làm mới
          </Button>
        </div>
      </div>
      <AdminDataTable<Dict>
        key={`registrations-${eventId}-${liveRevision}`}
        data={displayRows}
        columns={columns}
        isLoading={isLoading}
        emptyLabel="Chưa có đăng ký nào."
        getGlobalFilterText={(row) => {
          const attendanceText = getAttendanceStatusLabel({
            hasCheckin: asAttendanceBool(row.hasCheckin),
            hasCheckout: asAttendanceBool(row.hasCheckout),
          })
          return [row.email, row.fullName, row.phone, attendanceText]
            .filter(Boolean)
            .join(" ")
        }}
        xlsxExport={buildEventDetailXlsxExport("registrations", {
          eventId,
          eventTitle,
          pageCount: displayRows.length,
          total: displayRows.length,
        })}
      />
    </div>
  )
}
