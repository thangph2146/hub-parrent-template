"use client"

import {
  ADMIN_SOCKET_PATH,
  getSocketOriginFromApiBase,
  type SocketAuthData,
} from "@workspace/api-client/realtime"
import { readAdminSession } from "@/lib/auth-session"

export { ADMIN_SOCKET_PATH }

export function getAdminSocketOrigin(): string {
  return getSocketOriginFromApiBase(process.env.NEXT_PUBLIC_API_URL)
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
