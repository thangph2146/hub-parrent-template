/** Ngày local yyyy-MM-dd (input type=date, timezone máy người dùng). */
export function todayLocalIsoDate(): string {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

/** Hiển thị yyyy-MM-dd sang dd/MM/yyyy. */
export function formatIsoDateVi(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return iso
  return `${match[3]}/${match[2]}/${match[1]}`
}

/** `input[type=datetime-local]` — đầu ngày local. */
export function localDayStartDatetime(isoDate: string): string {
  const day = isoDate.trim().slice(0, 10)
  return `${day}T00:00`
}

/** `input[type=datetime-local]` — cuối ngày local. */
export function localDayEndDatetime(isoDate: string): string {
  const day = isoDate.trim().slice(0, 10)
  return `${day}T23:59`
}

/** Hiển thị `yyyy-MM-ddTHH:mm` sang dd/MM/yyyy HH:mm. */
export function formatDatetimeLocalVi(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim())
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`
}

/** DDMMYYYYHHmmss (HANET) → dd/MM/yyyy HH:mm:ss. */
export function formatHanetCompactTimeVi(compact: string): string {
  const digits = compact.replace(/\D/g, "")
  if (digits.length !== 14) return compact
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}:${digits.slice(12, 14)}`
}
