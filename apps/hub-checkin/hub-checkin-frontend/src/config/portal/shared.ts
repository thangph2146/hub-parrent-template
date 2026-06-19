import type { AuthUser } from "@workspace/api-client"
import { clearEventSession, type EventSessionUser } from "@/lib/portal/event-auth"
import {
  EVENT_LOGIN_PATH,
  isEventAuthLoginPath,
  isEventPortalRole,
} from "@/lib/portal/event-portal-routes"

export { EVENT_LOGIN_PATH }

export function eventLoginPath(): string {
  return EVENT_LOGIN_PATH
}

/** `/dang-nhap`, `/dang-nhap/{role}` (legacy), `/{role}/dang-nhap` (legacy). */
export function isEventAuthPath(pathname: string): boolean {
  if (pathname === EVENT_LOGIN_PATH || isEventAuthLoginPath(pathname)) {
    return true
  }
  if (pathname.startsWith(`${EVENT_LOGIN_PATH}/`)) return true
  const legacyRoleLogin = pathname.match(/^\/(student|guest)\/dang-nhap$/)
  return legacyRoleLogin !== null && isEventPortalRole(legacyRoleLogin[1])
}

export function eventSessionToAuthUser(session: EventSessionUser): AuthUser {
  return {
    id: session.id,
    email: session.email,
    name: session.name,
    image: session.image,
    permissions: [],
    roles: session.roles.map((role) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
    })),
  }
}

export { clearEventSession }
