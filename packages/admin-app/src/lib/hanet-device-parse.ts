export type HanetDeviceOption = {
  deviceId: string
  name: string
  placeId?: string
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

function parseDeviceRecord(raw: unknown): HanetDeviceOption | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const record = raw as Record<string, unknown>
  const deviceId = pickString(record, [
    "deviceID",
    "deviceId",
    "device_id",
    "id",
  ])
  if (!deviceId) return null
  const name = pickString(record, [
    "deviceName",
    "device_name",
    "name",
    "title",
  ])
  const placeId = pickString(record, ["placeID", "placeId", "place_id"])
  return {
    deviceId,
    name: name || `Device ${deviceId}`,
    ...(placeId ? { placeId } : {}),
  }
}

function collectArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []
  const record = value as Record<string, unknown>
  for (const key of [
    "list",
    "devices",
    "deviceList",
    "items",
    "rows",
    "data",
  ]) {
    const nested = record[key]
    if (Array.isArray(nested)) return nested
  }
  return []
}

/** Parse payload từ `GET /admin/hanet/devices`. */
export function parseHanetDevicesResponse(data: unknown): HanetDeviceOption[] {
  return collectArray(data)
    .map((row) => parseDeviceRecord(row))
    .filter((row): row is HanetDeviceOption => row != null)
}
