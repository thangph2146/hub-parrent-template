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
  if (col.id === "actions" || col.id === "attendanceActions") return false
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

type FlatExportRow<T> = {
  row: T
  /** Tiền tố cây kiểu thư mục: `├── `, `│   └── `, … */
  treePrefix: string
}

function flattenTreeForExport<T>(
  data: T[],
  getSubRows: (row: T) => T[] | undefined
): FlatExportRow<T>[] {
  const result: FlatExportRow<T>[] = []

  function walk(rows: T[], linePrefix: string, depth: number) {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]!
      const isLast = index === rows.length - 1
      const connector = isLast ? "└── " : "├── "

      result.push({
        row,
        treePrefix: depth === 0 ? "" : `${linePrefix}${connector}`,
      })

      const children = getSubRows(row)
      if (children?.length) {
        const childLinePrefix =
          depth === 0 ? "" : `${linePrefix}${isLast ? "    " : "│   "}`
        walk(children, childLinePrefix, depth + 1)
      }
    }
  }

  walk(data, "", 0)
  return result
}

function resolveExportRows<T>(
  data: T[],
  getSubRows?: (row: T) => T[] | undefined
): FlatExportRow<T>[] {
  if (getSubRows) return flattenTreeForExport(data, getSubRows)
  return data.map((row) => ({ row, treePrefix: "" }))
}

export type BuildCsvFromColumnsOptions<T> = {
  /** Dùng khi bảng hiển thị dạng cây — xuất đủ nhánh con theo thứ tự depth-first. */
  getSubRows?: (row: T) => T[] | undefined
}

/**
 * Xuất đúng mảng `data` hiện có (vd. một trang API / đã lọc client).
 * Cột `id: "stt"` tự điền 1, 2, 3…; cột khác không có accessor sẽ thành ô trống.
 */
export function buildCsvFromColumns<T>(
  data: T[],
  columns: ColumnDef<T, unknown>[],
  options?: BuildCsvFromColumnsOptions<T>
): {
  headers: string[]
  rows: string[][]
  columnWidths: Array<number | undefined>
  columnWraps: Array<boolean | undefined>
} {
  const exportCols = columns.filter(shouldExportColumn)
  const headers = exportCols.map(columnTitle)
  const exportRows = resolveExportRows(data, options?.getSubRows)
  const rows = exportRows.map(({ row, treePrefix }, rowIndex) =>
    exportCols.map((col, colIndex) => {
      const text =
        col.id === "stt" ? String(rowIndex + 1) : cellText(row, col)
      if (options?.getSubRows && treePrefix && colIndex === 0) {
        return `${treePrefix}${text}`
      }
      return text
    })
  )
  const columnWidths = exportCols.map(columnWidth)
  const columnWraps = exportCols.map(columnWrap)
  return { headers, rows, columnWidths, columnWraps }
}
