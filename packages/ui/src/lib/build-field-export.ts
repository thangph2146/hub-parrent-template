import { formatExportDateTime } from "./format-export-value"

export type ExportFieldDef<T> = {
  header: string
  value: (row: T) => unknown
  width?: number
  wrap?: boolean
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

/**
 * Xuất dòng phẳng từ định nghĩa field — dùng khi bảng UI có quan hệ/nhúng
 * (parse JSON, denormalize FK, tách cột ảo không có trên DataTable).
 */
export function buildExportFromFields<T>(
  data: T[],
  fields: ExportFieldDef<T>[]
): {
  headers: string[]
  rows: string[][]
  columnWidths: Array<number | undefined>
  columnWraps: Array<boolean | undefined>
} {
  const headers = fields.map((f) => f.header)
  const rows = data.map((row) => fields.map((f) => stringifyCell(f.value(row))))
  return {
    headers,
    rows,
    columnWidths: fields.map((f) => f.width),
    columnWraps: fields.map((f) => f.wrap),
  }
}
