import { ApiError } from "@workspace/api-client"

const REPORT_HEADER = "BÁO CÁO API PUBLIC — HUB"
const MAX_JSON_CHARS = 12_000

const REDACT_KEYS = new Set(
  [
    "password",
    "currentpassword",
    "newpassword",
    "currentPassword",
    "newPassword",
    "token",
    "accesstoken",
    "refreshtoken",
    "secret",
    "authorization",
    "credential",
  ].map((key) => key.toLowerCase()),
)

function redactDeep(value: unknown, depth = 6): unknown {
  if (depth <= 0) return "…"
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactDeep(item, depth - 1))
  }
  if (typeof value !== "object") return value
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACT_KEYS.has(key.toLowerCase()) ? "[redacted]" : redactDeep(val, depth - 1)
  }
  return out
}

function safeJsonStringify(value: unknown): string {
  try {
    const text = JSON.stringify(redactDeep(value), null, 2)
    if (text.length <= MAX_JSON_CHARS) return text
    return `${text.slice(0, MAX_JSON_CHARS)}\n… (+${text.length - MAX_JSON_CHARS} ký tự)`
  } catch {
    return String(value)
  }
}

function formatApiError(error: ApiError): string[] {
  const lines = [
    `ApiError: ${error.message}`,
    `Status: ${error.status} ${error.statusText}`,
  ]
  if (error.request) {
    lines.push(`Request: ${error.request.method} ${error.request.path}`)
    lines.push(`URL: ${error.request.url}`)
  }
  if (error.body !== undefined) {
    lines.push("", "Body:", safeJsonStringify(error.body))
  }
  return lines
}

export type PublicApiSubmitCopyReportInput = {
  label: string
  method: string
  path: string
  message?: string
  pagePath?: string | null
  request?: unknown
  response?: unknown
  error?: unknown
}

/** Báo cáo copy (dev) cho toast sau submit API public — không hiển thị trong UI toast. */
export function buildPublicApiSubmitCopyReport(
  input: PublicApiSubmitCopyReportInput,
): string {
  const lines = [
    REPORT_HEADER,
    "",
    `Thao tác: ${input.label}`,
    `HTTP: ${input.method} ${input.path}`,
  ]

  if (input.pagePath?.trim()) {
    lines.push(`Trang: ${input.pagePath.trim()}`)
  }
  if (input.message?.trim()) {
    lines.push(`Thông báo UI: ${input.message.trim()}`)
  }

  if (input.request !== undefined) {
    lines.push("", "── Request (JSON) ──", safeJsonStringify(input.request))
  }
  if (input.response !== undefined) {
    lines.push("", "── Response (JSON) ──", safeJsonStringify(input.response))
  }
  if (input.error !== undefined) {
    lines.push("", "── Error ──")
    if (input.error instanceof ApiError) {
      lines.push(...formatApiError(input.error))
    } else if (input.error instanceof Error) {
      lines.push(`${input.error.name}: ${input.error.message}`)
    } else {
      lines.push(safeJsonStringify(input.error))
    }
  }

  lines.push(
    "",
    "Ghi chú: Báo cáo API public — thời lượng xử lý được gắn khi bấm Sao chép.",
  )

  return lines.join("\n")
}
