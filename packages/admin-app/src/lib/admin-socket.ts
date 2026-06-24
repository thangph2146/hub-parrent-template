import { readAdminSession } from "./auth-session"
import { getApiOrigin } from "./api-base-url"

export const ADMIN_SOCKET_PATH = "/api/socket"

export type AdminSocketAuth = {
  userId: string
  role: string
}

/** Gốc socket.io — thẳng @api, không qua Next proxy. */
export function getAdminSocketOrigin(): string {
  return getApiOrigin()
}

/** @deprecated Dùng {@link getAdminSocketOrigin} */
export const getSocketOrigin = getAdminSocketOrigin

export function resolveSocketRole(): string {
  const session = readAdminSession()
  const primary = session?.roles?.[0]?.name?.trim()
  return primary ? primary.toLowerCase() : "admin"
}

export function resolveAdminSocketAuth(): AdminSocketAuth | null {
  const session = readAdminSession()
  const userId = session?.id != null ? String(session.id) : null
  if (!userId) return null
  return { userId, role: resolveSocketRole() }
}
