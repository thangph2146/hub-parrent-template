"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import {
  formatEventDateTime,
  formatEventScheduleText,
  formatEventTimeDateLine,
  getEventLocationLabel,
  getPosterUrl,
} from "../_lib/event-display"
import { FORMAT_LABELS } from "../_lib/registration-format"
import {
  DateTimeTableCell,
  EventScheduleTableCell,
} from "./event-schedule-cells"
import { defineDataTableActionsColumn } from "@ui/components/data-table"
import {
  MyRegisteredEventRowActions,
  type MyRegisteredEventRowActionHandlers,
} from "./my-registered-events-row-actions"
import {
  ATTENDANCE_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  type MyRegisteredEventRow,
} from "./types"
import { RegistrationStatusBadge } from "./registration-status-badge"
import { eventHref } from "./utils"

export function getMyRegisteredEventColumns({
  actionHandlers,
  eventDetailPathPrefix = "/su-kien",
  registrantColumnLabel = "Sinh viên",
}: {
  actionHandlers: MyRegisteredEventRowActionHandlers
  eventDetailPathPrefix?: string
  registrantColumnLabel?: string
}): ColumnDef<MyRegisteredEventRow, unknown>[] {
  return [
    {
      id: "eventTitle",
      accessorFn: (row) => row.event.title,
      header: "Sự kiện",
      enableColumnFilter: true,
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
                href={eventHref(row.original, eventDetailPathPrefix)}
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
        exportValue: (row: MyRegisteredEventRow) => row.event.title,
        exportWidth: 38,
        exportWrap: true,
      },
    },
    {
      accessorKey: "id",
      header: "Mã đăng ký",
      enableColumnFilter: true,
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
      header: registrantColumnLabel,
      meta: {
        hideInTable: true,
        exportHeader: `${registrantColumnLabel} đăng ký`,
        exportValue: (row: MyRegisteredEventRow) => row.fullName,
        exportWidth: 28,
        exportWrap: true,
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: {
        hideInTable: true,
        exportHeader: "Email",
        exportValue: (row: MyRegisteredEventRow) => row.email,
        exportWidth: 30,
      },
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
      meta: {
        hideInTable: true,
        exportHeader: "Số điện thoại",
        exportValue: (row: MyRegisteredEventRow) => row.phone ?? "",
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
        exportValue: (row: MyRegisteredEventRow) =>
          FORMAT_LABELS[row.event.format] ?? "Offline",
        exportWidth: 18,
      },
    },
    {
      accessorKey: "registeredAt",
      header: "Ngày đăng ký",
      enableColumnFilter: true,
      cell: ({ getValue }) => (
        <DateTimeTableCell value={getValue() as string | null} />
      ),
      meta: {
        className: "min-w-[120px]",
        filterVariant: "date-range",
        filterPlaceholder: "Khoảng ngày đăng ký",
        exportHeader: "Ngày đăng ký",
        exportValue: (row: MyRegisteredEventRow) =>
          formatEventTimeDateLine(row.registeredAt) ?? "",
        exportWidth: 22,
      },
    },
    {
      id: "eventStartDate",
      accessorFn: (row) => row.event.startDate,
      header: "Thời gian sự kiện",
      enableColumnFilter: true,
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
        exportValue: (row: MyRegisteredEventRow) =>
          formatEventScheduleText(
            row.event.startDate,
            row.event.endDate,
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
        exportValue: (row: MyRegisteredEventRow) =>
          formatEventDateTime(row.event.endDate) ?? "",
        exportWidth: 22,
      },
    },
    {
      accessorKey: "event.registrationEnd",
      header: "Hạn đăng ký",
      meta: {
        hideInTable: true,
        exportHeader: "Hạn đăng ký",
        exportValue: (row: MyRegisteredEventRow) =>
          formatEventDateTime(row.event.registrationEnd) ?? "",
        exportWidth: 22,
      },
    },
    {
      id: "location",
      header: "Địa điểm",
      accessorFn: (row) => getEventLocationLabel(row.event) ?? "",
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {getEventLocationLabel(row.original.event) || "—"}
        </span>
      ),
      meta: {
        className: "min-w-[120px]",
        filterPlaceholder: "Lọc địa điểm",
        exportHeader: "Địa điểm tổ chức",
        exportValue: (row: MyRegisteredEventRow) =>
          getEventLocationLabel(row.event) ?? "",
        exportWidth: 42,
        exportWrap: true,
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.original.status) === String(filterValue)
      },
      cell: ({ row }) => (
        <div className="space-y-1">
          <RegistrationStatusBadge row={row.original} />
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
        exportValue: (row: MyRegisteredEventRow) => {
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
    defineDataTableActionsColumn<MyRegisteredEventRow>({
      cell: ({ row }) => (
        <MyRegisteredEventRowActions
          row={row.original}
          handlers={actionHandlers}
        />
      ),
    }),
  ]
}
