const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

const VI_DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

const VI_DATE_ONLY: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}

function isPlausibleTimestampMs(value: number): boolean {
  return value >= 946_684_800_000 && value <= 4_102_444_800_000
}

/** Format ngày giờ export đồng bộ với admin UI (`toLocaleString("vi-VN")`). */
export function formatExportDateTime(value: unknown): string | null {
  if (value == null || value === "") return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toLocaleString("vi-VN", VI_DATE_TIME)
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (!isPlausibleTimestampMs(value)) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? null
      : date.toLocaleString("vi-VN", VI_DATE_TIME)
  }

  if (typeof value !== "string") return null

  const trimmed = value.trim()
  if (!trimmed || !ISO_DATE_PREFIX.test(trimmed)) return null

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return null

  if (DATE_ONLY.test(trimmed)) {
    return date.toLocaleDateString("vi-VN", VI_DATE_ONLY)
  }

  return date.toLocaleString("vi-VN", VI_DATE_TIME)
}

type NamedExportItem = {
  name?: string | null
  label?: string | null
  displayName?: string | null
  title?: string | null
}

/** Danh mục / thẻ / taxonomy — xuất tên, không JSON. */
export function formatNamedListForExport(
  items: readonly NamedExportItem[] | null | undefined,
  separator = ", "
): string {
  if (!items?.length) return ""
  return items
    .map((item) => {
      const label =
        item.name?.trim() ||
        item.label?.trim() ||
        item.displayName?.trim() ||
        item.title?.trim() ||
        ""
      return label
    })
    .filter(Boolean)
    .join(separator)
}

/** Chuỗi export cho mảng ô dữ liệu (taxonomy, tag, …). */
export function formatArrayCellForExport(value: unknown[]): string | null {
  if (!value.length) return ""

  const stringItems = value.filter((item) => typeof item === "string") as string[]
  if (stringItems.length === value.length) {
    return stringItems.map((s) => s.trim()).filter(Boolean).join(", ")
  }

  const objectItems = value.filter(
    (item) => item != null && typeof item === "object" && !Array.isArray(item)
  ) as NamedExportItem[]
  if (objectItems.length === value.length) {
    const labels = formatNamedListForExport(objectItems)
    return labels || null
  }

  return null
}
