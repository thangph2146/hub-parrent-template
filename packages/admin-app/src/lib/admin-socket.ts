"use client"

import {
  ADMIN_SOCKET_PATH,
  getSocketOriginFromApiBase,
  type SocketAuthData,
} from "@workspace/api-client/realtime"
import { getApiSocketBaseUrl } from "@workspace/admin-app/lib/api-base-url"
import { readAdminSession } from "@workspace/admin-app/lib/auth-session"

export { ADMIN_SOCKET_PATH }

export function getAdminSocketOrigin(): string {
  return getSocketOriginFromApiBase(getApiSocketBaseUrl())
}

export function resolveAdminSocketAuth(): SocketAuthData | null {
  const session = readAdminSession()
  const userId = session?.id != null ? String(session.id) : null
  if (!userId) return null
  const primary = session?.roles?.[0]?.name?.trim()
  return {
    userId,
    role: primary ? primary.toLowerCase() : "admin",
  }
}
