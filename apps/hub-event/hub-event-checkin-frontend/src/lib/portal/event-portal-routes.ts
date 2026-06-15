import {
  buildCheckinPortalShellPaths,
  type EventPortalRole,
} from "@/config/portal/access"
import {
  isGuestSession,
  isStudentSession,
  type EventSessionUser,
} from "./event-session"

/** Portal theo role — `app/(portal)/{role}/…`; đăng nhập chung tại `/dang-nhap`. */
export type { EventPortalRole } from "@/config/portal/access"

export const EVENT_LOGIN_PATH = "/dang-nhap"

const PORTAL_ROLES: ReadonlySet<EventPortalRole> = new Set([
  "student",
  "guest",
])

export function isEventPortalRole(value: string): value is EventPortalRole {
  return PORTAL_ROLES.has(value as EventPortalRole)
}

export function resolveEventPortalRole(
  user: EventSessionUser | null,
): EventPortalRole | null {
  if (!user) return null
  if (isStudentSession(user)) return "student"
  if (isGuestSession(user)) return "guest"
  return null
}

export function portalEventsPath(role: EventPortalRole): string {
  return buildCheckinPortalShellPaths(role).eventsPath
}

export function portalProfilePath(role: EventPortalRole): string {
  return buildCheckinPortalShellPaths(role).profilePath
}

export function portalHomePath(role: EventPortalRole): string {
  return portalEventsPath(role)
}

export function portalLoginPath(returnPath?: string): string {
  if (!returnPath?.trim()) return EVENT_LOGIN_PATH
  return `${EVENT_LOGIN_PATH}?next=${encodeURIComponent(returnPath)}`
}

export function resolveLoginRoleFromReturnPath(
  returnPath: string,
): EventPortalRole {
  return parseEventPortalRoleFromPath(returnPath) ?? "student"
}

export function getMyEventsPath(user: EventSessionUser | null): string {
  const role = resolveEventPortalRole(user)
  return role
    ? portalEventsPath(role)
    : portalLoginPath(portalEventsPath("student"))
}

export function getProfilePath(user: EventSessionUser | null): string {
  const role = resolveEventPortalRole(user)
  if (role === "student") return portalProfilePath("student")
  if (role === "guest") return portalEventsPath("guest")
  return portalLoginPath(portalProfilePath("student"))
}

export function parseEventPortalRoleFromPath(
  pathname: string,
): EventPortalRole | null {
  const segment = pathname.split("/").filter(Boolean)[0]
  if (!segment || !isEventPortalRole(segment)) return null
  return segment
}

export function isEventPortalPath(pathname: string): boolean {
  const role = parseEventPortalRoleFromPath(pathname)
  if (!role) return false
  const rest = pathname.slice(`/${role}`.length)
  return (
    rest === "" ||
    rest.startsWith("/events") ||
    rest.startsWith("/profile")
  )
}

export function isEventAuthLoginPath(pathname: string): boolean {
  return pathname === EVENT_LOGIN_PATH
}

/** Đích sau đăng nhập: ưu tiên `next` nếu khớp role session. */
export function resolvePostLoginDestination(
  user: EventSessionUser,
  nextFromUrl: string | null | undefined,
  fallback = "/",
): string {
  const userRole = resolveEventPortalRole(user)
  const defaultPath = userRole ? portalEventsPath(userRole) : fallback
  if (!nextFromUrl?.trim()) return defaultPath
  const nextRole = parseEventPortalRoleFromPath(nextFromUrl)
  if (nextRole && userRole && nextRole !== userRole) return defaultPath
  if (nextFromUrl.startsWith("/") && !nextFromUrl.startsWith("//")) {
    return nextFromUrl
  }
  return defaultPath
}

export function sessionMatchesPortalRole(
  user: EventSessionUser | null,
  role: EventPortalRole,
): boolean {
  return resolveEventPortalRole(user) === role
}
