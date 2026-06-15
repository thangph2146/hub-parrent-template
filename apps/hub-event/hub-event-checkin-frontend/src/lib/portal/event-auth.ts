import {
  createPublicApi,
  DEFAULT_API_URL,
  type DevLoginOption,
  type PublicAuthPayload,
} from "@workspace/api-client"
import {
  isStudentSession,
  isGuestSession,
  isEventPortalSession,
  getEventAccountLabel,
  readEventSession,
  toEventSession,
  writeEventSession,
  clearEventSession,
  subscribeEventSession,
  patchEventSessionProfile,
  type EventSessionUser,
} from "./event-session"
import {
  getMyEventsPath,
  getProfilePath,
  portalLoginPath,
} from "./event-portal-routes"
import {
  assertStudentSchoolEmail,
  isStudentSchoolEmail,
  STUDENT_EMAIL_ERROR,
} from "../site/student-email"
import {
  assertCanLoginPortalAs,
  clearOtherCheckinSessions,
  type CheckinLoginBlocked,
} from "./checkin-session-exclusive"

export type { EventSessionUser, DevLoginOption }
export { STUDENT_EMAIL_ERROR, isStudentSchoolEmail }
export {
  isStudentSession,
  isGuestSession,
  isEventPortalSession,
  getMyEventsPath,
  getProfilePath,
  getEventAccountLabel,
  readEventSession,
  writeEventSession,
  clearEventSession,
  subscribeEventSession,
  patchEventSessionProfile,
}
export type { EventPortalRole } from "./event-portal-routes"
export {
  isEventAuthLoginPath,
  isEventPortalRole,
  isEventPortalPath,
  parseEventPortalRoleFromPath,
  portalEventsPath,
  portalHomePath,
  EVENT_LOGIN_PATH,
  portalLoginPath,
  portalProfilePath,
  resolveEventPortalRole,
  resolveLoginRoleFromReturnPath,
  resolvePostLoginDestination,
  sessionMatchesPortalRole,
} from "./event-portal-routes"

export type EventLoginKind = "student" | "guest"

export type { CheckinLoginBlocked }
export {
  assertCanLoginAs,
  assertCanLoginPortalAs,
  getActiveCheckinSessionKind,
  getCheckinSessionLabel,
} from "./checkin-session-exclusive"

function checkinPublicApi() {
  return createPublicApi({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
    devLogTag: "HUB_CHECKIN",
  })
}

function persistLoginPayload(
  data: PublicAuthPayload,
  kind: EventLoginKind,
): EventSessionUser {
  const gate = assertCanLoginPortalAs(kind)
  if (!gate.ok) {
    throw new Error(gate.message)
  }

  const user = toEventSession(data)
  if (kind === "student") {
    if (!isStudentSchoolEmail(user.email)) {
      throw new Error(STUDENT_EMAIL_ERROR)
    }
    if (!isStudentSession(user)) {
      throw new Error("Chỉ tài khoản sinh viên mới được đăng nhập kênh này.")
    }
  }
  if (kind === "guest" && !isGuestSession(user)) {
    throw new Error(
      "Chỉ tài khoản khách (phụ huynh/cá nhân) mới được đăng nhập kênh này.",
    )
  }
  clearOtherCheckinSessions(kind)
  writeEventSession(user)
  return user
}

export async function loginEventUser(
  email: string,
  password: string,
): Promise<EventSessionUser> {
  assertStudentSchoolEmail(email)
  const data = await checkinPublicApi().loginWithEmail({ email, password })
  return persistLoginPayload(data, "student")
}

export async function loginEventGuest(
  email: string,
  password: string,
): Promise<EventSessionUser> {
  const data = await checkinPublicApi().loginGuestWithEmail({ email, password })
  return persistLoginPayload(data, "guest")
}

export async function loginEventUserDevelopment(
  userId: string,
): Promise<EventSessionUser> {
  const data = await checkinPublicApi().loginWithDevelopmentUser({ userId })
  return persistLoginPayload(data, "student")
}

export async function loginEventGuestDevelopment(
  userId: string,
): Promise<EventSessionUser> {
  const data = await checkinPublicApi().loginGuestWithDevelopmentUser({ userId })
  return persistLoginPayload(data, "guest")
}

export async function fetchGoogleClientId(): Promise<string> {
  try {
    const data = await checkinPublicApi().fetchGoogleOAuthConfig()
    return data.clientId?.trim() ?? ""
  } catch {
    return ""
  }
}

export async function loginEventUserGoogle(
  credential: string,
): Promise<EventSessionUser> {
  const data = await checkinPublicApi().loginWithGoogle(credential)
  return persistLoginPayload(data, "student")
}

export async function fetchDevLoginOptions(
  kind: EventLoginKind = "student",
): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") return []
  try {
    if (kind === "guest") {
      return await checkinPublicApi().fetchDevLoginOptions({
        roles: "parent,user",
        excludeRoles: "student,admin,super_admin",
        activeOnly: true,
      })
    }
    // Dev picker: mọi user role student trong DB (không lọc đuôi email — đuôi chỉ áp đăng nhập thủ công).
    return await checkinPublicApi().fetchDevLoginOptions({
      role: "student",
      activeOnly: true,
    })
  } catch (error) {
    console.warn("[HUB_CHECKIN] fetchDevLoginOptions failed:", error)
    return []
  }
}

export function buildLoginHref(returnPath: string): string {
  return portalLoginPath(returnPath)
}
