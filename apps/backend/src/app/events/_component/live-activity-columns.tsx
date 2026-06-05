"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { LogIn, LogOut } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { cn } from "@ui/lib/utils"
import { asAttendanceBool } from "./_live/event-attendance-sync"
import {
  RegistrationAvatarCell,
  resolveRegistrationAvatarUrl,
} from "./registration-avatar-cell"

export type EventLiveActivityKind = "checkin" | "checkout"

export type EventLiveActivityRow = {
  id: string
  kind: EventLiveActivityKind
  at: string
  email: string
  fullName: string
  avatar?: string | null
  detail?: string
}

type RegistrationDict = Record<string, unknown>

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

export function checkinTypeLabel(value: unknown): string {
  const v = Number(value)
  if (v === 2) return "Face ID"
  if (v === 1) return "QR Code"
  if (v === 3) return "Thủ công"
  return "—"
}

/** Luồng check-in/out từ danh sách đăng ký (cùng nguồn realtime). */
export function buildLiveActivitiesFromRegistrations(
  registrations: RegistrationDict[],
): EventLiveActivityRow[] {
  const items: EventLiveActivityRow[] = []

  for (const row of registrations) {
    const regId = String(row.id ?? "")
    const email = String(row.email ?? "")
    const fullName = String(row.fullName ?? "")

    if (asAttendanceBool(row.hasCheckin)) {
      const at = String(row.updatedAt ?? row.registeredAt ?? "")
      if (at) {
        items.push({
          id: `checkin:${regId}`,
          kind: "checkin",
          at,
          email,
          fullName,
          avatar: row.avatar as string | null | undefined,
          detail: checkinTypeLabel(row.checkinMethod),
        })
      }
    }

    if (asAttendanceBool(row.hasCheckout)) {
      const at = String(row.updatedAt ?? row.registeredAt ?? "")
      if (at) {
        items.push({
          id: `checkout:${regId}`,
          kind: "checkout",
          at,
          email,
          fullName,
          avatar: row.avatar as string | null | undefined,
          detail: "Check-out",
        })
      }
    }
  }

  return items.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
}

export function getEventLiveActivityGlobalFilterText(
  row: EventLiveActivityRow,
): string {
  const kindLabel = row.kind === "checkin" ? "Check-in" : "Check-out"
  return [
    row.fullName,
    row.email,
    kindLabel,
    row.detail,
    formatDateTime(row.at),
  ]
    .filter(Boolean)
    .join(" ")
}

export function getEventLiveActivityColumns(): ColumnDef<EventLiveActivityRow>[] {
  return [
    {
      id: "avatar",
      header: "Avatar",
      enableColumnFilter: true,
      filterFn: () => true,
      size: 56,
      meta: {
        exportHeader: "Avatar",
        exportValue: (row) =>
          resolveRegistrationAvatarUrl({
            fullName: row.fullName,
            email: row.email,
            avatar: row.avatar,
          }) || "",
        exportWidth: 36,
      },
      cell: ({ row }) => (
        <RegistrationAvatarCell
          row={{
            fullName: row.original.fullName,
            email: row.original.email,
            avatar: row.original.avatar,
          }}
        />
      ),
    },
    {
      id: "kind",
      header: "Loại",
      enableColumnFilter: true,
      filterFn: () => true,
      size: 120,
      meta: {
        exportValue: (row) =>
          row.kind === "checkin" ? "Check-in" : "Check-out",
        exportWidth: 14,
      },
      cell: ({ row }) => {
        const isCheckin = row.original.kind === "checkin"
        return (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                isCheckin
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-amber-500/15 text-amber-700",
              )}
            >
              {isCheckin ? (
                <LogIn className="size-3.5" aria-hidden />
              ) : (
                <LogOut className="size-3.5" aria-hidden />
              )}
            </div>
            <Badge
              variant={isCheckin ? "default" : "secondary"}
              className="text-[10px]"
            >
              {isCheckin ? "Check-in" : "Check-out"}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "fullName",
      header: "Họ tên",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      accessorKey: "email",
      header: "Email",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      accessorKey: "detail",
      header: "Ghi chú",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      id: "at",
      header: "Thời gian",
      enableColumnFilter: true,
      filterFn: () => true,
      accessorFn: (row) => row.at,
      meta: {
        exportValue: (row) => formatDateTime(row.at),
        exportWidth: 20,
      },
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {formatDateTime(row.original.at)}
        </span>
      ),
    },
  ]
}
