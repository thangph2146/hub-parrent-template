"use client"

import type { ColumnDef, FilterFn, FilterFnOption } from "@tanstack/react-table"
import { CalendarClock } from "lucide-react"
import { formatAdminDateTime } from "./format-admin-datetime"

export type AdminTableView = "list" | "trash"

export const adminDateRangeFilterFn: FilterFn<unknown> = (
  row,
  columnId,
  filterValue
) => {
  if (filterValue == null || filterValue === "") return true
  const rowVal = row.getValue(columnId) as string
  if (!rowVal) return false
  const [fromStr, toStr] = String(filterValue).split(",")
  const rowDate = rowVal.split("T")[0]
  if (fromStr && rowDate < fromStr) return false
  if (toStr && rowDate > toStr) return false
  return true
}

const DEFAULT_ADMIN_DATE_COLUMN_CLASS =
  "w-[180px] min-w-[180px] max-w-[185px]"

/** @deprecated Dùng `adminDateRangeFilterFn`. */
export const adminDeletedAtDateRangeFilterFn = adminDateRangeFilterFn

type AdminDateColumnOptions = {
  header?: string
  enableColumnFilter?: boolean
  showIcon?: boolean
  defaultHidden?: boolean
  meta?: ColumnDef<unknown>["meta"]
}

function defineAdminDateColumn<TData>(
  accessorKey: "createdAt" | "updatedAt" | "deletedAt",
  defaults: Required<
    Pick<AdminDateColumnOptions, "header" | "enableColumnFilter" | "defaultHidden">
  >,
  options: AdminDateColumnOptions = {}
): ColumnDef<TData> {
  const {
    header = defaults.header,
    enableColumnFilter = defaults.enableColumnFilter,
    showIcon = true,
    defaultHidden = defaults.defaultHidden,
    meta: extraMeta,
  } = options

  return {
    accessorKey,
    header,
    enableColumnFilter,
    enableSorting: true,
    filterFn: enableColumnFilter
      ? (adminDateRangeFilterFn as FilterFnOption<TData>)
      : undefined,
    meta: {
      defaultHidden,
      filterVariant: enableColumnFilter ? "date-range" : undefined,
      filterPlaceholder: enableColumnFilter ? "Chọn khoảng ngày" : undefined,
      className: extraMeta?.className ?? DEFAULT_ADMIN_DATE_COLUMN_CLASS,
      exportHeader: header,
      exportValue: (row: TData) => {
        const val = (row as Record<string, unknown>)[accessorKey]
        const formatted = formatAdminDateTime(
          val as string | Date | number | null | undefined
        )
        return formatted === "—" ? "" : formatted
      },
      ...extraMeta,
    },
    cell: ({ getValue }) => {
      const formatted = formatAdminDateTime(getValue() as string)
      if (!showIcon) {
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatted}
          </span>
        )
      }
      return (
        <span className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
          <CalendarClock className="size-3.5 shrink-0" aria-hidden />
          {formatted}
        </span>
      )
    },
  }
}

/** Cột `createdAt` — lọc khoảng ngày giống `updatedAt` / `deletedAt`. */
export function defineAdminCreatedAtColumn<TData>(
  options: AdminDateColumnOptions = {}
): ColumnDef<TData> {
  return defineAdminDateColumn<TData>("createdAt", {
    header: "Tạo lúc",
    enableColumnFilter: true,
    defaultHidden: false,
  }, options)
}

/** Cột `updatedAt` — lọc khoảng ngày. */
export function defineAdminUpdatedAtColumn<TData>(
  options: AdminDateColumnOptions = {}
): ColumnDef<TData> {
  return defineAdminDateColumn<TData>("updatedAt", {
    header: "Cập nhật lúc",
    enableColumnFilter: true,
    defaultHidden: false,
  }, options)
}

type DeletedAtColumnOptions = {
  header?: string
  /** Bật lọc khoảng ngày — mặc định bật ở thùng rác. */
  enableColumnFilter?: boolean
  showIcon?: boolean
}

/** Cột `deletedAt` dùng chung list + trash; ẩn mặc định ở danh sách, hiện ở thùng rác. */
export function defineAdminDeletedAtColumn<TData>(
  view: AdminTableView,
  options: DeletedAtColumnOptions = {}
): ColumnDef<TData> {
  const {
    header = "Xóa lúc",
    enableColumnFilter = view === "trash",
    showIcon = true,
  } = options

  return defineAdminDateColumn<TData>(
    "deletedAt",
    {
      header,
      enableColumnFilter,
      defaultHidden: view === "list",
    },
    { showIcon }
  )
}

/** Ghép cột dữ liệu + deletedAt + cột thao tác theo view list/trash. */
export function buildAdminTableColumns<TData>({
  view,
  dataColumns,
  listActionsColumn,
  trashActionsColumn,
  deletedAtColumn,
}: {
  view: AdminTableView
  dataColumns: ColumnDef<TData>[]
  listActionsColumn: ColumnDef<TData>
  trashActionsColumn: ColumnDef<TData>
  deletedAtColumn?: ColumnDef<TData>
}): ColumnDef<TData>[] {
  const deletedAt = deletedAtColumn ?? defineAdminDeletedAtColumn<TData>(view)
  return [
    ...dataColumns,
    deletedAt,
    view === "trash" ? trashActionsColumn : listActionsColumn,
  ]
}

/** Loại cột trùng `id` / `accessorKey` (giữ bản cuối). */
export function dedupeAdminTableColumns<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  const seen = new Set<string>()
  const result: ColumnDef<TData>[] = []
  for (let i = columns.length - 1; i >= 0; i--) {
    const col = columns[i]
    const accessorKey =
      "accessorKey" in col && typeof col.accessorKey === "string"
        ? col.accessorKey
        : undefined
    const key = col.id ?? accessorKey ?? `__idx_${i}`
    if (seen.has(key)) continue
    seen.add(key)
    result.unshift(col)
  }
  return result
}
