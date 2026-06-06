import { formatDateTime as formatDateTimeCore } from "@workspace/api-client"

/** Chuỗi ISO / timestamp có thể parse thành ngày giờ. */
export function isParsableDateTime(value: unknown): boolean {
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  if (typeof value === "number" && Number.isFinite(value)) {
    return !Number.isNaN(new Date(value).getTime())
  }
  if (typeof value !== "string") return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return true
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) return true
  const ms = Date.parse(trimmed)
  return !Number.isNaN(ms) && /[T:/-]/.test(trimmed)
}

/**
 * Định dạng ngày giờ chuẩn admin table: `HH:mm DD/MM/YYYY` (vi-VN).
 * Dùng cho cột Tạo lúc / Cập nhật / Xóa lúc và export Excel.
 */
export function formatAdminDateTime(
  value: string | Date | number | null | undefined
): string {
  if (value == null || value === "") return "—"
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? "—"
      : formatDateTimeCore(value.toISOString()) || "—"
  }
  if (typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? "—"
      : formatDateTimeCore(date.toISOString()) || "—"
  }
  const trimmed = String(value).trim()
  if (!trimmed) return "—"
  if (!isParsableDateTime(trimmed)) return trimmed
  return formatDateTimeCore(trimmed) || "—"
}
