"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  LogIn,
  Ticket,
  UserCheck,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/card"
import { Container, Page, PageContent } from "@ui/components/layout"
import { DataTable, type DataTableBulkAction } from "@ui/components/data-table"
import {
  STORE_CONTAINER_INSET_WIDE,
  STORE_CONTAINER_MAX_DEFAULT,
} from "@ui/lib/layout-shell"
import { cn } from "@ui/lib/utils"
import {
  readEventSession,
  subscribeEventSession,
  type EventSessionUser,
} from "@/lib/event-auth"
import { buildLoginHref } from "@/lib/event-auth"
import {
  cancelMyEventRegistration,
  canCancelMyRegistration,
  computeMyRegisteredEventStats,
  fetchMyRegisteredEvents,
  getCancelRegistrationState,
  MY_REGISTRATION_STATUS,
  type MyRegisteredEvent,
} from "@/lib/my-registered-events"
import {
  formatEventDateTime,
  formatEventScheduleText,
  formatEventTimeDateLine,
  formatEventTimeDateParts,
  getEventScheduleDisplay,
  getEventLocationLabel,
  getPosterUrl,
  type EventTimeDateParts,
} from "@/lib/public-events"
import { FORMAT_LABELS } from "@/lib/registration-format"
import { useSyncExternalStore } from "react"

const REGISTRATION_STATUS_LABELS: Record<number, string> = {
  [MY_REGISTRATION_STATUS.PENDING]: "Chờ xử lý",
  [MY_REGISTRATION_STATUS.CONFIRMED]: "Đã xác nhận",
  [MY_REGISTRATION_STATUS.CANCELLED]: "Đã hủy",
}

const ATTENDANCE_STATUS_LABELS: Record<number, string> = {
  0: "Chưa tham dự",
  1: "Một phần",
  2: "Đã tham dự",
}

function useEventSession(): EventSessionUser | null {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null
  )
}

function eventHref(row: MyRegisteredEvent): string {
  return `/su-kien/${row.event.slug ?? row.event.id}`
}

function canCancel(row: MyRegisteredEvent): boolean {
  return canCancelMyRegistration(row)
}

function DateTimeTableCell({ value }: { value?: string | null }) {
  const parts = formatEventTimeDateParts(value)
  if (!parts) {
    return <span className="text-sm text-muted-foreground">—</span>
  }
  return (
    <div className="space-y-0.5 tabular-nums">
      <p className="text-sm font-medium leading-none">{parts.time}</p>
      <p className="text-xs leading-snug text-muted-foreground">{parts.date}</p>
    </div>
  )
}

function SchedulePoint({
  label,
  parts,
}: {
  label: string
  parts: EventTimeDateParts
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium tabular-nums leading-none">
        {parts.time}
      </p>
      <p className="text-xs tabular-nums leading-snug text-muted-foreground">
        {parts.date}
      </p>
    </div>
  )
}

function EventScheduleTableCell({
  start,
  end,
}: {
  start?: string | null
  end?: string | null
}) {
  const display = getEventScheduleDisplay(start, end)

  if (display.kind === "empty") {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  if (display.kind === "single") {
    return (
      <DateTimeTableCell
        value={start}
      />
    )
  }

  if (display.kind === "same-day") {
    return (
      <div className="space-y-0.5 tabular-nums">
        <p className="text-sm font-medium leading-none">{display.timeRange}</p>
        <p className="text-xs leading-snug text-muted-foreground">
          {display.date}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <SchedulePoint label="Bắt đầu" parts={display.start} />
      <SchedulePoint label="Kết thúc" parts={display.end} />
    </div>
  )
}

function statusBadge(row: MyRegisteredEvent) {
  if (row.status === MY_REGISTRATION_STATUS.CANCELLED) {
    return <Badge variant="outline">Đã hủy</Badge>
  }
  if (row.hasCheckin) {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">
        Đã check-in
      </Badge>
    )
  }
  if (row.status === MY_REGISTRATION_STATUS.CONFIRMED) {
    return (
      <Badge className="bg-primary text-primary-foreground hover:bg-primary">
        Đã xác nhận
      </Badge>
    )
  }
  return <Badge variant="secondary">Chờ xử lý</Badge>
}

export function MyRegisteredEventsPage() {
  const session = useEventSession()
  const [rows, setRows] = useState<MyRegisteredEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const exportGeneratedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    []
  )

  const load = async (options?: { silent?: boolean }) => {
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
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  const stats = useMemo(
    () => computeMyRegisteredEventStats(rows),
    [rows]
  )

  const cancelRegistration = async (row: MyRegisteredEvent) => {
    if (!canCancel(row)) return
    setCancellingId(row.id)
    try {
      const updated = await cancelMyEventRegistration(row.id)
      setRows((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      toast.success("Đã hủy đăng ký sự kiện.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể hủy đăng ký.")
    } finally {
      setCancellingId(null)
    }
  }

  const columns = useMemo<ColumnDef<MyRegisteredEvent, unknown>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        enableSorting: false,
        enableColumnFilter: false,
        size: 48,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.index + 1}
          </span>
        ),
        meta: {
          disableColumnFilter: true,
          excludeFromExport: true,
        },
      },
      {
        accessorKey: "event.title",
        header: "Sự kiện",
        cell: ({ row }) => {
          const event = row.original.event
          const posterUrl = getPosterUrl(event.poster)
          return (
            <div className="flex gap-3">
              <div className="aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-primary">
                    <CalendarDays className="size-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <Link
                  href={eventHref(row.original)}
                  className="line-clamp-2 font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {event.title}
                </Link>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span>{FORMAT_LABELS[event.format] ?? "Offline"}</span>
                  {getEventLocationLabel(event) ? (
                    <>
                      <span>·</span>
                      <span className="line-clamp-1">
                        {getEventLocationLabel(event)}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )
        },
        meta: {
          className: "min-w-[260px]",
          filterPlaceholder: "Lọc theo tên sự kiện",
          exportHeader: "Tên sự kiện",
          exportValue: (row) => row.event.title,
          exportWidth: 38,
          exportWrap: true,
        },
      },
      {
        accessorKey: "id",
        header: "Mã đăng ký",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {String(getValue() ?? "").slice(0, 8)}
          </span>
        ),
        meta: {
          className: "min-w-[120px]",
          filterPlaceholder: "Lọc mã đăng ký",
          exportHeader: "Mã đăng ký",
          exportWidth: 28,
        },
      },
      {
        accessorKey: "fullName",
        header: "Sinh viên",
        meta: {
          hideInTable: true,
          exportHeader: "Sinh viên đăng ký",
          exportValue: (row) => row.fullName,
          exportWidth: 28,
          exportWrap: true,
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: {
          hideInTable: true,
          exportHeader: "Email sinh viên",
          exportValue: (row) => row.email,
          exportWidth: 30,
        },
      },
      {
        accessorKey: "phone",
        header: "Số điện thoại",
        meta: {
          hideInTable: true,
          exportHeader: "Số điện thoại",
          exportValue: (row) => row.phone ?? "",
          exportWidth: 18,
        },
      },
      {
        id: "eventFormat",
        header: "Hình thức",
        accessorFn: (row) => FORMAT_LABELS[row.event.format] ?? "Offline",
        meta: {
          hideInTable: true,
          exportHeader: "Hình thức tổ chức",
          exportValue: (row) => FORMAT_LABELS[row.event.format] ?? "Offline",
          exportWidth: 18,
        },
      },
      {
        accessorKey: "registeredAt",
        header: "Ngày đăng ký",
        cell: ({ getValue }) => (
          <DateTimeTableCell value={getValue() as string | null} />
        ),
        meta: {
          className: "min-w-[120px]",
          filterVariant: "date-range",
          filterPlaceholder: "Khoảng ngày đăng ký",
          exportHeader: "Ngày đăng ký",
          exportValue: (row) =>
            formatEventTimeDateLine(row.registeredAt) ?? "",
          exportWidth: 22,
        },
      },
      {
        accessorKey: "event.startDate",
        header: "Thời gian sự kiện",
        cell: ({ row }) => (
          <EventScheduleTableCell
            start={row.original.event.startDate}
            end={row.original.event.endDate}
          />
        ),
        meta: {
          className: "min-w-[160px]",
          filterVariant: "date-range",
          filterPlaceholder: "Khoảng thời gian sự kiện",
          exportHeader: "Thời gian sự kiện",
          exportValue: (row) =>
            formatEventScheduleText(
              row.event.startDate,
              row.event.endDate
            ) ?? "",
          exportWidth: 28,
          exportWrap: true,
        },
      },
      {
        accessorKey: "event.endDate",
        header: "Thời gian kết thúc",
        meta: {
          hideInTable: true,
          exportHeader: "Thời gian kết thúc",
          exportValue: (row) => formatEventDateTime(row.event.endDate) ?? "",
          exportWidth: 22,
        },
      },
      {
        accessorKey: "event.registrationEnd",
        header: "Hạn đăng ký",
        meta: {
          hideInTable: true,
          exportHeader: "Hạn đăng ký",
          exportValue: (row) =>
            formatEventDateTime(row.event.registrationEnd) ?? "",
          exportWidth: 22,
        },
      },
      {
        id: "location",
        header: "Địa điểm",
        accessorFn: (row) => getEventLocationLabel(row.event) ?? "",
        cell: ({ row }) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {getEventLocationLabel(row.original.event) || "—"}
          </span>
        ),
        meta: {
          className: "min-w-[120px]",
          filterPlaceholder: "Lọc địa điểm",
          exportHeader: "Địa điểm tổ chức",
          exportValue: (row) => getEventLocationLabel(row.event) ?? "",
          exportWidth: 42,
          exportWrap: true,
        },
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="space-y-1">
            {statusBadge(row.original)}
          </div>
        ),
        meta: {
          filterVariant: "select",
          selectOptions: [
            { value: "0", label: "Chờ xử lý" },
            { value: "1", label: "Đã xác nhận" },
            { value: "2", label: "Đã hủy" },
          ],
          exportHeader: "Trạng thái đăng ký",
          exportValue: (row) => {
            const registration =
              REGISTRATION_STATUS_LABELS[row.status] ??
              `Trạng thái ${row.status}`
            const attendance =
              ATTENDANCE_STATUS_LABELS[row.attendanceStatus] ?? "Không xác định"
            return `${registration}\nTham dự: ${attendance}\nCheck-in: ${
              row.hasCheckin ? "Đã check-in" : "Chưa check-in"
            }`
          },
          exportWidth: 28,
          exportWrap: true,
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        enableSorting: false,
        enableColumnFilter: false,
        meta: { disableColumnFilter: true, excludeFromExport: true },
        cell: ({ row }) => {
          const item = row.original
          const cancelState = getCancelRegistrationState(item)
          return (
            <div className="flex flex-wrap gap-2">
              <Link href={eventHref(item)}>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <ExternalLink className="size-3.5" />
                  Xem
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-destructive hover:text-destructive"
                disabled={
                  !cancelState.allowed || cancellingId === item.id
                }
                title={
                  !cancelState.allowed ? cancelState.reason : "Hủy đăng ký"
                }
                onClick={() => void cancelRegistration(item)}
              >
                {cancellingId === item.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <XCircle className="size-3.5" />
                )}
                Hủy
              </Button>
            </div>
          )
        },
      },
    ],
    [cancellingId]
  )

  const bulkActions = useMemo<DataTableBulkAction<MyRegisteredEvent>[]>(
    () => [
      {
        id: "cancel",
        label: "Hủy đăng ký",
        variant: "destructive",
        icon: <XCircle className="size-4" />,
        disabled: (selectedRows) =>
          selectedRows.length === 0 ||
          selectedRows.some((row) => !canCancel(row)),
        confirm: {
          title: "Hủy các đăng ký đã chọn?",
          description:
            "Chỉ các đăng ký còn thời hạn, chưa check-in và sự kiện chưa bắt đầu mới được chọn để hủy.",
          confirmLabel: "Hủy đăng ký",
          destructive: true,
        },
        onAction: async (selectedRows) => {
          if (selectedRows.some((row) => !canCancel(row))) {
            toast.error(
              "Có đăng ký đã chọn không thể hủy (hết hạn đăng ký, đã check-in hoặc sự kiện đã bắt đầu)."
            )
            return
          }
          if (selectedRows.length === 0) {
            toast.error("Vui lòng chọn ít nhất một đăng ký có thể hủy.")
            return
          }

          try {
            const updatedRows = await Promise.all(
              selectedRows.map((row) => cancelMyEventRegistration(row.id))
            )
            const updatedById = new Map(
              updatedRows.map((row) => [row.id, row] as const)
            )
            setRows((current) =>
              current.map((item) => updatedById.get(item.id) ?? item)
            )
            toast.success(
              selectedRows.length === 1
                ? "Đã hủy đăng ký sự kiện."
                : `Đã hủy ${selectedRows.length} đăng ký sự kiện.`
            )
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Không thể hủy đăng ký."
            )
            await load({ silent: true })
            throw err
          }
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.id]
  )

  if (!session) {
    return (
      <Page className="bg-muted/20">
        <PageContent className="p-0">
          <Container
            max={STORE_CONTAINER_MAX_DEFAULT}
            className={`${STORE_CONTAINER_INSET_WIDE} py-10 sm:py-14`}
          >
            <Card className="mx-auto max-w-xl overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
              <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="size-5 text-primary" />
                  Đăng nhập để quản lý sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sinh viên cần đăng nhập để xem danh sách sự kiện đã đăng ký,
                  trạng thái check-in và thao tác hủy đăng ký khi còn thời hạn.
                </p>
                <Link href={buildLoginHref("/student/events")}>
                  <Button className="rounded-lg">Đăng nhập ngay</Button>
                </Link>
              </CardContent>
            </Card>
          </Container>
        </PageContent>
      </Page>
    )
  }

  return (
    <Page className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_34%),linear-gradient(180deg,hsl(var(--muted)/0.45),transparent_40%)]">
      <PageContent className="p-0">
        <Container
          max={"full"}
          className={`${STORE_CONTAINER_INSET_WIDE} space-y-6 py-8 sm:py-10`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Ticket}
              label="Tổng đăng ký"
              value={stats.total}
              loading={loading}
              tone="primary"
            />
            <StatCard
              icon={CheckCircle2}
              label="Còn hiệu lực"
              value={stats.active}
              loading={loading}
              tone="success"
            />
            <StatCard
              icon={Clock}
              label="Sắp diễn ra"
              value={stats.upcoming}
              loading={loading}
              tone="warning"
            />
            <StatCard
              icon={UserCheck}
              label="Đã check-in"
              value={stats.checkedIn}
              loading={loading}
              tone="secondary"
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Không thể tải dữ liệu</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="overflow-hidden border-primary/10 bg-background/95 shadow-xl shadow-primary/5">
            <CardHeader>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Danh sách sự kiện đã đăng ký
                  </CardTitle>
                  <CardDescription>
                    Bộ lọc ngày dùng dạng khoảng thời gian để tra cứu nhanh theo
                    ngày đăng ký hoặc thời gian diễn ra.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <DataTable
                data={rows}
                columns={columns}
                getRowId={(row) => row.id}
                isLoading={loading}
                emptyLabel="Bạn chưa đăng ký sự kiện nào."
                getGlobalFilterText={(row) =>
                  [
                    row.event.title,
                    row.event.location,
                    row.event.address,
                    row.fullName,
                    REGISTRATION_STATUS_LABELS[row.status],
                    ATTENDANCE_STATUS_LABELS[row.attendanceStatus],
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                globalFilterPlaceholder="Tìm theo tên sự kiện, địa điểm, trạng thái..."
                xlsxExport={{
                  fileName: "su-kien-cua-toi.xlsx",
                  sheetName: "Su kien cua toi",
                  title: "DANH SÁCH SỰ KIỆN ĐÃ ĐĂNG KÝ",
                  subtitle: "Báo cáo dành cho sinh viên trên HUB Events",
                  metadata: [
                    { label: "Chủ đề", value: "Sự kiện sinh viên đã đăng ký" },
                    { label: "Ngày xuất", value: exportGeneratedAt },
                    {
                      label: "Người xuất",
                      value: session.name || session.email,
                    },
                    { label: "Email", value: session.email },
                    { label: "Số bản ghi", value: rows.length },
                  ],
                }}
                filterColumnVisibilityKey="checkin-my-registered-events-filters"
                rowSelectionEnabled
                canSelectRow={(row) => canCancel(row.original)}
                bulkActions={bulkActions}
              />
            </CardContent>
          </Card>
        </Container>
      </PageContent>
    </Page>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading = false,
  tone = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  loading?: boolean
  tone?: "primary" | "success" | "warning" | "secondary"
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
    warning: "bg-amber-500/10 text-amber-700 ring-amber-500/15",
    secondary: "bg-secondary/10 text-secondary ring-secondary/15",
  }[tone]

  return (
    <Card className="overflow-hidden border-primary/10 bg-background/90 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl ring-1",
            toneClass
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div
              aria-hidden
              className="mt-1 h-8 w-12 animate-pulse rounded-md bg-muted"
            />
          ) : (
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
