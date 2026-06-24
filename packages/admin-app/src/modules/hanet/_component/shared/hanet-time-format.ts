const HANET_TIME_KEYS = new Set([
  "time",
  "date_time",
  "dateTime",
  "checkinTime",
  "checkin_time",
  "timestamp",
  "checkin_time_stamp",
])

export function isHanetTimeField(key: string): boolean {
  return HANET_TIME_KEYS.has(key) || /time|timestamp/i.test(key)
}

/** Định dạng epoch giây/ms hoặc chuỗi DDMMYYYYHHmmss từ HANET. */
export function formatHanetTimeDisplay(value: unknown): string | null {
  if (value == null) return null

  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000
    const date = new Date(ms)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("vi-VN", { hour12: false })
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (/^\d{14}$/.test(trimmed)) {
      const dd = trimmed.slice(0, 2)
      const mm = trimmed.slice(2, 4)
      const yyyy = trimmed.slice(4, 8)
      const hh = trimmed.slice(8, 10)
      const mi = trimmed.slice(10, 12)
      const ss = trimmed.slice(12, 14)
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`
    }

    const numeric = Number(trimmed)
    if (/^\d+$/.test(trimmed) && Number.isFinite(numeric)) {
      return formatHanetTimeDisplay(numeric)
    }

    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("vi-VN", { hour12: false })
    }
  }

  return null
}
