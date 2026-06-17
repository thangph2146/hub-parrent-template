import type { EventHanetSyncSocketPayload } from "@workspace/api-client/realtime"
import type { HanetCheckinRow } from "@workspace/admin-app/lib/hanet-checkin-parse"
import { formatHanetCheckinListType } from "@workspace/admin-app/lib/hanet-checkin-parse"
import { formatHanetTimeDisplay } from "@workspace/admin-app/lib/hanet-time-format"

/** Prefix React Query cho GET check-in HANET (ngày / timestamp). */
export const HANET_CHECKINS_QUERY_KEY = ["hanet", "checkins"] as const

/** Custom event — `useAdminRealtimeSync` phát khi webhook check-in/out. */
export const HANET_CHECKIN_SYNC_EVENT = "hub:hanet-checkin-sync"

/** Polling khi bật realtime (webhook là nguồn nhanh hơn). */
export const HANET_CHECKIN_LIVE_POLL_MS = 3_000

/** Sau webhook gần đây — giảm tần suất poll. */
export const HANET_CHECKIN_LIVE_POLL_AFTER_SOCKET_MS = 10_000

export const HANET_CHECKIN_SOCKET_RECENT_MS = 30_000

export const HANET_CHECKIN_NEW_ROW_HIGHLIGHT_MS = 12_000

export function dispatchHanetCheckinSyncEvent(
  payload: EventHanetSyncSocketPayload,
): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<EventHanetSyncSocketPayload>(HANET_CHECKIN_SYNC_EVENT, {
      detail: payload,
    }),
  )
}

export function isHanetCheckinSyncPayload(
  payload: EventHanetSyncSocketPayload,
): boolean {
  return payload.kind === "checkin" || payload.kind === "checkout"
}

function sameLocalDay(isoOrDate: string, dayIso: string): boolean {
  const day = dayIso.trim().slice(0, 10)
  if (!day) return true
  const parsed = new Date(isoOrDate)
  if (Number.isNaN(parsed.getTime())) return true
  const yyyy = parsed.getFullYear()
  const mm = String(parsed.getMonth() + 1).padStart(2, "0")
  const dd = String(parsed.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}` === day
}

/** Lọc payload webhook theo địa điểm / ngày / khoảng thời gian đang xem. */
export function hanetSyncMatchesCheckinView(
  payload: EventHanetSyncSocketPayload,
  options: {
    placeId: string
    mode: "day" | "timestamp"
    date?: string
    fromAt?: string
    toAt?: string
  },
): boolean {
  if (!isHanetCheckinSyncPayload(payload)) return false

  const placeId = options.placeId.trim()
  const payloadPlaceId = String(payload.placeId ?? "").trim()
  if (placeId && payloadPlaceId && payloadPlaceId !== placeId) {
    return false
  }

  const at = String(payload.at ?? "").trim()
  if (!at) return true

  if (options.mode === "day") {
    return sameLocalDay(at, options.date ?? "")
  }

  const fromAt = options.fromAt?.trim()
  const toAt = options.toAt?.trim()
  if (!fromAt || !toAt) return true

  const parsed = new Date(at)
  if (Number.isNaN(parsed.getTime())) return true
  const from = new Date(fromAt)
  const to = new Date(toAt)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return true
  return parsed.getTime() >= from.getTime() && parsed.getTime() <= to.getTime()
}

export function resolveHanetCheckinLivePollMs(lastSyncAt: Date | null): number {
  if (
    lastSyncAt &&
    Date.now() - lastSyncAt.getTime() < HANET_CHECKIN_SOCKET_RECENT_MS
  ) {
    return HANET_CHECKIN_LIVE_POLL_AFTER_SOCKET_MS
  }
  return HANET_CHECKIN_LIVE_POLL_MS
}

export function checkinRowFromSyncPayload(
  payload: EventHanetSyncSocketPayload,
): HanetCheckinRow | null {
  if (!isHanetCheckinSyncPayload(payload)) return null

  const personId = String(payload.personId ?? "").trim()
  const deviceId = String(payload.deviceId ?? "").trim()
  const atRaw = String(payload.at ?? "").trim()
  const checkinAt = formatHanetTimeDisplay(atRaw) ?? atRaw ?? "—"
  const displayName =
    String(payload.fullName ?? payload.personName ?? "").trim() || "—"
  const rowId = [
    "live",
    payload.kind,
    personId,
    deviceId,
    atRaw,
    displayName,
  ]
    .filter(Boolean)
    .join(":")

  return {
    rowId,
    checkinAt,
    displayName,
    personId,
    aliasId: personId,
    deviceId,
    deviceName: String(payload.deviceName ?? "").trim(),
    placeName: String(payload.placeId ?? "").trim(),
    avatarUrl: "",
    personType:
      payload.kind === "checkout"
        ? "Check-out"
        : formatHanetCheckinListType(0),
  }
}

export function rowSignature(row: HanetCheckinRow): string {
  return [
    row.personId,
    row.aliasId,
    row.deviceId,
    row.checkinAt,
    row.personType,
  ]
    .join("|")
    .toLowerCase()
}

/** Ghép dòng tạm từ webhook với dữ liệu API — ưu tiên API khi trùng chữ ký. */
export function mergeHanetCheckinRows(
  apiRows: HanetCheckinRow[],
  liveRows: HanetCheckinRow[],
): HanetCheckinRow[] {
  if (liveRows.length === 0) return apiRows

  const apiSignatures = new Set(apiRows.map(rowSignature))
  const pendingLive = liveRows.filter(
    (row) => !apiSignatures.has(rowSignature(row)),
  )
  if (pendingLive.length === 0) return apiRows

  const merged = [...pendingLive, ...apiRows]
  const seen = new Set<string>()
  const deduped: HanetCheckinRow[] = []
  for (const row of merged) {
    if (seen.has(row.rowId)) continue
    seen.add(row.rowId)
    deduped.push(row)
  }
  return deduped
}
