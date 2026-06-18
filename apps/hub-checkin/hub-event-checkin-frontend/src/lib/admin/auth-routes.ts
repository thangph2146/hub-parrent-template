import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_LOGIN_PATH,
  CHECKIN_ADMIN_REGISTER_PATH,
} from "@/config/admin/checkin-admin-access"

export { CHECKIN_ADMIN_HOME_PATH, CHECKIN_ADMIN_LOGIN_PATH }
/** Alias dùng trong form auth kế thừa backend. */
export const AUTH_LOGIN_PATH = CHECKIN_ADMIN_LOGIN_PATH
export const AUTH_REGISTER_PATH = CHECKIN_ADMIN_REGISTER_PATH

const CHECKIN_ADMIN_AUTH_PATHS = [
  CHECKIN_ADMIN_LOGIN_PATH,
  AUTH_REGISTER_PATH,
] as const

const AUTH_SET = new Set<string>(CHECKIN_ADMIN_AUTH_PATHS)

export function isCheckinAdminAuthPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false
  const normalized = pathname.replace(/\/+$/, "") || "/"
  return AUTH_SET.has(normalized)
}

/** @deprecated Dùng `isCheckinAdminAuthPath` */
export function isAuthPath(pathname: string | null | undefined): boolean {
  return isCheckinAdminAuthPath(pathname)
}

export function getAdminAppHomeExternalPath(): string {
  return CHECKIN_ADMIN_HOME_PATH
}

export function getAdminLoginExternalPath(): string {
  return CHECKIN_ADMIN_LOGIN_PATH
}
