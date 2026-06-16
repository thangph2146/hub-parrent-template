"use client"

import { useState } from "react"
import { CalendarCheck, Clock, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import { Button } from "@ui/components/button"
import { DataTableToolbarField } from "@ui/components/data-table"
import { Input } from "@ui/components/input"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { useQuery } from "@tanstack/react-query"
import { api } from "@workspace/admin-app/lib/api"
import { parseHanetCheckinRows } from "@workspace/admin-app/lib/hanet-checkin-parse"
import { formatHanetCheckinError } from "@workspace/admin-app/lib/hanet-checkin-errors"
import {
  formatDatetimeLocalVi,
  formatHanetCompactTimeVi,
  formatIsoDateVi,
  localDayEndDatetime,
  localDayStartDatetime,
  todayLocalIsoDate,
} from "@workspace/admin-app/lib/hanet-local-date"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetCheckinsTable } from "../_component/hanet-checkins-table"
import { HANET_PAGE_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { HanetModuleShell } from "../_component/hanet-module-shell"

type HanetCheckinPayload = {
  placeId?: string
  date?: string
  from?: string
  to?: string
  rows?: Record<string, unknown>[]
  total?: number
}

type CheckinMode = "day" | "timestamp"

function useCheckinPayload(
  payload: HanetCheckinPayload | undefined,
  fetchEnabled: boolean,
) {
  const tableRows = parseHanetCheckinRows(
    Array.isArray(payload?.rows) ? payload.rows : [],
  )

  const total =
    typeof payload?.total === "number" && Number.isFinite(payload.total)
      ? payload.total
      : tableRows.length

  return { tableRows, total, hasData: fetchEnabled && Boolean(payload) }
}

function CheckinContent() {
  const { data: hanetStatus } = useHanetStatusQuery()
  const [mode, setMode] = useState<CheckinMode>("day")
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [date, setDate] = useState(todayLocalIsoDate)
  const [fromAt, setFromAt] = useState(() => localDayStartDatetime(todayLocalIsoDate()))
  const [toAt, setToAt] = useState(() => localDayEndDatetime(todayLocalIsoDate()))
  const [fetchEnabled, setFetchEnabled] = useState(false)
  const [rangeError, setRangeError] = useState<string | null>(null)

  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

  const dayQuery = useQuery({
    queryKey: ["hanet", "checkins", "day", effectivePlaceId, date],
    queryFn: () =>
      api.hanet.getCheckinsByPlaceDay({
        placeId: effectivePlaceId || undefined,
        date,
      }),
    enabled:
      fetchEnabled &&
      mode === "day" &&
      hanetStatus?.configured === true &&
      Boolean(effectivePlaceId),
  })

  const timestampQuery = useQuery({
    queryKey: ["hanet", "checkins", "timestamp", effectivePlaceId, fromAt, toAt],
    queryFn: () =>
      api.hanet.getCheckinsByPlaceTimestamp({
        placeId: effectivePlaceId || undefined,
        from: fromAt,
        to: toAt,
      }),
    enabled:
      fetchEnabled &&
      mode === "timestamp" &&
      hanetStatus?.configured === true &&
      Boolean(effectivePlaceId) &&
      Boolean(fromAt) &&
      Boolean(toAt) &&
      !rangeError,
  })

  const activeQuery = mode === "day" ? dayQuery : timestampQuery
  const payload = activeQuery.data as HanetCheckinPayload | undefined
  const { tableRows, total, hasData } = useCheckinPayload(payload, fetchEnabled)

  const summaryLine =
    hasData && !activeQuery.isFetching && !activeQuery.error
      ? mode === "day"
        ? `Tổng ${total} lượt · ${formatIsoDateVi(payload?.date ?? date)} · placeID ${payload?.placeId ?? effectivePlaceId}`
        : `Tổng ${total} lượt · ${formatHanetCompactTimeVi(payload?.from ?? "")} → ${formatHanetCompactTimeVi(payload?.to ?? "")} · placeID ${payload?.placeId ?? effectivePlaceId}`
      : null

  const emptyLabel = !fetchEnabled
    ? mode === "day"
      ? "Chọn địa điểm, ngày và bấm Tải check-in."
      : "Chọn địa điểm, khoảng thời gian và bấm Tải check-in."
    : activeQuery.error
      ? "Không tải được dữ liệu."
      : mode === "day"
        ? "Không có lượt check-in trong ngày đã chọn."
        : "Không có lượt check-in trong khoảng thời gian đã chọn."

  const applyDayToRange = () => {
    const day = date.trim().slice(0, 10)
    setFromAt(localDayStartDatetime(day))
    setToAt(localDayEndDatetime(day))
    setRangeError(null)
  }

  const validateRange = (from: string, to: string): string | null => {
    if (!from || !to) return "Chọn đủ thời gian bắt đầu và kết thúc."
    if (from >= to) return "Thời gian kết thúc phải sau thời gian bắt đầu."
    return null
  }

  const loadCheckins = () => {
    if (mode === "timestamp") {
      const err = validateRange(fromAt, toAt)
      setRangeError(err)
      if (err) return
    } else {
      setRangeError(null)
    }
    setFetchEnabled(true)
    if (fetchEnabled) {
      void activeQuery.refetch()
    }
  }

  if (!hanetStatus?.configured) {
    return (
      <Alert>
        <AlertTitle>Chưa cấu hình HANET</AlertTitle>
        <AlertDescription>
          Thiết lập OAuth trong .env API, sau đó kiểm tra tại trang Kết nối.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {activeQuery.error ? (
        <Alert variant="destructive">
          <AlertTitle>Không tải được check-in</AlertTitle>
          <AlertDescription>
            {formatHanetCheckinError(activeQuery.error.message)}
          </AlertDescription>
        </Alert>
      ) : null}

      {rangeError ? (
        <Alert variant="destructive">
          <AlertTitle>Khoảng thời gian không hợp lệ</AlertTitle>
          <AlertDescription>{rangeError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as CheckinMode)
          setFetchEnabled(false)
          setRangeError(null)
        }}
      >
        <AdminListTabsList fullWidth className="max-w-md grid grid-cols-2">
          <AdminListTabsTrigger value="day" stretch>
            <CalendarCheck className="size-3.5 shrink-0" />
            Theo ngày
          </AdminListTabsTrigger>
          <AdminListTabsTrigger value="timestamp" stretch>
            <Clock className="size-3.5 shrink-0" />
            Theo khoảng thời gian
          </AdminListTabsTrigger>
        </AdminListTabsList>

        <TabsContent value="day" className="mt-3 space-y-3">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-sm">
            <HanetPlaceSelect
              layout="stacked"
              value={selectedPlaceId}
              onChange={setSelectedPlaceId}
              defaultPlaceId={hanetStatus.defaultPlaceId}
              className="min-w-[min(100%,14rem)] flex-1 sm:max-w-xs"
            />
            <DataTableToolbarField label="Ngày" className="w-40 shrink-0">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </DataTableToolbarField>
            <Button
              type="button"
              size="sm"
              className="h-9 shrink-0"
              disabled={!effectivePlaceId || dayQuery.isFetching}
              onClick={loadCheckins}
            >
              {dayQuery.isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Tải check-in
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="timestamp" className="mt-3 space-y-3">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-sm">
            <HanetPlaceSelect
              layout="stacked"
              value={selectedPlaceId}
              onChange={setSelectedPlaceId}
              defaultPlaceId={hanetStatus.defaultPlaceId}
              className="min-w-[min(100%,14rem)] flex-1 sm:max-w-xs"
            />
            <DataTableToolbarField label="Từ" className="w-44 shrink-0">
              <Input
                type="datetime-local"
                value={fromAt}
                onChange={(e) => {
                  setFromAt(e.target.value)
                  setRangeError(validateRange(e.target.value, toAt))
                }}
                className="h-9"
              />
            </DataTableToolbarField>
            <DataTableToolbarField label="Đến" className="w-44 shrink-0">
              <Input
                type="datetime-local"
                value={toAt}
                onChange={(e) => {
                  setToAt(e.target.value)
                  setRangeError(validateRange(fromAt, e.target.value))
                }}
                className="h-9"
              />
            </DataTableToolbarField>
            <DataTableToolbarField label="Ngày nhanh" className="w-40 shrink-0">
              <div className="flex gap-1">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 px-2 text-xs"
                  onClick={applyDayToRange}
                >
                  Áp dụng
                </Button>
              </div>
            </DataTableToolbarField>
            <Button
              type="button"
              size="sm"
              className="h-9 shrink-0"
              disabled={
                !effectivePlaceId || timestampQuery.isFetching || Boolean(rangeError)
              }
              onClick={loadCheckins}
            >
              {timestampQuery.isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Tải check-in
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Hub:{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              GET /admin/hanet/checkins/timestamp
            </code>{" "}
            · HANET nhận{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">from</code> /{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">to</code> dạng
            DDMMYYYYHHmmss
            {fromAt && toAt ? (
              <>
                {" "}
                (vd. {formatDatetimeLocalVi(fromAt)} → {formatDatetimeLocalVi(toAt)})
              </>
            ) : null}
          </p>
        </TabsContent>
      </Tabs>

      <HanetCheckinsTable
        data={fetchEnabled && !activeQuery.error ? tableRows : []}
        isLoading={fetchEnabled && activeQuery.isFetching}
        emptyLabel={emptyLabel}
        summaryLine={summaryLine}
      />
    </div>
  )
}

export default function HanetCheckinPage() {
  return (
    <HanetModuleShell
      icon={CalendarCheck}
      title="Check-in HANET"
      subtitle="Lượt quét face theo ngày hoặc khoảng thời gian — proxy đủ 4 API check-in Partner."
      endpoints={HANET_PAGE_ENDPOINTS.checkin}
      contentClassName="max-w-full"
    >
      <CheckinContent />
    </HanetModuleShell>
  )
}
