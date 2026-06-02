import { DEFAULT_API_URL } from "@workspace/api-client"

export type EventSessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  roles: Array<{ id: string; name: string; displayName: string }>
  roleNames: string[]
}

export type DevLoginOption = {
  id: string
  email: string
  name: string | null
  roleNames: string[]
  roleLabels: string[]
  description: string
}

const STORAGE_KEY = "hub_event_session"
const SESSION_EVENT = "hub-event-session"

/** Cache cho useSyncExternalStore — getSnapshot phải trả cùng tham chiếu nếu localStorage không đổi. */
let cachedRaw: string | null | undefined
let cachedSnapshot: EventSessionUser | null = null

function invalidateSessionCache(): void {
  cachedRaw = undefined
  cachedSnapshot = null
}

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  error?: string | null
  data?: T
}

type AuthPayload = {
  id: string
  email: string
  name: string | null
  image: string | null
  roles?: Array<{ id: string; name: string; displayName: string }>
}

function shouldDevLog(): boolean {
  return process.env.NODE_ENV === "development"
}

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")
}

function apiPathFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname.replace(/^\/api/, "") || parsed.pathname
  } catch {
    return url
  }
}

function safePreview(value: unknown): unknown {
  if (value == null) return value
  if (typeof value !== "object") return value
  try {
    const cloned = JSON.parse(JSON.stringify(value)) as unknown
    if (
      cloned &&
      typeof cloned === "object" &&
      "data" in cloned &&
      (cloned as { data?: unknown }).data &&
      typeof (cloned as { data?: unknown }).data === "object"
    ) {
      const data = (cloned as { data?: Record<string, unknown> }).data
      if (data && "roles" in data) {
        data.roles = Array.isArray(data.roles)
          ? data.roles.map((role) =>
              role && typeof role === "object"
                ? {
                    name: (role as { name?: unknown }).name,
                    displayName: (role as { displayName?: unknown })
                      .displayName,
                  }
                : role
            )
          : data.roles
      }
    }
    return cloned
  } catch {
    return value
  }
}

async function fetchWithCheckinLog(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase()
  const path = apiPathFromUrl(url)
  const startedAt = performance.now()
  try {
    const response = await fetch(url, init)
    if (shouldDevLog()) {
      const ms = performance.now() - startedAt
      const statusStyle =
        response.status >= 200 && response.status < 300
          ? "color:#16a34a;font-weight:600"
          : response.status >= 400
            ? "color:#dc2626;font-weight:600"
            : "color:#ca8a04;font-weight:600"
      console.groupCollapsed(
        `%cHUB_CHECKIN%c ${method}%c ${path}%c ${response.status}%c ${ms.toFixed(0)}ms`,
        "color:#64748b;font-weight:600",
        "color:#2563eb;font-weight:600",
        "color:#1e293b",
        statusStyle,
        "color:#94a3b8"
      )
      console.log("URL:", url)
      if (typeof window !== "undefined") {
        console.log("Origin:", window.location.origin)
      }
      if (init?.body && typeof init.body === "string") {
        try {
          const body = JSON.parse(init.body) as Record<string, unknown>
          console.log("Request:", {
            ...body,
            credential:
              typeof body.credential === "string"
                ? `${body.credential.slice(0, 24)}…`
                : body.credential,
          })
        } catch {
          console.log("Request:", init.body)
        }
      }
      const cloned = response.clone()
      const preview = await cloned.json().catch(() => null)
      if (preview) console.log("Response:", safePreview(preview))
      console.groupEnd()
    }
    return response
  } catch (error) {
    if (shouldDevLog()) {
      const ms = performance.now() - startedAt
      console.groupCollapsed(
        `%cHUB_CHECKIN%c ${method}%c ${path}%c NETWORK%c ${ms.toFixed(0)}ms`,
        "color:#64748b;font-weight:600",
        "color:#2563eb;font-weight:600",
        "color:#1e293b",
        "color:#dc2626;font-weight:600",
        "color:#94a3b8"
      )
      console.log("URL:", url)
      if (typeof window !== "undefined") {
        console.log("Origin:", window.location.origin)
      }
      console.warn(error)
      console.groupEnd()
    }
    throw error
  }
}

function toEventSession(data: AuthPayload): EventSessionUser {
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

async function persistLoginResponse(res: Response): Promise<EventSessionUser> {
  const json = (await res
    .json()
    .catch(() => null)) as ApiEnvelope<AuthPayload> | null

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(
      json?.message || json?.error || "Email hoặc mật khẩu không đúng."
    )
  }

  const user = toEventSession(json.data)
  if (!isStudentSession(user)) {
    throw new Error("Chỉ tài khoản sinh viên mới được đăng nhập cổng sự kiện.")
  }
  writeEventSession(user)
  return user
}

export async function loginEventUser(
  email: string,
  password: string
): Promise<EventSessionUser> {
  const res = await fetchWithCheckinLog(`${getApiBase()}/public/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  })
  return persistLoginResponse(res)
}

export async function loginEventUserDevelopment(
  userId: string
): Promise<EventSessionUser> {
  const res = await fetchWithCheckinLog(
    `${getApiBase()}/public/auth/dev-login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId.trim() }),
    }
  )
  return persistLoginResponse(res)
}

export async function fetchGoogleClientId(): Promise<string> {
  const res = await fetchWithCheckinLog(
    `${getApiBase()}/public/auth/google/config`,
    {
      cache: "no-store",
    }
  )
  const json = (await res.json().catch(() => null)) as ApiEnvelope<{
    clientId?: string
  }> | null

  if (!res.ok || !json?.success || !json.data?.clientId) {
    return ""
  }
  return json.data.clientId
}

export async function loginEventUserGoogle(
  credential: string
): Promise<EventSessionUser> {
  const res = await fetchWithCheckinLog(`${getApiBase()}/public/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  })
  return persistLoginResponse(res)
}

export async function fetchDevLoginOptions(): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") return []

  const res = await fetchWithCheckinLog(
    `${getApiBase()}/public/dev-login-options`,
    {
      cache: "no-store",
    }
  )
  const json = (await res.json().catch(() => null)) as ApiEnvelope<
    DevLoginOption[]
  > | null

  if (!res.ok || !json?.success || !Array.isArray(json.data)) {
    return []
  }
  return json.data
}

export function buildLoginHref(returnPath: string): string {
  const next = encodeURIComponent(returnPath)
  return `/dang-nhap?next=${next}`
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

export async function fetchStudentApi(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const session = readEventSession()
  if (!session?.id) {
    throw new Error("Chưa đăng nhập.")
  }
  const headers = new Headers(init?.headers)
  headers.set("Accept", "application/json")
  headers.set("X-User-Id", session.id)
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return fetchWithCheckinLog(`${getApiBase()}${normalizedPath}`, {
    ...init,
    headers,
  })
}
