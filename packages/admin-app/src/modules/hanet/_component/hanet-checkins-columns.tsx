"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Clock, User } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { FieldCopyButton } from "@ui/components/field"
import type { HanetCheckinRow } from "@workspace/admin-app/lib/hanet-checkin-parse"

export function getHanetCheckinColumns(): ColumnDef<HanetCheckinRow>[] {
  return [
    {
      accessorKey: "checkinAt",
      header: "Thời gian",
      enableColumnFilter: true,
      meta: { filterPlaceholder: "Lọc thời gian…" },
      size: 168,
      cell: ({ getValue }) => {
        const value = String(getValue() ?? "").trim() || "—"
        return (
          <div className="flex min-w-0 items-center gap-2">
            <Clock
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="tabular-nums">{value}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "displayName",
      header: "Tên",
      enableColumnFilter: true,
      meta: { filterPlaceholder: "Lọc tên…" },
      size: 200,
      cell: ({ getValue }) => {
        const name = String(getValue() ?? "").trim() || "—"
        return (
          <div className="flex min-w-0 items-start gap-2">
            <User
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 whitespace-normal break-words font-medium leading-snug">
              {name}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "aliasId",
      header: "aliasID",
      enableColumnFilter: true,
      meta: { filterPlaceholder: "Lọc aliasID…" },
      size: 120,
      cell: ({ getValue }) => {
        const aliasId = String(getValue() ?? "").trim()
        if (!aliasId) return "—"
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{aliasId}</span>
            <FieldCopyButton text={aliasId} />
          </div>
        )
      },
    },
    {
      accessorKey: "personId",
      header: "personID",
      enableColumnFilter: true,
      meta: { filterPlaceholder: "Lọc personID…" },
      size: 150,
      cell: ({ getValue }) => {
        const personId = String(getValue() ?? "").trim()
        if (!personId) return "—"
        return (
          <div className="flex items-center gap-2">
            <code className="text-xs">{personId}</code>
            <FieldCopyButton text={personId} />
          </div>
        )
      },
    },
    {
      accessorKey: "deviceId",
      header: "deviceID",
      enableColumnFilter: true,
      meta: { filterPlaceholder: "Lọc deviceID…" },
      size: 130,
      cell: ({ getValue }) => {
        const deviceId = String(getValue() ?? "").trim()
        if (!deviceId) return "—"
        return (
          <div className="flex items-center gap-2">
            <code className="text-xs">{deviceId}</code>
            <FieldCopyButton text={deviceId} />
          </div>
        )
      },
    },
    {
      accessorKey: "personType",
      header: "Loại",
      enableColumnFilter: true,
      meta: {
        filterVariant: "select",
        filterPlaceholder: "Tất cả loại",
        selectOptions: [
          { value: "Check-in", label: "Check-in" },
          { value: "Check-out", label: "Check-out" },
        ],
      },
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.getValue(columnId) ?? "") === String(filterValue)
      },
      size: 100,
      cell: ({ getValue }) => {
        const type = String(getValue() ?? "").trim()
        if (!type) return "—"
        const variant =
          type === "Check-out" ? ("secondary" as const) : ("outline" as const)
        return (
          <Badge variant={variant} className="h-5 text-[10px] font-normal">
            {type}
          </Badge>
        )
      },
    },
  ]
}
