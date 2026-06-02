import { DEFAULT_API_URL } from "@workspace/api-client"
import { readEventSession } from "./event-auth"
import { getEventStatus } from "./public-events"

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  error?: string | null
  data?: T
}

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")
}

function authHeaders(): HeadersInit {
  const session = readEventSession()
  return session?.id ? { "X-User-Id": session.id } : {}
}

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
    registrationEnd: string | null
    location: string | null
    address: string | null
    format: number
    status: number
  }
}

export type MyRegisteredEventStats = {
  /** Tất cả bản ghi trả về từ API (gồm đã hủy). */
  total: number
  /** Đăng ký chưa hủy (PENDING + CONFIRMED). */
  active: number
  /** Đăng ký đã hủy (CANCELLED). */
  cancelled: number
  /** Đăng ký còn hiệu lực cho sự kiện chưa bắt đầu. */
  upcoming: number
  /** Đăng ký còn hiệu lực đã check-in. */
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
  const { startDate } = row.event
  if (!startDate) return false
  if (Number.isNaN(Date.parse(startDate))) return false
  return getEventStatus(row.event) === "upcoming"
}

export function computeMyRegisteredEventStats(
  rows: MyRegisteredEvent[]
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
  row: MyRegisteredEvent
): CancelRegistrationState {
  if (row.status === MY_REGISTRATION_STATUS.CANCELLED) {
    return { allowed: false, reason: "Đăng ký đã được hủy trước đó." }
  }
  if (row.hasCheckin) {
    return { allowed: false, reason: "Không thể hủy sau khi đã check-in." }
  }

  const now = Date.now()
  const { registrationEnd, startDate } = row.event

  if (registrationEnd) {
    const endMs = Date.parse(registrationEnd)
    if (!Number.isNaN(endMs) && now > endMs) {
      return {
        allowed: false,
        reason: "Đã hết thời hạn đăng ký, không thể hủy.",
      }
    }
  }

  if (startDate) {
    const startMs = Date.parse(startDate)
    if (!Number.isNaN(startMs) && now >= startMs) {
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

async function parseEnvelope<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!res.ok || !json?.success || json.data === undefined) {
    throw new Error(
      json?.message || json?.error || `Request failed: ${res.status}`
    )
  }
  return json.data
}

export async function fetchMyRegisteredEvents(): Promise<MyRegisteredEvent[]> {
  const session = readEventSession()
  if (!session?.id) {
    throw new Error("Vui lòng đăng nhập để xem sự kiện đã đăng ký.")
  }

  const res = await fetch(`${getApiBase()}/public/me/events`, {
    headers: { Accept: "application/json", ...authHeaders() },
    cache: "no-store",
  })
  return parseEnvelope<MyRegisteredEvent[]>(res)
}

export async function cancelMyEventRegistration(
  registrationId: string
): Promise<MyRegisteredEvent> {
  const session = readEventSession()
  if (!session?.id) {
    throw new Error("Vui lòng đăng nhập để hủy đăng ký.")
  }

  const res = await fetch(
    `${getApiBase()}/public/me/event-registrations/${encodeURIComponent(
      registrationId
    )}/cancel`,
    {
      method: "POST",
      headers: { Accept: "application/json", ...authHeaders() },
    }
  )
  return parseEnvelope<MyRegisteredEvent>(res)
}
