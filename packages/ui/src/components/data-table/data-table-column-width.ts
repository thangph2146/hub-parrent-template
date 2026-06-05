import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "../../lib/utils"
import { resolveDataTableColumnId } from "./data-table-columns"
import { DATA_TABLE_ACTIONS_COLUMN_ID } from "./table-row-actions"

type ColumnMetaLike = {
  className?: string
  isActionsColumn?: boolean
  isIndexColumn?: boolean
  disableCellLineClamp?: boolean
}

/** Số dòng tối đa hiển thị trong ô dữ liệu (ellipsis sau dòng thứ 5). */
export const DATA_TABLE_CELL_MAX_LINES = 5

export const DATA_TABLE_CELL_CONTENT_CLAMP_CLASS = "line-clamp-5 break-words min-w-0 w-full"

export const DATA_TABLE_INDEX_COLUMN_ID = "stt"
export const DATA_TABLE_EXPAND_COLUMN_ID = "_expand"
export const DATA_TABLE_SELECTION_COLUMN_ID = "_select"

/** Min-width mặc định cho cột dữ liệu (ngoài checkbox, STT, expand, thao tác). */
export const DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_WIDTH_CLASS = "min-w-[180px]"
export const DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_SIZE = 180

const COLUMN_EXPLICIT_WIDTH_CLASS =
  /\b(min-w-|max-w-|w-\[|w-\d|w-auto|w-full|w-fit)\b/

export function columnHasExplicitWidthClass(
  meta: ColumnMetaLike | undefined
): boolean {
  return Boolean(
    meta?.className && COLUMN_EXPLICIT_WIDTH_CLASS.test(meta.className)
  )
}

export function columnDefHasExplicitSize(columnDef: {
  size?: number
  minSize?: number
  maxSize?: number
}): boolean {
  return (
    columnDef.size != null ||
    columnDef.minSize != null ||
    columnDef.maxSize != null
  )
}

export function isDataTableActionsColumn(
  columnId: string,
  meta: ColumnMetaLike | undefined
): boolean {
  return (
    columnId === DATA_TABLE_ACTIONS_COLUMN_ID || meta?.isActionsColumn === true
  )
}

/** Checkbox, STT, expand cây, thao tác — không dùng min-width dữ liệu mặc định. */
export function isDataTableStructuralColumn(
  columnId: string,
  meta: ColumnMetaLike | undefined
): boolean {
  return (
    columnId === DATA_TABLE_SELECTION_COLUMN_ID ||
    columnId === DATA_TABLE_INDEX_COLUMN_ID ||
    columnId === DATA_TABLE_EXPAND_COLUMN_ID ||
    columnId === "_index" ||
    columnId === "attendanceActions" ||
    meta?.isIndexColumn === true ||
    isDataTableActionsColumn(columnId, meta)
  )
}

export function shouldClampDataTableCellContent(
  columnId: string,
  meta: ColumnMetaLike | undefined
): boolean {
  if (isDataTableStructuralColumn(columnId, meta)) return false
  if (meta?.disableCellLineClamp) return false
  return true
}

export function dataTableCellContentClampClassName(
  columnId: string,
  meta: ColumnMetaLike | undefined
): string | undefined {
  return shouldClampDataTableCellContent(columnId, meta)
    ? DATA_TABLE_CELL_CONTENT_CLAMP_CLASS
    : undefined
}

export function dataTableCellWidthClassName(
  columnId: string,
  meta: ColumnMetaLike | undefined,
  columnDef?: { size?: number; minSize?: number; maxSize?: number }
): string {
  const hasExplicit =
    columnHasExplicitWidthClass(meta) ||
    Boolean(columnDef && columnDefHasExplicitSize(columnDef))
  const isStructural = isDataTableStructuralColumn(columnId, meta)
  return cn(
    "align-middle whitespace-normal",
    isStructural || hasExplicit
      ? "min-w-0"
      : DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_WIDTH_CLASS,
    meta?.className
  )
}

/**
 * Gắn `min-w-[180px]` + `minSize: 180` cho cột dữ liệu khi page chưa khai báo width.
 */
export function applyDefaultDataColumnWidths<TData>(
  columns: ColumnDef<TData, unknown>[]
): ColumnDef<TData, unknown>[] {
  return columns.map((column) => {
    const group = column as ColumnDef<TData, unknown> & {
      columns?: ColumnDef<TData, unknown>[]
    }
    const children = group.columns
      ? applyDefaultDataColumnWidths(group.columns)
      : undefined

    const id = resolveDataTableColumnId(column) ?? ""
    const meta = column.meta as ColumnMetaLike | undefined
    const base = children ? { ...column, columns: children } : column

    if (isDataTableStructuralColumn(id, meta)) {
      return base
    }

    const hasExplicit =
      columnHasExplicitWidthClass(meta) || columnDefHasExplicitSize(column)

    if (hasExplicit) {
      return base
    }

    return {
      ...base,
      minSize: DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_SIZE,
      meta: {
        ...meta,
        className: cn(
          DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_WIDTH_CLASS,
          meta?.className
        ),
      },
    }
  })
}
