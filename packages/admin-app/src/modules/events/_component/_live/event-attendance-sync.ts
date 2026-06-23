import type { QueryClient } from "@tanstack/react-query"
import type { EventDetail } from "../types"
import { patchRegistrationAttendanceCache } from "./patch-registration-attendance-cache"
import type { EventAttendanceSocketPayload } from "./use-event-attendance-socket"

type RegistrationRow = Record<string, unknown>

/** API / DB có thể trả 0/1 thay vì boolean. */
export function asAttendanceBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1"
}

function recountFromRegistrations(regs: RegistrationRow[]) {
  let totalCheckins = 0
  let totalCheckouts = 0
  for (const row of regs) {
    if (asAttendanceBool(row.hasCheckin)) totalCheckins += 1
    if (asAttendanceBool(row.hasCheckout)) totalCheckouts += 1
  }
  return { totalCheckins, totalCheckouts }
}

function patchEventDetailCounts(
  queryClient: QueryClient,
  eventId: string,
  regs: RegistrationRow[]
): void {
  const { totalCheckins, totalCheckouts } = recountFromRegistrations(regs)
  queryClient.setQueryData<EventDetail>(
    ["events", "detail", eventId],
    (detail) => {
      if (!detail) return detail
      return {
        ...detail,
        totalCheckins,
        totalCheckouts,
      }
    }
  )
}

function cloneRegistrations(regs: RegistrationRow[]): RegistrationRow[] {
  return regs.map((row) => ({ ...row }))
}

/**
 * Gộp cache React Query + payload realtime mới nhất — bảng re-render ngay
 * kể cả khi query observer chưa kịp notify.
 */
export function mergeRegistrationRowsForDisplay(
  rows: RegistrationRow[] | undefined,
  lastPayload: EventAttendanceSocketPayload | null
): RegistrationRow[] {
  const base = cloneRegistrations(rows ?? [])
  if (!lastPayload?.registrationId) return base

  const targetId = String(lastPayload.registrationId)
  return base.map((row) => {
    if (String(row.id ?? "") !== targetId) {
      return {
        ...row,
        hasCheckin: asAttendanceBool(row.hasCheckin),
        hasCheckout: asAttendanceBool(row.hasCheckout),
        avatar: row.avatar ?? null,
      }
    }

    const hasCheckin =
      lastPayload.hasCheckin !== undefined
        ? asAttendanceBool(lastPayload.hasCheckin)
        : lastPayload.kind === "checkout"
          ? true
          : true
    const hasCheckout =
      lastPayload.hasCheckout !== undefined
        ? asAttendanceBool(lastPayload.hasCheckout)
        : lastPayload.kind === "checkout"

    return {
      ...row,
      hasCheckin,
      hasCheckout,
      avatar: row.avatar ?? null,
      updatedAt: lastPayload.at,
    }
  })
}

export function buildManualAttendancePayload(
  eventId: string,
  registrationId: string,
  row: RegistrationRow,
  action:
    | "checkin"
    | "checkout"
    | "reset-checkin"
    | "reset-checkout"
    | "reset-all"
): EventAttendanceSocketPayload {
  const at = new Date().toISOString()
  let hasCheckin = asAttendanceBool(row.hasCheckin)
  let hasCheckout = asAttendanceBool(row.hasCheckout)

  switch (action) {
    case "checkin":
      hasCheckin = true
      break
    case "checkout":
      hasCheckin = true
      hasCheckout = true
      break
    case "reset-checkout":
      hasCheckout = false
      break
    case "reset-checkin":
      hasCheckin = false
      hasCheckout = false
      break
    case "reset-all":
      hasCheckin = false
      hasCheckout = false
      break
  }

  return {
    kind: action === "checkout" ? "checkout" : "checkin",
    eventId,
    at,
    email: String(row.email ?? ""),
    fullName: String(row.fullName ?? ""),
    source: "manual",
    registrationId,
    hasCheckin,
    hasCheckout,
  }
}

export function buildPayloadFromRegistrationRow(
  eventId: string,
  row: RegistrationRow
): EventAttendanceSocketPayload {
  return {
    kind: asAttendanceBool(row.hasCheckout) ? "checkout" : "checkin",
    eventId,
    at: String(row.updatedAt ?? new Date().toISOString()),
    email: String(row.email ?? ""),
    fullName: String(row.fullName ?? ""),
    source: "manual",
    registrationId: String(row.id ?? ""),
    hasCheckin: asAttendanceBool(row.hasCheckin),
    hasCheckout: asAttendanceBool(row.hasCheckout),
  }
}

/**
 * Đồng bộ cache + đánh dấu stale (không refetch đồng loạt — tránh ghi đè optimistic).
 */
export function syncEventAttendanceUi(
  queryClient: QueryClient,
  eventId: string,
  payload: EventAttendanceSocketPayload
): void {
  patchRegistrationAttendanceCache(queryClient, eventId, payload)

  const regs = queryClient.getQueryData<RegistrationRow[]>([
    "events",
    eventId,
    "registrations",
  ])
  if (regs?.length) {
    patchEventDetailCounts(queryClient, eventId, regs)
  }
}

export function applyOptimisticRegistrationAttendance(
  rows: RegistrationRow[] | undefined,
  registrationId: string,
  action:
    | "checkin"
    | "checkout"
    | "reset-checkin"
    | "reset-checkout"
    | "reset-all"
): RegistrationRow[] | undefined {
  if (!rows?.length) return rows
  const at = new Date().toISOString()
  const CHECKIN_METHOD_MANUAL = 3

  return rows.map((row) => {
    if (String(row.id) !== registrationId) return row
    switch (action) {
      case "checkin":
        return {
          ...row,
          hasCheckin: true,
          checkinMethod: CHECKIN_METHOD_MANUAL,
          updatedAt: at,
        }
      case "checkout":
        return {
          ...row,
          hasCheckin: true,
          hasCheckout: true,
          updatedAt: at,
        }
      case "reset-checkout":
        return {
          ...row,
          hasCheckout: false,
          updatedAt: at,
        }
      case "reset-checkin":
        return {
          ...row,
          hasCheckin: false,
          hasCheckout: false,
          checkinMethod: 0,
          updatedAt: at,
        }
      case "reset-all":
        return {
          ...row,
          hasCheckin: false,
          hasCheckout: false,
          checkinMethod: 0,
          updatedAt: at,
        }
      default:
        return row
    }
  })
}
