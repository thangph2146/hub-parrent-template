import { clearAdminSession, readAdminSession } from "@/lib/admin/auth-session"
import {
  clearEventSession,
  isGuestSession,
  isStudentSession,
  readEventSession,
  type EventSessionUser,
} from "@/lib/portal/event-session"

/** Một trong ba cổng đăng nhập check-in — chỉ một active tại một thời điểm. */
export type CheckinSessionKind = "student" | "guest" | "admin"

const SESSION_LABELS: Record<CheckinSessionKind, string> = {
  student: "Sinh viên",
  guest: "Khách",
  admin: "Ban quản trị",
}

export function getCheckinSessionLabel(kind: CheckinSessionKind): string {
  return SESSION_LABELS[kind]
}

export function resolvePortalSessionKind(
  user: EventSessionUser | null,
): "student" | "guest" | null {
  if (isStudentSession(user)) return "student"
  if (isGuestSession(user)) return "guest"
  return null
}

export function getActiveCheckinSessionKind(): CheckinSessionKind | null {
  const portalKind = resolvePortalSessionKind(readEventSession())
  const hasAdmin = Boolean(readAdminSession())
  if (portalKind && hasAdmin) {
    clearAdminSession()
  }
  if (portalKind) return portalKind
  if (hasAdmin) return "admin"
  return null
}

export function clearOtherCheckinSessions(target: CheckinSessionKind): void {
  if (target === "admin") {
    clearEventSession()
    return
  }
  clearAdminSession()
}

export type CheckinLoginBlocked = {
  ok: false
  active: CheckinSessionKind
  message: string
}

export function assertCanLoginAs(
  target: CheckinSessionKind,
): { ok: true } | CheckinLoginBlocked {
  const active = getActiveCheckinSessionKind()
  if (!active || active === target) return { ok: true }
  return {
    ok: false,
    active,
    message: `Bạn đang đăng nhập với tư cách ${SESSION_LABELS[active]}. Hãy đăng xuất trước khi đăng nhập ${SESSION_LABELS[target]}.`,
  }
}

export function assertCanLoginPortalAs(
  target: "student" | "guest",
): { ok: true } | CheckinLoginBlocked {
  return assertCanLoginAs(target)
}
