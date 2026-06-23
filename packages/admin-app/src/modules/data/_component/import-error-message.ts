import {
  formatAdminOperationReportBrandingSection,
  resolveAdminOperationReportHeader,
} from "@ui/lib/admin-operation-report-branding"
import {
  formatImportDuration,
  formatImportThroughput,
  formatInProgressModelTiming,
  formatModelTimingSummary,
  resolveModelElapsedMs,
  resolveWallClockElapsedMs,
  type ImportCurrentJobTiming,
  type ImportJobTimingEntry,
  type ImportModelTimingStats,
} from "./import-timing"

const IMPORT_REPORT_FOOTER =
  "Ghi chú: Báo cáo dùng cho review/debug — không chứa mật khẩu (đã redact)."

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
    const value = duplicateMatch[1]
    const key = duplicateMatch[2] ?? ""
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

export type ImportSourceFormat = "json" | "xlsx"

export type ImportProgressReportInput = {
  status: string
  message?: string
  cumulativeImported: number
  totalRecords: number
  currentIndex: number
  total: number
  sourceFormat?: ImportSourceFormat
  sourceFileName?: string
  totalDurationMs?: number
  importStartedAtMs?: number
  currentJob?: ImportCurrentJobTiming
  jobTimings?: ImportJobTimingEntry[]
  models: Array<{
    name: string
    tableName?: string
    records: number
    status: string
    detail?: string
    error?: string
    rowErrorDetails?: string[]
    errorTitle?: string
    timing?: ImportModelTimingStats
  }>
}

function formatModelDisplayName(model: {
  name: string
  tableName?: string
}): string {
  return model.tableName?.trim() || model.name
}

function formatJobTimingLabel(
  job: Pick<ImportJobTimingEntry, "label" | "primaryModel">,
  models: ImportProgressReportInput["models"]
): string {
  const model = models.find((entry) => entry.name === job.primaryModel)
  const display = formatModelDisplayName(
    model ?? { name: job.primaryModel }
  )
  if (job.label === job.primaryModel) return display
  if (job.label.startsWith(`${job.primaryModel} `)) {
    return job.label.replace(job.primaryModel, display)
  }
  return job.label
}

const IMPORT_SOURCE_FORMAT_LABEL: Record<ImportSourceFormat, string> = {
  json: "JSON (.json)",
  xlsx: "Excel (.xlsx)",
}

const IMPORT_OPERATION_BY_FORMAT: Record<ImportSourceFormat, string> = {
  json: "data / import-json",
  xlsx: "data / import-xlsx",
}

function formatImportSourceSection(
  progress: ImportProgressReportInput,
): string[] {
  if (!progress.sourceFormat && !progress.sourceFileName?.trim()) return []

  const lines = ["", "── Nguồn file import ──"]
  if (progress.sourceFormat) {
    lines.push(
      `Định dạng: ${IMPORT_SOURCE_FORMAT_LABEL[progress.sourceFormat]}`,
    )
  }
  if (progress.sourceFileName?.trim()) {
    lines.push(`Tên file: ${progress.sourceFileName.trim()}`)
  }
  return lines
}

function resolveImportOperationLabel(
  progress: ImportProgressReportInput,
): string {
  if (progress.sourceFormat) {
    return IMPORT_OPERATION_BY_FORMAT[progress.sourceFormat]
  }
  return "data / import"
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
  model: ImportProgressReportInput["models"][number],
  reportNowMs: number
): string {
  const statusLabel = IMPORT_MODEL_STATUS_LABEL[model.status] ?? model.status
  const label = formatModelDisplayName(model)
  const parts = [
    `- ${label} (${model.records.toLocaleString("vi-VN")} bản ghi): ${statusLabel}`,
  ]
  if (model.timing) {
    if (model.status === "importing" && model.timing.startedAtMs != null) {
      parts.push(
        `  Thời gian: ${formatInProgressModelTiming(model.timing, reportNowMs)}`
      )
    } else if (model.timing.wallMs > 0) {
      parts.push(`  Thời gian: ${formatModelTimingSummary(model.timing)}`)
    }
  }
  if (model.detail) parts.push(`  Lô: ${model.detail}`)
  if (model.error) parts.push(`  Lỗi: ${model.error}`)
  for (const detail of model.rowErrorDetails ?? []) {
    parts.push(`    ${detail}`)
  }
  return parts.join("\n")
}

function formatJobBundledSuffix(job: {
  label: string
  primaryModel: string
  bundledModels: string[]
}): string {
  if (job.bundledModels.length === 0) return ""
  if (job.label !== job.primaryModel) return ""
  return ` + ${job.bundledModels.join(", ")}`
}

/** Map state panel import → input báo cáo copy. */
export function buildImportProgressReportFromState(progress: {
  status: ImportProgressReportInput["status"]
  message?: string
  cumulativeImported: number
  totalRecords: number
  currentIndex: number
  total: number
  models: ImportProgressReportInput["models"]
  sourceFormat?: ImportSourceFormat
  sourceFileName?: string
  totalDurationMs?: number
  importStartedAtMs?: number
  currentJob?: ImportCurrentJobTiming
  jobTimings?: ImportJobTimingEntry[]
}): string {
  return buildImportProgressReport(progress)
}

/** Văn bản đầy đủ để copy báo cáo import — cùng format báo cáo thao tác admin. */
export function buildImportProgressReport(
  progress: ImportProgressReportInput
): string {
  const reportNowMs = Date.now()
  const statusLabel =
    IMPORT_PROGRESS_STATUS_LABEL[progress.status] ?? progress.status
  const lines: string[] = [
    resolveAdminOperationReportHeader(),
    ...formatAdminOperationReportBrandingSection(),
    "",
    `Thời gian: ${new Date().toISOString()}`,
    `Thao tác: ${resolveImportOperationLabel(progress)}`,
    ...formatImportSourceSection(progress),
    "",
    "── Tổng quan import ──",
    `Trạng thái: ${statusLabel}`,
    `Tiến độ: ${progress.cumulativeImported.toLocaleString("vi-VN")} / ${progress.totalRecords.toLocaleString("vi-VN")} bản ghi`,
  ]

  if (progress.total > 0) {
    const jobsCompleted = progress.jobTimings?.length ?? 0
    const stillRunning =
      progress.status === "importing" && jobsCompleted < progress.total
    lines.push(
      stillRunning
        ? `Lô HTTP: ${jobsCompleted} hoàn tất / ${progress.total} (đang chạy lô ${jobsCompleted + 1})`
        : `Lô HTTP: ${Math.min(Math.max(jobsCompleted, progress.currentIndex + 1), progress.total)} / ${progress.total}`
    )
  }

  if (progress.status === "importing") {
    const pendingRecords = progress.models
      .filter((m) => m.status === "importing" || m.status === "pending")
      .reduce((sum, m) => sum + m.records, 0)
    if (
      pendingRecords > 0 &&
      progress.cumulativeImported + pendingRecords === progress.totalRecords
    ) {
      lines.push(
        `Chưa ghi tiến độ: ${pendingRecords.toLocaleString("vi-VN")} bản ghi (đang xử lý)`
      )
    }
  }
  if (progress.message?.trim()) {
    lines.push(`Hoạt động: ${progress.message.trim()}`)
  }

  if (progress.status === "importing" && progress.currentJob) {
    const jobElapsedMs = resolveWallClockElapsedMs(
      progress.currentJob.startedAtMs,
      reportNowMs
    )
    if (jobElapsedMs != null && jobElapsedMs >= 3000) {
      lines.push(
        `Lô hiện tại đã chờ: ${formatImportDuration(jobElapsedMs)} (roles/users thường < 5s)`
      )
    }
  }

  const elapsedTotalMs =
    resolveWallClockElapsedMs(progress.importStartedAtMs, reportNowMs) ??
    progress.totalDurationMs
  if (elapsedTotalMs != null && elapsedTotalMs > 0) {
    const throughput = formatImportThroughput(
      progress.cumulativeImported,
      elapsedTotalMs
    )
    const durationLabel =
      progress.status === "importing" ? "Thời gian đã chạy" : "Tổng thời gian"
    lines.push(
      `${durationLabel}: ${formatImportDuration(elapsedTotalMs)}${throughput !== "—" ? ` (${throughput})` : ""}`
    )
  }

  if (progress.models.length > 0) {
    lines.push("", "── Trạng thái từng bảng ──")
    for (const model of progress.models) {
      lines.push(formatModelStatusLine(model, reportNowMs))
    }

    const timedModels = progress.models
      .filter((m) => {
        if (m.timing && m.timing.wallMs > 0) return true
        return (
          m.status === "importing" &&
          m.timing?.startedAtMs != null &&
          resolveModelElapsedMs(m.timing, reportNowMs) > 0
        )
      })
      .sort(
        (a, b) =>
          resolveModelElapsedMs(b.timing!, reportNowMs) -
          resolveModelElapsedMs(a.timing!, reportNowMs)
      )
    if (timedModels.length > 0) {
      lines.push("", "── Thời gian từng bảng (chậm → nhanh) ──")
      for (const model of timedModels) {
        const timingText =
          model.status === "importing" && model.timing?.completedAtMs == null
            ? formatInProgressModelTiming(model.timing!, reportNowMs)
            : formatModelTimingSummary(model.timing!)
        lines.push(`- ${formatModelDisplayName(model)}: ${timingText}`)
      }
    }
  }

  if (
    (progress.jobTimings && progress.jobTimings.length > 0) ||
    (progress.currentJob && progress.status === "importing")
  ) {
    lines.push("", "── Chi tiết từng lô HTTP ──")
    for (const job of progress.jobTimings ?? []) {
      const bundled = formatJobBundledSuffix(job)
      const server =
        job.serverRequestMs != null
          ? ` · server ${formatImportDuration(job.serverRequestMs)}`
          : ""
      lines.push(
        `- ${formatJobTimingLabel(job, progress.models)}: ${job.recordCount.toLocaleString("vi-VN")} bản ghi · HTTP ${formatImportDuration(job.httpMs)}${server}${bundled}`
      )
    }
    if (progress.currentJob && progress.status === "importing") {
      const runningMs =
        resolveWallClockElapsedMs(progress.currentJob.startedAtMs, reportNowMs) ??
        0
      const bundled = formatJobBundledSuffix(progress.currentJob)
      lines.push(
        `- ${formatJobTimingLabel(progress.currentJob, progress.models)}: ${progress.currentJob.recordCount.toLocaleString("vi-VN")} bản ghi · HTTP đang chạy ${formatImportDuration(runningMs)}${bundled}`
      )
    }
  }

  const errorModels = progress.models.filter((m) => m.status === "error")
  const skippedModels = progress.models.filter((m) => m.status === "skipped")

  if (errorModels.length > 0) {
    lines.push("", "── Chi tiết lỗi ──")
    for (const model of errorModels) {
      const label = formatModelDisplayName(model)
      lines.push("")
      lines.push(`[${label}]`)
      if (model.errorTitle?.trim()) {
        lines.push(model.errorTitle.trim())
      } else if (model.error?.trim()) {
        lines.push(model.error.trim())
      }
      for (const detail of model.rowErrorDetails ?? []) {
        lines.push(`  ${detail}`)
      }
    }
  } else if (
    progress.status === "error" &&
    progress.message?.trim()
  ) {
    lines.push("", "── Chi tiết lỗi ──", progress.message.trim())
  }

  if (skippedModels.length > 0) {
    lines.push("", "── Bảng bỏ qua ──")
    for (const model of skippedModels) {
      lines.push(
        `- ${formatModelDisplayName(model)} (${model.records.toLocaleString("vi-VN")} bản ghi)`
      )
    }
  }

  lines.push("", IMPORT_REPORT_FOOTER)

  return lines.join("\n")
}

export function buildModelImportCopyText(model: {
  name: string
  tableName?: string
  records: number
  detail?: string
  error?: string
  rowErrorDetails?: string[]
  errorTitle?: string
}): string {
  const label = formatModelDisplayName(model)
  const lines = [
    `[${label}] ${model.records.toLocaleString("vi-VN")} bản ghi`,
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

/** Chuẩn hóa lỗi mạng fetch (Failed to fetch) thành tiếng Việt. */
export function formatImportNetworkError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message.trim()
      : String(error ?? "").trim()
  if (!raw || raw === "Failed to fetch" || /failed to fetch/i.test(raw)) {
    return "Lỗi mạng — không kết nối được API. Kiểm tra server đang chạy."
  }
  return formatImportErrorMessage(raw)
}
