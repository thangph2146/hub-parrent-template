import { formatHanetTimeDisplay } from "@workspace/admin-app/lib/hanet-time-format"

export type HanetCheckinRow = {
  rowId: string
  checkinAt: string
  displayName: string
  personId: string
  aliasId: string
  deviceId: string
  personType: string
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value)
    }
  }
  return ""
}

function pickCheckinTime(record: Record<string, unknown>): string {
  for (const key of [
    "time",
    "date_time",
    "dateTime",
    "checkinTime",
    "checkin_time",
    "timestamp",
  ]) {
    const formatted = formatHanetTimeDisplay(record[key])
    if (formatted) return formatted
  }
  return ""
}

function pickPersonType(record: Record<string, unknown>): string {
  const value = record.person_type ?? record.personType ?? record.type
  if (value === 0 || value === "0") return "Check-in"
  if (value === 1 || value === "1") return "Check-out"
  if (value != null && String(value).trim()) return String(value)
  return ""
}

export function parseHanetCheckinRows(rows: unknown[]): HanetCheckinRow[] {
  return rows.map((raw, index) => {
    const record =
      raw != null && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {}

    const personId = pickString(record, [
      "personID",
      "personId",
      "person_id",
    ])
    const checkinAt = pickCheckinTime(record)
    const rowId =
      [personId, checkinAt, String(index)].filter(Boolean).join(":") ||
      `row-${index}`

    return {
      rowId,
      checkinAt: checkinAt || "—",
      displayName:
        pickString(record, ["name", "personName", "person_name", "title"]) ||
        "—",
      personId,
      aliasId: pickString(record, ["aliasID", "aliasId", "alias_id"]),
      deviceId: pickString(record, [
        "deviceID",
        "deviceId",
        "device_id",
        "camera_id",
      ]),
      personType: pickPersonType(record),
    }
  })
}
