import type { ColumnDef } from "@tanstack/react-table"
import { formatExportDateTime } from "./format-export-value"

type ExportColumnMeta<T> = {
  excludeFromExport?: boolean
  exportHeader?: string
  exportValue?: (row: T) => unknown
  exportWidth?: number
  exportWrap?: boolean
}

function stringifyCell(v: unknown): string {
  if (v == null) return ""
  const formattedDate = formatExportDateTime(v)
  if (formattedDate != null) return formattedDate
  if (typeof v === "boolean") return v ? "Có" : "Không"
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : ""
  if (typeof v === "string") return v
  if (typeof v === "object") {
    try {
      return JSON.stringify(v)
    } catch {
      return ""
    }
  }
  return String(v)
}

function columnTitle<T>(col: ColumnDef<T, unknown>): string {
  const meta = col.meta as ExportColumnMeta<T> | undefined
  if (meta?.exportHeader?.trim()) return meta.exportHeader.trim()
  const h = col.header
  if (typeof h === "string" && h.trim()) return h.trim()
  if ("accessorKey" in col && col.accessorKey != null)
    return String(col.accessorKey)
  return col.id ?? ""
}

function getByPath(row: unknown, path: string): unknown {
  if (!path) return undefined
  return path.split(".").reduce<unknown>((current, part) => {
    if (current == null || typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[part]
  }, row)
}

function cellText<T>(row: T, col: ColumnDef<T, unknown>): string {
  try {
    const meta = col.meta as ExportColumnMeta<T> | undefined
    if (meta?.exportValue) {
      return stringifyCell(meta.exportValue(row))
    }
    if ("accessorFn" in col && typeof col.accessorFn === "function") {
      return stringifyCell(col.accessorFn(row, 0))
    }
    if ("accessorKey" in col && col.accessorKey != null) {
      const key = String(col.accessorKey)
      return stringifyCell(getByPath(row, key))
    }
  } catch {
    return ""
  }
  return ""
}

function shouldExportColumn<T>(col: ColumnDef<T, unknown>): boolean {
  if (col.id === "_expand") return false
  if (col.id === "actions") return false
  const meta = col.meta as ExportColumnMeta<T> | undefined
  if (meta?.excludeFromExport) return false
  return true
}

function columnWidth<T>(col: ColumnDef<T, unknown>): number | undefined {
  const meta = col.meta as ExportColumnMeta<T> | undefined
  return meta?.exportWidth
}

function columnWrap<T>(col: ColumnDef<T, unknown>): boolean | undefined {
  const meta = col.meta as ExportColumnMeta<T> | undefined
  return meta?.exportWrap
}

/**
 * Xuất đúng mảng `data` hiện có (vd. một trang API / đã lọc client).
 * Cột không có accessorKey/accessorFn sẽ thành ô trống.
 */
export function buildCsvFromColumns<T>(
  data: T[],
  columns: ColumnDef<T, unknown>[]
): {
  headers: string[]
  rows: string[][]
  columnWidths: Array<number | undefined>
  columnWraps: Array<boolean | undefined>
} {
  const exportCols = columns.filter(shouldExportColumn)
  const headers = exportCols.map(columnTitle)
  const rows = data.map((row) => exportCols.map((col) => cellText(row, col)))
  const columnWidths = exportCols.map(columnWidth)
  const columnWraps = exportCols.map(columnWrap)
  return { headers, rows, columnWidths, columnWraps }
}
