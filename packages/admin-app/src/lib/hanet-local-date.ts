/** Ngày local yyyy-MM-dd (input type=date, timezone máy người dùng). */
export function todayLocalIsoDate(): string {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function coerceTrimmedString(value: unknown): string {
  if (value == null) return ""
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : formatIsoDateFromDate(value)
  }
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? String(value) : formatIsoDateFromDate(parsed)
  }
  return String(value).trim()
}

function formatIsoDateFromDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDatetimeLocalFromDate(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  return `${formatIsoDateFromDate(date)}T${hh}:${min}`
}

/** Hiển thị yyyy-MM-dd sang dd/MM/yyyy. */
export function formatIsoDateVi(iso: unknown): string {
  const text = coerceTrimmedString(iso)
  if (!text) return "—"
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!match) return text
  return `${match[3]}/${match[2]}/${match[1]}`
}

/** `input[type=datetime-local]` — đầu ngày local. */
export function localDayStartDatetime(isoDate: unknown): string {
  const day = coerceTrimmedString(isoDate).slice(0, 10)
  return day ? `${day}T00:00` : ""
}

/** `input[type=datetime-local]` — cuối ngày local. */
export function localDayEndDatetime(isoDate: unknown): string {
  const day = coerceTrimmedString(isoDate).slice(0, 10)
  return day ? `${day}T23:59` : ""
}

/** `input[type=datetime-local]` — thời điểm hiện tại (local). */
export function nowLocalDatetime(): string {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

/** Chuẩn hóa giá trị picker → `yyyy-MM-ddTHH:mm` (local). */
export function normalizeDatetimeLocalInput(
  value: unknown,
  fallback = "",
): string {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || fallback
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDatetimeLocalFromDate(value)
  }
  return fallback
}

/** Chuẩn hóa giá trị picker → `yyyy-MM-dd`. */
export function normalizeIsoDateInput(
  value: unknown,
  fallback = todayLocalIsoDate(),
): string {
  if (typeof value === "string") {
    const trimmed = value.trim().slice(0, 10)
    return trimmed || fallback
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatIsoDateFromDate(value)
  }
  return fallback
}

/** Hiển thị `yyyy-MM-ddTHH:mm` sang dd/MM/yyyy HH:mm. */
export function formatDatetimeLocalVi(value: unknown): string {
  const text = normalizeDatetimeLocalInput(value, "")
  if (!text) return "—"
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(text)
  if (!match) return text
  return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`
}

function formatHanetCompactFromDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = String(date.getFullYear())
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  const ss = String(date.getSeconds()).padStart(2, "0")
  return `${dd}${mm}${yyyy}${hh}${min}${ss}`
}

/** DDMMYYYYHHmmss (HANET) → dd/MM/yyyy HH:mm:ss. */
export function formatHanetCompactTimeVi(compact: unknown): string {
  const digits =
    compact instanceof Date && !Number.isNaN(compact.getTime())
      ? formatHanetCompactFromDate(compact)
      : coerceTrimmedString(compact).replace(/\D/g, "")
  if (digits.length !== 14) {
    const fallback = coerceTrimmedString(compact)
    return fallback || "—"
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}:${digits.slice(12, 14)}`
}
