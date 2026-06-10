export type EventSessionUser = {
  id: number
  email: string
  name: string | null
  image: string | null
  roles: Array<{ id: number; name: string; displayName: string }>
  roleNames: string[]
}

const STORAGE_KEY = "hub_event_session"
const SESSION_EVENT = "hub-event-session"

let cachedRaw: string | null | undefined
let cachedSnapshot: EventSessionUser | null = null

function invalidateSessionCache(): void {
  cachedRaw = undefined
  cachedSnapshot = null
}

type AuthPayload = {
  id: number
  email: string
  name: string | null
  image: string | null
  roles?: Array<{ id: number; name: string; displayName: string }>
}

export function toEventSession(data: AuthPayload): EventSessionUser {
  const roles = Array.isArray(data.roles) ? data.roles : []
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    roles,
    roleNames: roles.map((role) => role.name),
  }
}

export function isStudentSession(user: EventSessionUser | null): boolean {
  return Boolean(user?.roleNames?.includes("student"))
}

const GUEST_ROLE_NAMES = new Set(["parent", "user"])

export function isGuestSession(user: EventSessionUser | null): boolean {
  if (!user || isStudentSession(user)) return false
  const names = user.roleNames ?? []
  if (names.some((name) => name === "admin" || name === "super_admin")) {
    return false
  }
  return names.some((name) => GUEST_ROLE_NAMES.has(name))
}

export function isEventPortalSession(user: EventSessionUser | null): boolean {
  return isStudentSession(user) || isGuestSession(user)
}

export function getEventAccountLabel(user: EventSessionUser | null): string {
  if (isStudentSession(user)) return "Sinh viên"
  if (isGuestSession(user)) return "Khách"
  return "Tài khoản"
}

export function readEventSession(): EventSessionUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === cachedRaw) return cachedSnapshot

    cachedRaw = raw
    if (!raw) {
      cachedSnapshot = null
      return null
    }

    const parsed = JSON.parse(raw) as EventSessionUser
    if (!parsed?.id || !parsed?.email) {
      cachedSnapshot = null
      return null
    }

    cachedSnapshot = toEventSession(parsed)
    return cachedSnapshot
  } catch {
    cachedRaw = ""
    cachedSnapshot = null
    return null
  }
}

export function writeEventSession(user: EventSessionUser): void {
  const normalized = toEventSession(user)
  const serialized = JSON.stringify(normalized)
  localStorage.setItem(STORAGE_KEY, serialized)
  cachedRaw = serialized
  cachedSnapshot = normalized
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export function clearEventSession(): void {
  localStorage.removeItem(STORAGE_KEY)
  cachedRaw = null
  cachedSnapshot = null
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export function subscribeEventSession(callback: () => void): () => void {
  const notify = () => {
    invalidateSessionCache()
    callback()
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) notify()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(SESSION_EVENT, notify)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(SESSION_EVENT, notify)
  }
}

export function patchEventSessionProfile(patch: {
  name?: string | null
  image?: string | null
}): void {
  const current = readEventSession()
  if (!current) return
  writeEventSession({
    ...current,
    name: patch.name !== undefined ? patch.name : current.name,
    image: patch.image !== undefined ? patch.image : current.image,
  })
}
