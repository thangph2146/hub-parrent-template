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
