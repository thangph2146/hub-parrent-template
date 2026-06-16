import { formatHanetTimeDisplay } from "@workspace/admin-app/lib/hanet-time-format"

export type HanetCheckinRow = {
  rowId: string
  checkinAt: string
  displayName: string
  personId: string
  aliasId: string
  deviceId: string
  deviceName: string
  placeName: string
  avatarUrl: string
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

/** Nhãn `type` / `person_type` trên response getCheckinByPlaceIdInDay (HANET Partner). */
export function formatHanetCheckinListType(value: unknown): string {
  if (value === 0 || value === "0") return "Check-in"
  if (value === 1 || value === "1") return "Check-out"
  if (value === 2 || value === "2") return "Chưa nhận diện"
  if (value != null && String(value).trim()) return `Loại ${String(value)}`
  return ""
}

function pickPersonType(record: Record<string, unknown>): string {
  const value = record.person_type ?? record.personType ?? record.type
  return formatHanetCheckinListType(value)
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
    const deviceId = pickString(record, [
      "deviceID",
      "deviceId",
      "device_id",
      "camera_id",
    ])
    const checkinAt = pickCheckinTime(record)
    const checkinRaw = record.checkinTime ?? record.time ?? record.timestamp
    const rowId =
      [personId, deviceId, String(checkinRaw), checkinAt, String(index)]
        .filter(Boolean)
        .join(":") || `row-${index}`

    return {
      rowId,
      checkinAt: checkinAt || "—",
      displayName:
        pickString(record, ["name", "personName", "person_name", "title"]) ||
        "—",
      personId,
      aliasId: pickString(record, ["aliasID", "aliasId", "alias_id"]),
      deviceId,
      deviceName: pickString(record, ["deviceName", "device_name"]),
      placeName: pickString(record, ["place", "placeName", "place_name"]),
      avatarUrl: pickString(record, [
        "avatar",
        "faceUrl",
        "face_url",
        "image",
        "imagePath",
      ]),
      personType: pickPersonType(record),
    }
  })
}
