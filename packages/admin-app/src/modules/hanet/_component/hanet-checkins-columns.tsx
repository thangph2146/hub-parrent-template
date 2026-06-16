"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Clock, User } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { FieldCopyButton } from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import type { HanetCheckinRow } from "@workspace/admin-app/lib/hanet-checkin-parse"

/** Khớp cột «Xem trước» trên /admin/file-storage */
export const HANET_CHECKIN_PREVIEW_COLUMN_CLASS =
  "w-[180px] min-w-[180px] max-w-[180px]"

const CHECKIN_PREVIEW_FRAME_CLASS =
  "flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted"

export type HanetCheckinColumnsOptions = {
  onPreviewImage?: (row: HanetCheckinRow) => void
}

export function getHanetCheckinColumns(
  options?: HanetCheckinColumnsOptions,
): ColumnDef<HanetCheckinRow>[] {
  return [
    {
      accessorKey: "avatarUrl",
      header: "Ảnh",
      enableColumnFilter: false,
      enableHiding: false,
      size: 180,
      minSize: 180,
      meta: {
        disableCellLineClamp: true,
        className: cn(HANET_CHECKIN_PREVIEW_COLUMN_CLASS, "py-2"),
      },
      cell: ({ row, getValue }) => {
        const avatar = String(getValue() ?? "").trim()
        if (!avatar) {
          return (
            <div
              className={cn(
                CHECKIN_PREVIEW_FRAME_CLASS,
                "cursor-default text-sm text-muted-foreground",
              )}
            >
              —
            </div>
          )
        }

        const image = (
          <img
            src={avatar}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )

        if (options?.onPreviewImage) {
          return (
            <button
              type="button"
              onClick={() => options.onPreviewImage?.(row.original)}
              className={CHECKIN_PREVIEW_FRAME_CLASS}
              title="Xem ảnh check-in"
            >
              {image}
            </button>
          )
        }

        return (
          <a
            href={avatar}
            target="_blank"
            rel="noopener noreferrer"
            className={CHECKIN_PREVIEW_FRAME_CLASS}
            title="Mở ảnh check-in"
          >
            {image}
          </a>
        )
      },
    },
    {
      accessorKey: "checkinAt",
      header: "Thời gian",
      enableColumnFilter: true,
      meta: {
        filterPlaceholder: "Lọc thời gian…",
        disableCellLineClamp: true,
        className: "py-2",
      },
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
      meta: {
        filterPlaceholder: "Lọc tên…",
        disableCellLineClamp: true,
        className: "py-2",
      },
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
      meta: {
        filterPlaceholder: "Lọc aliasID…",
        disableCellLineClamp: true,
        className: "py-2",
      },
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
      meta: {
        filterPlaceholder: "Lọc personID…",
        disableCellLineClamp: true,
        className: "py-2",
      },
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
      meta: {
        filterPlaceholder: "Lọc deviceID…",
        disableCellLineClamp: true,
        className: "py-2",
      },
      size: 160,
      cell: ({ row }) => {
        const deviceId = String(row.original.deviceId ?? "").trim()
        const deviceName = String(row.original.deviceName ?? "").trim()
        if (!deviceId) return "—"
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <code className="text-xs">{deviceId}</code>
              <FieldCopyButton text={deviceId} />
            </div>
            {deviceName ? (
              <span className="truncate text-xs text-muted-foreground">
                {deviceName}
              </span>
            ) : null}
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
        disableCellLineClamp: true,
        className: "py-2",
        selectOptions: [
          { value: "Check-in", label: "Check-in" },
          { value: "Check-out", label: "Check-out" },
          { value: "Chưa nhận diện", label: "Chưa nhận diện" },
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
          type === "Check-out"
            ? ("secondary" as const)
            : type === "Chưa nhận diện"
              ? ("secondary" as const)
              : ("outline" as const)
        return (
          <Badge variant={variant} className="h-5 text-[10px] font-normal">
            {type}
          </Badge>
        )
      },
    },
  ]
}
