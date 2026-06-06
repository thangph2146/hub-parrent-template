"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Radio, RefreshCw } from "lucide-react"
import { AdminDataTable } from "@ui/components/data-table"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import { api } from "@/lib/api"
import { buildEventDetailXlsxExport } from "@ui/components/admin"
import { useEventRegistrationsQuery } from "./_query"
import { mergeRegistrationRowsForDisplay } from "./_live/event-attendance-sync"
import { useEventAttendanceContext } from "./_live/event-attendance-provider"
import {
  getEventRegistrationColumns,
  getEventRegistrationGlobalFilterText,
  type EventRegistrationRow,
} from "./registration-columns"

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
    [registrations, lastPayload],
  )

  const [flashRegistrationId, setFlashRegistrationId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!lastPayload?.registrationId) return
    setFlashRegistrationId(String(lastPayload.registrationId))
    const timer = window.setTimeout(() => setFlashRegistrationId(null), HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [lastPayload, liveRevision])

  const columns = useMemo(
    () =>
      getEventRegistrationColumns({
        eventId,
        showSocketFallback: !connected,
      }),
    [eventId, connected],
  )

  const showSocketFallback = !connected

  return (
    <AdminDataTable<EventRegistrationRow>
      data={displayRows}
      columns={columns}
      rowContextMenu
      getRowId={(row) => String(row.id ?? "")}
      isLoading={isLoading}
      emptyLabel="Chưa có đăng ký nào."
      globalFilterPlaceholder="Tìm theo email, tên, trạng thái…"
      filterColumnVisibilityKey="admin-table-filter-visibility:event-registrations"
      getGlobalFilterText={getEventRegistrationGlobalFilterText}
      getRowClassName={(row) =>
        flashRegistrationId &&
        String(row.original.id ?? "") === flashRegistrationId
          ? "ring-2 ring-inset ring-primary bg-primary/5"
          : undefined
      }
      filterToolbarExtra={
        <div className="flex flex-wrap items-center gap-2">
          {showSocketFallback ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" aria-hidden />
              {socketError ? "Socket lỗi" : "Mất realtime"}
            </Badge>
          ) : null}
          <Badge variant={connected ? "default" : "secondary"} className="gap-1">
            <Radio
              className={cn("size-3", connected && "animate-pulse")}
              aria-hidden
            />
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
      }
      xlsxExport={buildEventDetailXlsxExport("registrations", {
        eventId,
        eventTitle,
        pageCount: displayRows.length,
        total: displayRows.length,
      })}
      clientPagination={{
        initialPageSize: 15,
        itemLabel: "đăng ký",
        emptySummary: "Chưa có đăng ký nào",
        isLoading,
      }}
      footer={
        <span>
          Cập nhật khi check-in/check-out (socket hoặc thủ công).
        </span>
      }
    />
  )
}
