"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { defineDataTableActionsColumn } from "@ui/components/data-table"
import {
  AttendanceStatusBadge,
  getAttendanceStatusLabel,
} from "./attendance-status"
import { asAttendanceBool } from "./_live/event-attendance-sync"
import { RegistrationAttendanceActions } from "./registration-attendance-actions"
import {
  RegistrationAvatarCell,
  resolveRegistrationAvatarUrl,
} from "./registration-avatar-cell"

export type EventRegistrationRow = Record<string, unknown>

export function getEventRegistrationGlobalFilterText(
  row: EventRegistrationRow,
): string {
  const attendanceText = getAttendanceStatusLabel({
    hasCheckin: asAttendanceBool(row.hasCheckin),
    hasCheckout: asAttendanceBool(row.hasCheckout),
  })
  return [row.email, row.fullName, row.phone, attendanceText]
    .filter(Boolean)
    .join(" ")
}

export function getEventRegistrationColumns(options: {
  eventId: string
  /** Khi mất socket: nút thao tác nổi bật hơn. */
  showSocketFallback?: boolean
}): ColumnDef<EventRegistrationRow>[] {
  const { eventId, showSocketFallback } = options

  return [
    {
      id: "avatar",
      header: "Avatar",
      enableColumnFilter: true,
      filterFn: () => true,
      size: 56,
      meta: {
        disableColumnFilter: true,
        filterLabel: "Avatar",
        exportHeader: "Avatar",
        exportValue: (row) => resolveRegistrationAvatarUrl(row) || "",
        exportWidth: 36,
      },
      cell: ({ row }) => <RegistrationAvatarCell row={row.original} />,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableColumnFilter: true,
      filterFn: () => true,
    },
    {
      accessorKey: "fullName",
      header: "Họ tên",
      enableColumnFilter: true,
      filterFn: () => true,
    },
    {
      accessorKey: "phone",
      header: "Điện thoại",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      id: "attendance",
      header: "Trạng thái check-in",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: {
        exportHeader: "Trạng thái check-in",
        exportValue: (row) =>
          getAttendanceStatusLabel({
            hasCheckin: asAttendanceBool(row.hasCheckin),
            hasCheckout: asAttendanceBool(row.hasCheckout),
          }),
        exportWidth: 22,
      },
      cell: ({ row }) => (
        <AttendanceStatusBadge
          row={{
            hasCheckin: asAttendanceBool(row.original.hasCheckin),
            hasCheckout: asAttendanceBool(row.original.hasCheckout),
          }}
        />
      ),
    },
    defineDataTableActionsColumn<EventRegistrationRow>({
      columnMeta: {
        className:
          "w-[120px] min-w-[100px] max-w-[140px] px-1 text-center align-middle [&>div]:flex [&>div]:w-full [&>div]:justify-center",
      },
      cell: ({ row }) => (
        <RegistrationAttendanceActions
          eventId={eventId}
          row={row.original}
          compact={showSocketFallback}
        />
      ),
    }),
  ]
}
