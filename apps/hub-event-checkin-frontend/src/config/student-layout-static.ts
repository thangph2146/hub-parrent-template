import type { AdminLayoutStaticConfig } from "@ui/components/admin"
import type { AuthUser } from "@workspace/api-client"
import {
  clearEventSession,
  isStudentSession,
  type EventSessionUser,
} from "@/lib/event-auth"
import { STUDENT_PORTAL_MENU_TREE } from "@/config/student-menu-tree"

export const EVENT_LOGIN_PATH = "/dang-nhap"

export function isEventAuthPath(pathname: string): boolean {
  return pathname === EVENT_LOGIN_PATH || pathname.startsWith(`${EVENT_LOGIN_PATH}/`)
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

export function canAccessStudentPortal(user: AuthUser): boolean {
  return isStudentSession({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    roles: user.roles.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName ?? r.name,
    })),
    roleNames: user.roles.map((r) => r.name),
  })
}

/** Cấu hình layout cổng sinh viên (shell từ `@ui/components/admin`). */
export const STUDENT_PORTAL_LAYOUT_STATIC: AdminLayoutStaticConfig = {
  menuTree: STUDENT_PORTAL_MENU_TREE,
  loginPath: EVENT_LOGIN_PATH,
  isAuthPath: isEventAuthPath,
  canAccessApp: canAccessStudentPortal,
  clearSession: clearEventSession,
  sessionEventName: "hub-event-session",
  mobileHeaderTitle: "HUB Events",
  homePath: "/student/events",
  profilePath: "/student/profile",
  accessDeniedReason: "student_only",
}
