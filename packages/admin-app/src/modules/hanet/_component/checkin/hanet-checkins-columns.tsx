"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Clock, LogIn, LogOut, User, UserRoundX } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { FieldCopyButton } from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import type { HanetCheckinRow } from "../shared/hanet-checkin-parse"

/** Khớp cột «Xem trước» trên /admin/file-storage */
export const HANET_CHECKIN_PREVIEW_COLUMN_CLASS =
  "w-[120px] min-w-[120px] max-w-[120px]"

const CHECKIN_PREVIEW_FRAME_CLASS =
  "flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted"

function HanetCheckinTypeCell({ type }: { type: string }) {
  const label = type.trim()
  if (!label) return <>—</>

  const isCheckin = label === "Check-in"
  const isCheckout = label === "Check-out"
  const isUnknown = label === "Chưa nhận diện"

  const Icon = isCheckin
    ? LogIn
    : isCheckout
      ? LogOut
      : isUnknown
        ? UserRoundX
        : User

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isCheckin &&
            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
          isCheckout &&
            "bg-amber-500/15 text-amber-700 dark:text-amber-400",
          isUnknown &&
            "bg-rose-500/10 text-rose-700 dark:text-rose-400",
          !isCheckin &&
            !isCheckout &&
            !isUnknown &&
            "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        <Icon className="size-3.5" />
      </div>
      <Badge
        variant={isCheckin ? "default" : "secondary"}
        className={cn(
          "h-5 shrink-0 text-[10px] font-medium",
          isCheckin &&
            "border-emerald-600/30 bg-emerald-600 text-white hover:bg-emerald-600/90 dark:border-emerald-500/40",
          isCheckout &&
            "border-amber-300/80 bg-amber-100 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
          isUnknown &&
            "border-rose-300/80 bg-rose-50 text-rose-800 hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
          !isCheckin &&
            !isCheckout &&
            !isUnknown &&
            "font-normal",
        )}
      >
        {label}
      </Badge>
    </div>
  )
}

export type HanetCheckinColumnsOptions = {
  onPreviewImage?: (row: HanetCheckinRow) => void
  /** Danh sách camera HANET — dùng cho `filterVariant: select` trên cột deviceID. */
  deviceSelectOptions?: { value: string; label: string }[]
}

/** Chuỗi hiển thị `checkinAt` (vi-VN) → `YYYY-MM-DD` cho date-range filter. */
function parseHanetCheckinDisplayDate(value: unknown): string | null {
  const text = String(value ?? "").trim()
  if (!text || text === "—") return null

  const viMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (viMatch) {
    const dd = viMatch[1]
    const mm = viMatch[2]
    const yyyy = viMatch[3]
    if (!dd || !mm || !yyyy) return null
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10)
}

function hanetCheckinDateRangeFilterFn(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown,
): boolean {
  if (filterValue == null || filterValue === "") return true
  const rowDate = parseHanetCheckinDisplayDate(row.getValue(columnId))
  if (!rowDate) return false
  const [fromStr = "", toStr = ""] = String(filterValue).split(",")
  if (fromStr && rowDate < fromStr) return false
  if (toStr && rowDate > toStr) return false
  return true
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
      size: 120,
      minSize: 120,
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
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
        disableCellLineClamp: true,
        className: "py-2",
      },
      filterFn: hanetCheckinDateRangeFilterFn,
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
        filterVariant: "text",
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
        filterVariant: "text",
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
        filterVariant: "text",
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
        filterVariant: "select",
        filterPlaceholder: "Tất cả thiết bị",
        selectOptions: options?.deviceSelectOptions ?? [],
        disableCellLineClamp: true,
        className: "py-2",
      },
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.getValue(columnId) ?? "") === String(filterValue)
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
      size: 148,
      minSize: 132,
      cell: ({ getValue }) => (
        <HanetCheckinTypeCell type={String(getValue() ?? "")} />
      ),
    },
  ]
}
