import type { QueryClient } from "@tanstack/react-query"
import { asAttendanceBool } from "./event-attendance-sync"
import type { EventAttendanceSocketPayload } from "./use-event-attendance-socket"

/** Khớp `CheckinMethod.FACE_ID` trên API. */
const CHECKIN_METHOD_FACE_ID = 2
const CHECKIN_METHOD_MANUAL = 3

type RegistrationRow = Record<string, unknown>

function rowMatchesPayload(
  row: RegistrationRow,
  payload: EventAttendanceSocketPayload,
): boolean {
  if (payload.registrationId && String(row.id) === payload.registrationId) {
    return true
  }
  const rowEmail = String(row.email ?? "").trim().toLowerCase()
  const payloadEmail = payload.email.trim().toLowerCase()
  return Boolean(rowEmail && payloadEmail && rowEmail === payloadEmail)
}

function resolveFlags(
  row: RegistrationRow,
  payload: EventAttendanceSocketPayload,
): { hasCheckin: boolean; hasCheckout: boolean } {
  if (payload.hasCheckin !== undefined || payload.hasCheckout !== undefined) {
    return {
      hasCheckin:
        payload.hasCheckin !== undefined
          ? asAttendanceBool(payload.hasCheckin)
          : asAttendanceBool(row.hasCheckin),
      hasCheckout:
        payload.hasCheckout !== undefined
          ? asAttendanceBool(payload.hasCheckout)
          : asAttendanceBool(row.hasCheckout),
    }
  }

  if (payload.kind === "checkout") {
    return { hasCheckin: true, hasCheckout: true }
  }
  return {
    hasCheckin: true,
    hasCheckout: asAttendanceBool(row.hasCheckout),
  }
}

/** Cập nhật cờ check-in/out trên cache danh sách đăng ký (không refetch cả bảng). */
export function patchRegistrationAttendanceCache(
  queryClient: QueryClient,
  eventId: string,
  payload: EventAttendanceSocketPayload,
): boolean {
  let matched = false

  queryClient.setQueryData<RegistrationRow[]>(
    ["events", eventId, "registrations"],
    (rows) => {
      if (!rows?.length) return rows

      const next = rows.map((row) => {
        if (!rowMatchesPayload(row, payload)) return row
        matched = true

        const flags = resolveFlags(row, payload)
        return {
          ...row,
          hasCheckin: flags.hasCheckin,
          hasCheckout: flags.hasCheckout,
          updatedAt: payload.at,
          ...(payload.source === "hanet" && payload.kind === "checkin"
            ? { checkinMethod: CHECKIN_METHOD_FACE_ID }
            : {}),
          ...(payload.source === "manual" && payload.kind === "checkin"
            ? { checkinMethod: CHECKIN_METHOD_MANUAL }
            : {}),
        }
      })

      return next
    },
  )

  return matched
}
