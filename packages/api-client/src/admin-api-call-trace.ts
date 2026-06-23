/** Ghi nhận HTTP gần đây — dùng báo cáo copy toast thao tác admin (dev). */

export type AdminApiCallRecord = {
  method: string
  path: string
  url: string
  status?: number
  statusText?: string
  ok?: boolean
  startedAt: number
  completedAt: number
  ms: number
  /** Body gửi lên (JSON / FormData summary). */
  requestBody?: unknown
  /** Request đang chờ response — hiển thị trong báo cáo copy khi toast loading. */
  pending?: boolean
}

const MAX_BUFFER = 16
const TRACE_KEY = "__hubAdminApiCallTrace"

type TraceGlobal = typeof globalThis & {
  [TRACE_KEY]?: AdminApiCallRecord[]
  __hubAdminApiBaseUrl?: string
}

function getBuffer(): AdminApiCallRecord[] {
  const g = globalThis as TraceGlobal
  if (!g[TRACE_KEY]) g[TRACE_KEY] = []
  return g[TRACE_KEY]!
}

export function setAdminApiBaseUrl(baseUrl: string): void {
  const g = globalThis as TraceGlobal
  g.__hubAdminApiBaseUrl = baseUrl.replace(/\/+$/, "")
}

export function getAdminApiBaseUrl(): string | undefined {
  return (globalThis as TraceGlobal).__hubAdminApiBaseUrl
}

export function recordAdminApiCall(record: AdminApiCallRecord): void {
  const buffer = getBuffer()
  const pendingIdx = buffer.findIndex(
    (item) =>
      item.pending &&
      item.url === record.url &&
      item.startedAt === record.startedAt,
  )
  if (pendingIdx >= 0) {
    buffer[pendingIdx] = { ...record, pending: undefined }
  } else {
    buffer.push(record)
  }
  while (buffer.length > MAX_BUFFER) buffer.shift()
}

/** Ghi nhận request vừa gửi — cập nhật khi hoàn tất qua `recordAdminApiCall`. */
export function recordAdminApiCallPending(
  record: Pick<
    AdminApiCallRecord,
    "method" | "path" | "url" | "startedAt" | "requestBody"
  >,
): void {
  const buffer = getBuffer()
  buffer.push({
    ...record,
    pending: true,
    completedAt: record.startedAt,
    ms: 0,
  })
  while (buffer.length > MAX_BUFFER) buffer.shift()
}

/** Các request hoàn tất (hoặc đang pending) sau `sinceMs`. */
export function getAdminApiCallsSince(sinceMs?: number): AdminApiCallRecord[] {
  const buffer = getBuffer()
  if (sinceMs == null || !Number.isFinite(sinceMs)) {
    return [...buffer]
  }
  const slackMs = 50
  return buffer.filter((item) =>
    item.pending
      ? item.startedAt >= sinceMs - slackMs
      : item.completedAt >= sinceMs - slackMs,
  )
}

export function getLastAdminApiCall(): AdminApiCallRecord | undefined {
  const buffer = getBuffer()
  return buffer.length ? buffer[buffer.length - 1] : undefined
}

export function clearAdminApiCallTrace(): void {
  const buffer = getBuffer()
  buffer.length = 0
}

export function buildAdminApiUrl(path: string): string {
  const trimmedPath = path.startsWith("/") ? path : `/${path}`
  const base = getAdminApiBaseUrl()
  if (!base) return trimmedPath
  return `${base}${trimmedPath}`
}
