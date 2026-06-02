import { DEFAULT_API_URL } from "@workspace/api-client"
import { readEventSession } from "./event-auth"

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

export type CancelRegistrationState =
  | { allowed: true }
  | { allowed: false; reason: string }

export function getCancelRegistrationState(
  row: MyRegisteredEvent
): CancelRegistrationState {
  if (row.status === 2) {
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
