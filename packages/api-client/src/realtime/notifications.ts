import type { SocketNotificationKind, SocketNotificationPayload } from "./types"
import { normalizeSocketId } from "./normalize-id"

export type RealtimeToastMethod = "info" | "success" | "warning" | "error"

export function socketNotificationToastMethod(
  kind: SocketNotificationKind | string | undefined,
): RealtimeToastMethod {
  const k = String(kind ?? "info").toLowerCase()
  if (k === "success") return "success"
  if (k === "warning" || k === "alert") return "warning"
  if (k === "error") return "error"
  return "info"
}

export function shouldShowAdminRealtimeToast(
  payload: SocketNotificationPayload,
  currentUserId: string | null,
): boolean {
  if (!payload?.title?.trim()) return false
  const actorId =
    normalizeSocketId(payload.metadata?.actorUserId) ??
    normalizeSocketId(payload.fromUserId)
  if (actorId && currentUserId && actorId === currentUserId) return false
  return true
}

export function resolveRealtimeNotificationToast(payload: SocketNotificationPayload): {
  method: RealtimeToastMethod
  title: string
  description?: string
} {
  return {
    method: socketNotificationToastMethod(payload.kind),
    title: payload.title,
    description: payload.description?.trim() || undefined,
  }
}
