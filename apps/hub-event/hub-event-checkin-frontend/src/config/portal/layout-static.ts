import type { AdminLayoutStaticConfig } from "@ui/components/admin"
import type { AuthUser } from "@workspace/api-client"
import { buildEventPortalMenuTree } from "@/config/portal/menu-tree"
import {
  clearEventSession,
  eventSessionToAuthUser,
  isEventAuthPath,
  EVENT_LOGIN_PATH,
} from "@/config/portal/shared"
import {
  portalEventsPath,
  portalHomePath,
  portalProfilePath,
  resolveEventPortalRole,
  sessionMatchesPortalRole,
  type EventPortalRole,
} from "@/lib/portal/event-portal-routes"
import type { EventSessionUser } from "@/lib/portal/event-session"

export { EVENT_LOGIN_PATH, isEventAuthPath, eventSessionToAuthUser }

const PORTAL_BRANDING: Record<
  EventPortalRole,
  { siteDescription: string; accessDeniedReason: string }
> = {
  student: {
    siteDescription: "Cổng sinh viên",
    accessDeniedReason: "student_only",
  },
  guest: {
    siteDescription: "Cổng khách",
    accessDeniedReason: "guest_only",
  },
}

function authUserToSession(user: AuthUser): EventSessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    roles: user.roles.map((role) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName ?? role.name,
    })),
    roleNames: user.roles.map((role) => role.name),
  }
}

export function buildEventPortalLayoutStatic(
  role: EventPortalRole,
): AdminLayoutStaticConfig {
  const branding = PORTAL_BRANDING[role]
  return {
    menuTree: buildEventPortalMenuTree(role),
    loginPath: EVENT_LOGIN_PATH,
    isAuthPath: isEventAuthPath,
    canAccessApp: (user) =>
      sessionMatchesPortalRole(authUserToSession(user), role),
    clearSession: clearEventSession,
    sessionEventName: "hub-event-session",
    mobileHeaderTitle: "HUB Events",
    homePath: portalHomePath(role),
    profilePath:
      role === "student" ? portalProfilePath("student") : portalEventsPath(role),
    accessDeniedReason: branding.accessDeniedReason,
  }
}

export function getPortalSiteDescription(role: EventPortalRole): string {
  return PORTAL_BRANDING[role].siteDescription
}

export function canAccessEventPortal(
  user: AuthUser | null,
  role: EventPortalRole,
): boolean {
  if (!user) return false
  return sessionMatchesPortalRole(authUserToSession(user), role)
}

export function resolvePortalRoleFromUser(
  user: AuthUser | null,
): EventPortalRole | null {
  if (!user) return null
  return resolveEventPortalRole(authUserToSession(user))
}
