import type { SocketNotificationPayload } from "./types"
import { shouldShowAdminRealtimeToast } from "./notifications"

const DEFAULT_LOCAL_TTL_MS = 8_000
const DEDUPE_TTL_MS = 4_000

const localMutations = new Map<string, number>()
const recentRealtimeToasts = new Map<string, number>()

function pruneExpired(map: Map<string, number>, now = Date.now()) {
  for (const [key, expiresAt] of map) {
    if (expiresAt <= now) map.delete(key)
  }
}

function isKeyActive(map: Map<string, number>, key: string): boolean {
  const expiresAt = map.get(key)
  if (!expiresAt) return false
  if (expiresAt <= Date.now()) {
    map.delete(key)
    return false
  }
  return true
}

/** Khóa suppress sau mutation admin thành công (tab hiện tại). */
export function buildMutationToastKey(
  resource: string,
  id?: string,
  action?: string,
): string {
  return `${resource.toLowerCase()}:${id ?? "*"}:${action ?? "mutate"}`
}

export function registerLocalAdminMutation(
  key: string,
  ttlMs = DEFAULT_LOCAL_TTL_MS,
): void {
  if (typeof window === "undefined") return
  pruneExpired(localMutations)
  localMutations.set(key, Date.now() + ttlMs)
}

function extractIdFromVariables(variables: unknown): string | undefined {
  if (variables == null || typeof variables !== "object") return undefined
  const v = variables as Record<string, unknown>
  if (typeof v.id === "string" && v.id.trim()) return v.id.trim()
  if (Array.isArray(v.ids) && v.ids.length === 1) {
    const only = v.ids[0]
    if (typeof only === "string" && only.trim()) return only.trim()
  }
  return undefined
}

/**
 * Đăng ký suppress socket sau toast mutation UI (tab đang thao tác).
 * Bổ sung cho registerLocalMutationFromApiPath khi path/response không đủ metadata.
 */
export function registerLocalMutationFromMeta(
  resource: string,
  options?: {
    id?: string
    action?: string
    data?: unknown
    variables?: unknown
    ttlMs?: number
  },
): void {
  if (typeof window === "undefined") return
  const normalizedResource = resource.toLowerCase().trim()
  if (!normalizedResource) return

  const id =
    options?.id?.trim() ||
    extractEntityId(options?.data) ||
    extractIdFromVariables(options?.variables)
  const action = options?.action?.trim() || "mutate"
  const ttlMs = options?.ttlMs ?? DEFAULT_LOCAL_TTL_MS

  if (id) {
    registerLocalAdminMutation(
      buildMutationToastKey(normalizedResource, id),
      ttlMs,
    )
    registerLocalAdminMutation(
      buildMutationToastKey(normalizedResource, id, action),
      ttlMs,
    )
  }
  registerLocalAdminMutation(
    buildMutationToastKey(normalizedResource, "*", action),
    ttlMs,
  )
}

export function buildRealtimeToastDedupeKey(
  payload: SocketNotificationPayload,
): string {
  if (payload.id?.trim()) return `id:${payload.id.trim()}`
  const meta = payload.metadata
  const resource =
    typeof meta?.resource === "string" ? meta.resource : undefined
  const resourceId =
    typeof meta?.resourceId === "string" ? meta.resourceId : undefined
  const status = typeof meta?.status === "string" ? meta.status : ""
  if (resource && resourceId) {
    return `res:${resource}:${resourceId}:${status}:${payload.title}`
  }
  return `copy:${payload.title}:${payload.description ?? ""}`
}

function extractEntityId(result: unknown): string | undefined {
  if (result == null || typeof result !== "object") return undefined
  const id = (result as { id?: unknown }).id
  if (typeof id === "string" && id.trim()) return id.trim()
  if (typeof id === "number" && Number.isFinite(id)) return String(id)
  return undefined
}

/**
 * Đăng ký suppress sau response mutation thành công — gọi từ api-client post/put/patch/delete.
 */
export function registerLocalMutationFromApiPath(
  method: string,
  path: string,
  result?: unknown,
): void {
  if (typeof window === "undefined") return
  const verb = method.toUpperCase()
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(verb)) return

  const normalizedPath = path.split("?")[0] ?? path
  const responseId = extractEntityId(result)

  const adminMatch = normalizedPath.match(
    /\/admin\/([a-z0-9-]+)(?:\/([^/]+))?(?:\/([^/]+))?/i,
  )
  if (adminMatch) {
    const resource = (adminMatch[1] ?? "").toLowerCase()
    const seg2 = adminMatch[2]
    const seg3 = adminMatch[3]?.toLowerCase()
    const reserved = new Set(["bulk", "options", "restore"])
    let id: string | undefined = responseId
    let action = "mutate"

    if (seg2 && !reserved.has(seg2.toLowerCase())) {
      if (seg3 === "approve") {
        id = seg2
        action = "approved"
      } else if (seg3 === "unapprove") {
        id = seg2
        action = "unapproved"
      } else if (seg3 === "review") {
        id = seg2
        action = "review"
      } else if (seg3 !== "hard-delete") {
        id = id ?? seg2
      }
    }

    if (id) {
      registerLocalAdminMutation(buildMutationToastKey(resource, id))
      registerLocalAdminMutation(buildMutationToastKey(resource, id, action))
    }
    return
  }

  if (verb === "POST" && /\/parent\/my-students\/?$/i.test(normalizedPath)) {
    if (responseId) {
      registerLocalAdminMutation(
        buildMutationToastKey("parent-students", responseId, "pending"),
      )
    }
  }
}

export function shouldShowRealtimeSyncToast(
  payload: SocketNotificationPayload,
  currentUserId: string | null,
): boolean {
  if (!shouldShowAdminRealtimeToast(payload, currentUserId)) return false

  // Activity log SYSTEM gửi cho chính user — toast đã hiện từ mutation onSuccess.
  if (
    String(payload.kind ?? "").toLowerCase() === "system" &&
    payload.toUserId &&
    currentUserId &&
    payload.toUserId === currentUserId
  ) {
    return false
  }

  pruneExpired(localMutations)
  pruneExpired(recentRealtimeToasts)

  const dedupeKey = buildRealtimeToastDedupeKey(payload)
  if (isKeyActive(recentRealtimeToasts, dedupeKey)) return false

  const meta = payload.metadata
  if (meta && typeof meta.resource === "string") {
    const resource = meta.resource.toLowerCase()
    const resourceId =
      typeof meta.resourceId === "string" ? meta.resourceId : undefined
    const status =
      typeof meta.status === "string" ? meta.status : undefined

    if (!resourceId) return true

    const keys = [
      buildMutationToastKey(resource, resourceId),
      status
        ? buildMutationToastKey(resource, resourceId, status)
        : undefined,
    ].filter((key): key is string => Boolean(key))
    if (keys.some((key) => isKeyActive(localMutations, key))) return false
  }

  return true
}

export function markRealtimeToastShown(payload: SocketNotificationPayload): void {
  if (typeof window === "undefined") return
  recentRealtimeToasts.set(
    buildRealtimeToastDedupeKey(payload),
    Date.now() + DEDUPE_TTL_MS,
  )
}
