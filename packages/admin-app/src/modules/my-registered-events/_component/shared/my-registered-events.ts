import type { createStoreSyncSdk } from "@workspace/api-client"
import { computeEventStatus } from "./event-display"
import { getRegistrationPeriodState } from "./registration-period"

/** Khớp `RegistrationStatus` trên API (`event-registration.entity.ts`). */
export const MY_REGISTRATION_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  CANCELLED: 2,
} as const

export type MyRegisteredEvent = {
  id: string
  eventId: string
  email: string
  fullName: string
  phone: string | null
  registeredAt: string | null
  status: number
  hasCheckin: boolean
  hasCheckout: boolean
  attendanceStatus: number
  attendanceMinutes: number
  checkinMethod: number
  event: {
    id: string
    title: string
    slug: string | null
    poster: unknown
    startDate: string | null
    endDate: string | null
    registrationStart: string | null
    registrationEnd: string | null
    location: string | null
    address: string | null
    format: number
    status: number
  }
}

export type MyRegisteredEventStats = {
  total: number
  active: number
  cancelled: number
  upcoming: number
  checkedIn: number
}

export type CancelRegistrationState =
  | { allowed: true }
  | { allowed: false; reason: string }

export function isActiveMyRegistration(row: MyRegisteredEvent): boolean {
  return row.status !== MY_REGISTRATION_STATUS.CANCELLED
}

export function isCheckedInMyRegistration(row: MyRegisteredEvent): boolean {
  return isActiveMyRegistration(row) && row.hasCheckin === true
}

export function isUpcomingMyRegistration(row: MyRegisteredEvent): boolean {
  if (!isActiveMyRegistration(row)) return false
  if (!row.event.startDate) return false
  if (Number.isNaN(Date.parse(row.event.startDate))) return false
  return computeEventStatus(row.event) === "upcoming"
}

export function computeMyRegisteredEventStats(
  rows: MyRegisteredEvent[],
): MyRegisteredEventStats {
  let active = 0
  let cancelled = 0
  let upcoming = 0
  let checkedIn = 0

  for (const row of rows) {
    if (isActiveMyRegistration(row)) {
      active += 1
      if (isCheckedInMyRegistration(row)) checkedIn += 1
      if (isUpcomingMyRegistration(row)) upcoming += 1
    } else {
      cancelled += 1
    }
  }

  return {
    total: rows.length,
    active,
    cancelled,
    upcoming,
    checkedIn,
  }
}

export function getCancelRegistrationState(
  row: MyRegisteredEvent,
): CancelRegistrationState {
  if (row.status === MY_REGISTRATION_STATUS.CANCELLED) {
    return { allowed: false, reason: "Đăng ký đã được hủy trước đó." }
  }
  if (row.hasCheckin) {
    return { allowed: false, reason: "Không thể hủy sau khi đã check-in." }
  }

  const period = getRegistrationPeriodState(row.event)
  if (!period.open) {
    return {
      allowed: false,
      reason: `${period.reason} Chỉ được hủy khi còn trong thời gian đăng ký.`,
    }
  }

  const { startDate } = row.event
  if (startDate) {
    const startMs = Date.parse(startDate)
    if (!Number.isNaN(startMs) && Date.now() >= startMs) {
      return {
        allowed: false,
        reason: "Sự kiện đã bắt đầu, không thể hủy đăng ký.",
      }
    }
  }

  return { allowed: true }
}

export function canCancelMyRegistration(row: MyRegisteredEvent): boolean {
  return getCancelRegistrationState(row).allowed
}

type PortalApi = ReturnType<typeof createStoreSyncSdk>

export async function fetchMyRegisteredEvents(
  api: PortalApi,
): Promise<MyRegisteredEvent[]> {
  return api.public.listMyEvents<MyRegisteredEvent>()
}

export async function cancelMyEventRegistration(
  api: PortalApi,
  registrationId: string,
): Promise<MyRegisteredEvent> {
  return api.public.cancelMyEventRegistration<MyRegisteredEvent>(registrationId)
}
