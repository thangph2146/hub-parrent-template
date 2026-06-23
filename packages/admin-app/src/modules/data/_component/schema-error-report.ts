import { ApiError } from "@workspace/api-client"
import { getAdminDevAuthLogContext } from "@workspace/admin-app/lib/auth-session"
import {
  formatAdminOperationReportBrandingSection,
  resolveAdminOperationReportHeader,
} from "@ui/lib/admin-operation-report-branding"

const REPORT_FOOTER =
  "Ghi chú: Báo cáo dùng cho review/debug — không chứa mật khẩu (đã redact)."

function formatErrorBody(body: unknown): string | undefined {
  if (body == null) return undefined
  if (typeof body === "string" && body.trim()) return body.trim()
  if (typeof body === "object") {
    try {
      return JSON.stringify(body, null, 2)
    } catch {
      return String(body)
    }
  }
  return String(body)
}

function resolveDisplayMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const body = error.body as Record<string, unknown> | null | undefined
    const fromBody =
      typeof body?.message === "string" ? body.message.trim() : ""
    if (fromBody) return fromBody
    return error.message.trim() || fallback
  }
  if (error instanceof Error) return error.message.trim() || fallback
  const text = String(error ?? "").trim()
  return text || fallback
}

/** Báo cáo copy khi GET /admin/system/database-schema thất bại. */
export function buildDatabaseSchemaErrorCopyText(
  error: unknown,
  displayMessage: string
): string {
  const lines: string[] = [
    resolveAdminOperationReportHeader(),
    "",
    "── Tải schema entity (MikroORM) ──",
    "Thao tác: GET /admin/system/database-schema",
    `Thời gian: ${new Date().toISOString()}`,
    "",
    "── Lỗi hiển thị ──",
    `Tiêu đề: Không tải được schema`,
    `Mô tả: ${displayMessage}`,
  ]

  if (error instanceof ApiError) {
    lines.push(
      "",
      "── Chi tiết HTTP ──",
      `HTTP: ${error.status} ${error.statusText}`.trim()
    )
    if (error.request?.method && error.request?.path) {
      lines.push(
        `Request: ${error.request.method} ${error.request.path}`
      )
    }
    if (error.request?.url) {
      lines.push(`URL: ${error.request.url}`)
    }
    const rawMessage = error.message.trim()
    if (rawMessage && rawMessage !== displayMessage) {
      lines.push(`Message (ApiError): ${rawMessage}`)
    }
    const bodyText = formatErrorBody(error.body)
    if (bodyText) {
      lines.push("", "── Response body ──", bodyText)
    }
  } else if (error instanceof Error) {
    const raw = error.message.trim()
    if (raw && raw !== displayMessage) {
      lines.push("", "── Chi tiết ──", raw)
    }
    if (error.name && error.name !== "Error") {
      lines.push(`Loại: ${error.name}`)
    }
  } else if (error != null) {
    lines.push("", "── Chi tiết ──", resolveDisplayMessage(error, displayMessage))
  }

  lines.push(
    "",
    "── Phiên admin ──",
    typeof window === "undefined" ? "ctx=SSR" : getAdminDevAuthLogContext(),
    ...formatAdminOperationReportBrandingSection(),
    "",
    REPORT_FOOTER
  )

  return lines.join("\n")
}
