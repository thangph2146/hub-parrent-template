import {
  formatImportDuration,
  formatImportThroughput,
  formatModelTimingSummary,
  type ImportJobTimingEntry,
  type ImportModelTimingStats,
} from "./import-timing"

const MAX_IMPORT_ERROR_LENGTH = 220

export type ImportRowError = {
  model: string
  index: number
  message: string
}

/** Thông báo tổng hợp từ API — không mang chi tiết từng dòng. */
export function isGenericImportSummaryMessage(message: string): boolean {
  const trimmed = message.trim()
  return (
    /^imported with \d+ row error/i.test(trimmed) ||
    /^data imported successfully$/i.test(trimmed)
  )
}

/** Rút gọn lỗi SQL/DB dài thành dòng dễ đọc cho UI. */
export function formatImportErrorMessage(
  raw: string,
  maxLength = MAX_IMPORT_ERROR_LENGTH
): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const classified = classifyImportErrorDetail(trimmed)
  if (classified !== trimmed) {
    return truncateText(classified, maxLength)
  }

  const dashTail = trimmed.match(/ - ([\s\S]+)$/)
  if (dashTail?.[1]) {
    const summary = classifyImportErrorDetail(dashTail[1].trim())
    if (summary.length > 0 && summary.length < trimmed.length) {
      return truncateText(summary, maxLength)
    }
  }

  if (/^insert into\s+/i.test(trimmed)) {
    return "Lỗi khi ghi dữ liệu vào database."
  }

  if (/^update\s+/i.test(trimmed) || /^delete from\s+/i.test(trimmed)) {
    return "Lỗi khi cập nhật dữ liệu trong database."
  }

  return truncateText(trimmed, maxLength)
}

/** Diễn giải lỗi DB thành tiếng Việt ngắn gọn. */
export function classifyImportErrorDetail(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const duplicateMatch = trimmed.match(
    /duplicate entry '([^']*)' for key '([^']+)'/i
  )
  if (duplicateMatch) {
    const [, value, key] = duplicateMatch
    const keyLabel =
      key.toLowerCase() === "primary"
        ? "khóa chính (id)"
        : key.toLowerCase() === "unique" || key.includes("unique")
          ? "giá trị duy nhất"
          : `khóa «${key}»`
    return value
      ? `Trùng ${keyLabel}: «${value}» đã tồn tại`
      : `Trùng ${keyLabel} — bản ghi đã tồn tại trong database`
  }

  const lower = trimmed.toLowerCase()
  if (
    lower.includes("foreign key constraint") ||
    lower.includes("cannot add or update")
  ) {
    return "Vi phạm khóa ngoại — bảng liên quan chưa có dữ liệu hoặc id không khớp"
  }
  if (lower.includes("cannot delete or update a parent row")) {
    return "Không thể ghi đè — còn bản ghi con tham chiếu tới dòng này"
  }
  if (lower.includes("data too long")) {
    return "Dữ liệu quá dài so với cột trong database"
  }
  if (
    lower.includes("incorrect datetime") ||
    lower.includes("invalid datetime")
  ) {
    return "Định dạng ngày giờ không hợp lệ"
  }
  if (
    lower.includes("cannot be null") ||
    lower.includes("column cannot be null")
  ) {
    return "Thiếu trường bắt buộc (NOT NULL)"
  }

  return trimmed
}

export function formatRowErrorLine(error: ImportRowError): string {
  return `Dòng ${error.index + 1}: ${classifyImportErrorDetail(error.message)}`
}

export function getModelRowErrorDetails(
  modelName: string,
  rowErrors: ImportRowError[],
  maxLines = 6
): string[] {
  return rowErrors
    .filter((row) => row.model === modelName)
    .slice(0, maxLines)
    .map((row) => formatRowErrorLine(row))
}

export function buildModelImportErrorSummary(
  modelName: string,
  rowErrors: ImportRowError[]
): {
  summary: string
  details: string[]
  fullTitle?: string
} {
  const modelErrors = rowErrors.filter((row) => row.model === modelName)
  if (modelErrors.length === 0) {
    return { summary: "", details: [] }
  }

  const firstDetail = classifyImportErrorDetail(modelErrors[0]!.message)
  const errorKind = (msg: string) => {
    const lower = classifyImportErrorDetail(msg).toLowerCase()
    if (lower.startsWith("trùng khóa chính")) return "duplicate-pk"
    if (lower.startsWith("trùng")) return "duplicate"
    if (lower.includes("khóa ngoại")) return "fk"
    return classifyImportErrorDetail(msg)
  }
  const firstKind = errorKind(modelErrors[0]!.message)
  const allSame = modelErrors.every(
    (row) => errorKind(row.message) === firstKind
  )

  const details = allSame
    ? modelErrors.length === 1
      ? [formatRowErrorLine(modelErrors[0]!)]
      : [
          formatRowErrorLine(modelErrors[0]!),
          `… cùng lỗi trên ${modelErrors.length} dòng trong file`,
        ]
    : (() => {
        const lines = getModelRowErrorDetails(modelName, rowErrors)
        const remaining = modelErrors.length - lines.length
        if (remaining > 0) {
          lines.push(`… và ${remaining} lỗi khác`)
        }
        return lines
      })()

  const summary = allSame
    ? firstKind === "duplicate-pk"
      ? `${modelErrors.length} bản ghi lỗi — trùng khóa chính (id đã tồn tại trong database)`
      : `${modelErrors.length} bản ghi lỗi — ${firstDetail}`
    : `${modelErrors.length} bản ghi lỗi`

  const fullTitle = modelErrors
    .map((row) => `[${row.model}#${row.index + 1}] ${row.message}`)
    .join("\n")

  return { summary, details, fullTitle }
}

export type ImportProgressReportInput = {
  status: string
  message?: string
  cumulativeImported: number
  totalRecords: number
  currentIndex: number
  total: number
  totalDurationMs?: number
  jobTimings?: ImportJobTimingEntry[]
  models: Array<{
    name: string
    records: number
    status: string
    detail?: string
    error?: string
    rowErrorDetails?: string[]
    errorTitle?: string
    timing?: ImportModelTimingStats
  }>
}

const IMPORT_PROGRESS_STATUS_LABEL: Record<string, string> = {
  idle: "Chờ",
  importing: "Đang import",
  done: "Hoàn tất",
  error: "Có lỗi",
}

const IMPORT_MODEL_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ",
  importing: "Đang import",
  done: "Xong",
  error: "Lỗi",
  skipped: "Bỏ qua",
}

function formatModelStatusLine(
  model: ImportProgressReportInput["models"][number]
): string {
  const statusLabel = IMPORT_MODEL_STATUS_LABEL[model.status] ?? model.status
  const parts = [
    `- ${model.name} (${model.records.toLocaleString("vi-VN")} bản ghi): ${statusLabel}`,
  ]
  if (model.timing && model.timing.wallMs > 0) {
    parts.push(`  Thời gian: ${formatModelTimingSummary(model.timing)}`)
  }
  if (model.detail) parts.push(`  Lô: ${model.detail}`)
  if (model.error) parts.push(`  Lỗi: ${model.error}`)
  for (const detail of model.rowErrorDetails ?? []) {
    parts.push(`    ${detail}`)
  }
  return parts.join("\n")
}

/** Văn bản đầy đủ để copy báo cáo import (tiến độ + lỗi + SQL gốc nếu có). */
export function buildImportProgressReport(
  progress: ImportProgressReportInput
): string {
  const statusLabel =
    IMPORT_PROGRESS_STATUS_LABEL[progress.status] ?? progress.status
  const lines: string[] = [
    "=== Báo cáo import ===",
    `Trạng thái: ${statusLabel}`,
    `Tiến độ: ${progress.cumulativeImported.toLocaleString("vi-VN")} / ${progress.totalRecords.toLocaleString("vi-VN")} bản ghi`,
  ]

  if (progress.total > 0) {
    lines.push(
      `Lô HTTP: ${Math.min(progress.currentIndex + 1, progress.total)} / ${progress.total}`
    )
  }
  if (progress.message?.trim()) {
    lines.push(`Hoạt động: ${progress.message.trim()}`)
  }

  if (progress.totalDurationMs != null && progress.totalDurationMs > 0) {
    const throughput = formatImportThroughput(
      progress.cumulativeImported,
      progress.totalDurationMs
    )
    lines.push(
      `Tổng thời gian: ${formatImportDuration(progress.totalDurationMs)}${throughput !== "—" ? ` (${throughput})` : ""}`
    )
  }

  if (progress.models.length > 0) {
    lines.push("", "=== Trạng thái từng bảng ===")
    for (const model of progress.models) {
      lines.push(formatModelStatusLine(model))
    }

    const timedModels = progress.models
      .filter((m) => m.timing && m.timing.wallMs > 0)
      .sort((a, b) => (b.timing?.wallMs ?? 0) - (a.timing?.wallMs ?? 0))
    if (timedModels.length > 0) {
      lines.push("", "=== Thời gian từng bảng (chậm → nhanh) ===")
      for (const model of timedModels) {
        lines.push(
          `- ${model.name}: ${formatModelTimingSummary(model.timing!)}`
        )
      }
    }
  }

  if (progress.jobTimings && progress.jobTimings.length > 0) {
    lines.push("", "=== Chi tiết từng lô HTTP ===")
    for (const job of progress.jobTimings) {
      const bundled =
        job.bundledModels.length > 0 ? ` + ${job.bundledModels.join(", ")}` : ""
      const server =
        job.serverRequestMs != null
          ? ` · server ${formatImportDuration(job.serverRequestMs)}`
          : ""
      lines.push(
        `- ${job.label}: ${job.recordCount.toLocaleString("vi-VN")} bản ghi · HTTP ${formatImportDuration(job.httpMs)}${server}${bundled}`
      )
    }
  }

  const errorModels = progress.models.filter((m) => m.status === "error")
  const skippedModels = progress.models.filter((m) => m.status === "skipped")

  if (errorModels.length > 0) {
    lines.push("", "=== Chi tiết lỗi (SQL gốc) ===")
    for (const model of errorModels) {
      if (model.errorTitle?.trim()) {
        lines.push("")
        lines.push(`[${model.name}]`)
        lines.push(model.errorTitle.trim())
      }
    }
  }

  if (skippedModels.length > 0) {
    lines.push("", "=== Bảng bỏ qua ===")
    for (const model of skippedModels) {
      lines.push(
        `- ${model.name} (${model.records.toLocaleString("vi-VN")} bản ghi)`
      )
    }
  }

  return lines.join("\n")
}

export function buildModelImportCopyText(model: {
  name: string
  records: number
  detail?: string
  error?: string
  rowErrorDetails?: string[]
  errorTitle?: string
}): string {
  const lines = [
    `[${model.name}] ${model.records.toLocaleString("vi-VN")} bản ghi`,
  ]
  if (model.detail) lines.push(`Lô: ${model.detail}`)
  if (model.error) lines.push(model.error)
  for (const detail of model.rowErrorDetails ?? []) {
    lines.push(detail)
  }
  if (model.errorTitle?.trim()) {
    lines.push("", "--- Lỗi gốc (API) ---", model.errorTitle.trim())
  }
  return lines.join("\n")
}

export function buildImportJobFailureMessage(options: {
  jobLabel: string
  primaryModel: string
  rowErrors?: ImportRowError[]
  fallbackMessage?: string
}): string {
  const { jobLabel, primaryModel, rowErrors, fallbackMessage } = options

  if (rowErrors?.length) {
    const { summary } = buildModelImportErrorSummary(primaryModel, rowErrors)
    if (summary) {
      return `${jobLabel}: ${summary}`
    }
    const first = formatRowErrorLine(rowErrors[0]!)
    const extra =
      rowErrors.length > 1 ? ` (+${rowErrors.length - 1} lỗi khác)` : ""
    return `${jobLabel}: ${first}${extra}`
  }

  if (fallbackMessage && !isGenericImportSummaryMessage(fallbackMessage)) {
    return formatImportErrorMessage(fallbackMessage)
  }

  return `Import ${jobLabel} thất bại`
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}
