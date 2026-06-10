"use client"

import { useMemo } from "react"
import { CalendarDays, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import {
  AdminListPageHeader,
  AdminPageSection,
} from "@ui/components/admin"
import { Button } from "@ui/components/button"
import { canCancelMyRegistration } from "@/lib/my-registered-events"
import { MyRegisteredEventsTable } from "./_table"
import { useMyRegisteredEvents } from "./_query"
import { getMyRegisteredEventColumns } from "./columns"
import { buildMyRegisteredEventsBulkActions } from "./my-registered-events-bulk-actions"
import { MyRegisteredEventsStatCards } from "./my-registered-events-stat-cards"

function MyRegisteredEventsPageInner() {
  const {
    session,
    rows,
    setRows,
    loading,
    error,
    load,
    stats,
    cancellingId,
    cancelRegistration,
  } = useMyRegisteredEvents()

  const exportGeneratedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    []
  )

  const actionHandlers = useMemo(
    () => ({
      onCancel: async (row: (typeof rows)[number]) => {
        if (!canCancelMyRegistration(row)) return
        await cancelRegistration(row)
      },
      cancellingId,
    }),
    [cancelRegistration, cancellingId]
  )

  const columns = useMemo(
    () => getMyRegisteredEventColumns({ actionHandlers }),
    [actionHandlers]
  )

  const bulkActions = useMemo(
    () => buildMyRegisteredEventsBulkActions({ setRows, reload: load }),
    [load, setRows]
  )

  if (!session) {
    return null
  }

  return (
    <AdminPageSection className="space-y-6">
      <AdminListPageHeader
        icon={CalendarDays}
        title="Sự kiện của tôi"
        subtitle="Danh sách đăng ký, trạng thái check-in và hủy đăng ký khi còn thời hạn."
        actions={
          <Button
            variant="outline"
            onClick={() => void load()}
            className="h-11 font-bold"
          >
            <RefreshCw
              className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        }
      />

      <MyRegisteredEventsStatCards stats={stats} loading={loading} />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Không thể tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <MyRegisteredEventsTable
        rows={rows}
        columns={columns}
        loading={loading}
        session={session}
        exportGeneratedAt={exportGeneratedAt}
        bulkActions={bulkActions}
      />
    </AdminPageSection>
  )
}

export function MyRegisteredEventsPage() {
  return <MyRegisteredEventsPageInner />
}
