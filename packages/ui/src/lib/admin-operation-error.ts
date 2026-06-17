import { ApiError } from "@workspace/api-client"

function serializeUnknown(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function appendApiErrorBody(lines: string[], body: unknown): void {
  if (!body || typeof body !== "object") {
    const serialized = serializeUnknown(body)
    if (serialized.trim()) lines.push(`Phản hồi API:\n${serialized}`)
    return
  }

  const record = body as Record<string, unknown>
  const message =
    typeof record.message === "string" ? record.message.trim() : ""
  const error =
    typeof record.error === "string" ? record.error.trim() : ""
  const data = record.data

  if (message) lines.push(`API message: ${message}`)
  if (error && error !== message) lines.push(`API error: ${error}`)
  if (data !== undefined) {
    const serialized = serializeUnknown(data)
    if (serialized.trim()) lines.push(`API data:\n${serialized}`)
  }

  if (!message && !error && data === undefined) {
    const serialized = serializeUnknown(body)
    if (serialized.trim()) lines.push(`Phản hồi API:\n${serialized}`)
  }
}

/** Chi tiết kỹ thuật — dùng làm `description` toast (nút Sao chép). */
export function formatAdminOperationErrorDetails(err: unknown): string {
  const lines: string[] = [`Thời gian: ${new Date().toISOString()}`]

  if (err instanceof ApiError) {
    lines.push("Loại: ApiError")
    lines.push(`HTTP: ${err.status} ${err.statusText}`)
    if (err.message.trim()) {
      lines.push(`Thông báo: ${err.message.trim()}`)
    }
    appendApiErrorBody(lines, err.body)
    return lines.join("\n")
  }

  if (err instanceof Error) {
    lines.push(`Loại: ${err.name}`)
    if (err.message.trim()) {
      lines.push(`Thông báo: ${err.message.trim()}`)
    }
    const cause = "cause" in err ? err.cause : undefined
    if (cause) {
      lines.push(`Nguyên nhân:\n${formatAdminOperationErrorDetails(cause)}`)
    }
    if (err.stack?.trim()) {
      lines.push(`Stack:\n${err.stack.trim()}`)
    }
    return lines.join("\n")
  }

  const serialized = serializeUnknown(err)
  if (serialized.trim()) {
    lines.push(`Chi tiết: ${serialized}`)
  }
  return lines.join("\n")
}

export function resolveAdminOperationError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.message.trim()) return err.message.trim()
    return `${err.status} ${err.statusText}`.trim()
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === "string" && message.trim()) return message.trim()
  }
  return "Không thực hiện được thao tác"
}

export function buildAdminOperationErrorToast(
  err: unknown,
  title?: string,
): { message: string; description?: string } {
  const message = title?.trim() || resolveAdminOperationError(err)
  const description = formatAdminOperationErrorDetails(err)
  if (!description || description === message) {
    return { message }
  }
  return { message, description }
}
