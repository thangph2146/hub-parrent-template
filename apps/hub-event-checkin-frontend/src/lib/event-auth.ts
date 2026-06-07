import {
  createPublicApi,
  DEFAULT_API_URL,
  type DevLoginOption,
  type PublicAuthPayload,
} from "@workspace/api-client"
import {
  isStudentSession,
  readEventSession,
  toEventSession,
  writeEventSession,
  clearEventSession,
  subscribeEventSession,
  patchEventSessionProfile,
  type EventSessionUser,
} from "./event-session"

export type { EventSessionUser, DevLoginOption }
export {
  isStudentSession,
  readEventSession,
  writeEventSession,
  clearEventSession,
  subscribeEventSession,
  patchEventSessionProfile,
}

function checkinPublicApi() {
  return createPublicApi({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
    devLogTag: "HUB_CHECKIN",
  })
}

function persistLoginPayload(data: PublicAuthPayload): EventSessionUser {
  const user = toEventSession(data)
  if (!isStudentSession(user)) {
    throw new Error("Chỉ tài khoản sinh viên mới được đăng nhập cổng sự kiện.")
  }
  writeEventSession(user)
  return user
}

export async function loginEventUser(
  email: string,
  password: string,
): Promise<EventSessionUser> {
  const data = await checkinPublicApi().loginWithEmail({ email, password })
  return persistLoginPayload(data)
}

export async function loginEventUserDevelopment(
  userId: string,
): Promise<EventSessionUser> {
  const data = await checkinPublicApi().loginWithDevelopmentUser({ userId })
  return persistLoginPayload(data)
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
  return persistLoginPayload(data)
}

export async function fetchDevLoginOptions(): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") return []
  try {
    return await checkinPublicApi().fetchDevLoginOptions()
  } catch {
    return []
  }
}

export function buildLoginHref(returnPath: string): string {
  const next = encodeURIComponent(returnPath)
  return `/dang-nhap?next=${next}`
}
