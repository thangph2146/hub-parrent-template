import {
  PARENT_ADMIN_HOME_PATH,
  PARENT_ADMIN_LOGIN_PATH,
  PARENT_ADMIN_REGISTER_PATH,
} from "@/config/admin/parent-admin-access"

export { PARENT_ADMIN_HOME_PATH, PARENT_ADMIN_LOGIN_PATH }

export const AUTH_LOGIN_PATH = PARENT_ADMIN_LOGIN_PATH
export const AUTH_REGISTER_PATH = PARENT_ADMIN_REGISTER_PATH

const PARENT_ADMIN_AUTH_PATHS = [
  PARENT_ADMIN_LOGIN_PATH,
  AUTH_REGISTER_PATH,
] as const

const AUTH_SET = new Set<string>(PARENT_ADMIN_AUTH_PATHS)

export function isParentAdminAuthPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false
  const normalized = pathname.replace(/\/+$/, "") || "/"
  return AUTH_SET.has(normalized)
}

export function getAdminAppHomeExternalPath(): string {
  return PARENT_ADMIN_HOME_PATH
}

export function getAdminLoginExternalPath(): string {
  return PARENT_ADMIN_LOGIN_PATH
}

