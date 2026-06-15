"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import {
  AdminListPageHeader,
  AdminPageSection,
} from "@ui/components/admin"
import { Button } from "@ui/components/button"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { canCancelMyRegistration } from "../_lib/my-registered-events"
import type { MyRegisteredEventsPageConfig } from "../_config"
import { MyRegisteredEventsTable } from "./_table"
import { useMyRegisteredEvents } from "./_query"
import { getMyRegisteredEventColumns } from "./columns"
import { buildMyRegisteredEventsBulkActions } from "./my-registered-events-bulk-actions"
import { MyRegisteredEventsStatCards } from "./my-registered-events-stat-cards"
import { eventHref } from "./utils"

function MyRegisteredEventsPageInner({
  config,
}: {
  config: MyRegisteredEventsPageConfig
}) {
  const router = useRouter()
  const api = useAdminApi()
  const eventDetailPathPrefix = config.eventDetailPathPrefix ?? "/su-kien"
  const tableScope =
    config.tableScope ?? `checkin-${config.role}-my-registered-events`
  const exportAudienceLabel =
    config.exportAudienceLabel ?? config.role
  const registrantColumnLabel =
    config.registrantColumnLabel ?? "Người đăng ký"

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
    [],
  )

  const actionHandlers = useMemo(
    () => ({
      onView: (row: (typeof rows)[number]) => {
        router.push(eventHref(row, eventDetailPathPrefix))
      },
      onCancel: async (row: (typeof rows)[number]) => {
        if (!canCancelMyRegistration(row)) return
        await cancelRegistration(row)
      },
      cancellingId,
    }),
    [cancelRegistration, cancellingId, eventDetailPathPrefix, router],
  )

  const columns = useMemo(
    () =>
      getMyRegisteredEventColumns({
        actionHandlers,
        eventDetailPathPrefix,
        registrantColumnLabel,
      }),
    [actionHandlers, eventDetailPathPrefix, registrantColumnLabel],
  )

  const bulkActions = useMemo(
    () => buildMyRegisteredEventsBulkActions({ api, setRows, reload: load }),
    [api, load, setRows],
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
        tableScope={tableScope}
        exportAudienceLabel={exportAudienceLabel}
      />
    </AdminPageSection>
  )
}

export function MyRegisteredEventsPage({
  config,
}: {
  config: MyRegisteredEventsPageConfig
}) {
  return <MyRegisteredEventsPageInner config={config} />
}
