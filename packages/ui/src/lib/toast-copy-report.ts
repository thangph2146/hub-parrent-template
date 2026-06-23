import {
  formatAdminOperationReportBrandingSection,
  resolveAdminOperationReportHeader,
} from "./admin-operation-report-branding"
import {
  appendOrReplaceCopyTimingSection,
  formatCopyTimingSection,
  type CopyTimingInput,
} from "./toast-copy-timing"
import type { ToastOptions, ToastVariant } from "./toast-types"

const VARIANT_LABEL_VI: Record<ToastVariant, string> = {
  success: "Thành công",
  error: "Lỗi",
  warning: "Cảnh báo",
  info: "Thông tin",
  loading: "Đang xử lý",
  default: "Thông báo",
}

export function resolveToastMessageText(message: unknown): string {
  if (typeof message === "string") return message.trim()
  if (message == null) return ""
  return String(message).trim()
}

/** Báo cáo copy mặc định khi toast không truyền `copyReport`. */
export function buildToastFallbackCopyReport(
  message: unknown,
  data?: Pick<ToastOptions, "description" | "copyVariant">,
  variant: ToastVariant = "default",
  timing?: CopyTimingInput,
): string {
  const effectiveVariant = data?.copyVariant ?? variant
  const lines = [
    resolveAdminOperationReportHeader(),
    ...formatAdminOperationReportBrandingSection(),
    "",
    "── Nội dung toast ──",
    `Loại: ${VARIANT_LABEL_VI[effectiveVariant]}`,
  ]

  const msg = resolveToastMessageText(message)
  if (msg) lines.push(`Thông báo: ${msg}`)

  const desc =
    typeof data?.description === "string" ? data.description.trim() : ""
  if (desc) lines.push(`Mô tả: ${desc}`)

  if (typeof window !== "undefined") {
    lines.push(`URL: ${window.location.href}`)
  }

  if (timing) {
    lines.push(...formatCopyTimingSection(timing))
  } else {
    lines.push("", `Thời gian: ${new Date().toISOString()}`)
  }

  lines.push(
    "",
    "Ghi chú: Báo cáo dùng cho hỗ trợ kỹ thuật — không chứa mật khẩu.",
  )

  return lines.join("\n")
}

function resolveCopyReport(data?: ToastOptions): string | undefined {
  const built = data?.copyReportBuilder?.()?.trim()
  if (built) return built
  return data?.copyReport?.trim() || undefined
}

/** Nội dung copy tại thời điểm bấm Sao chép — có thời lượng xử lý thực tế. */
export function buildToastCopyText(input: {
  message: unknown
  data?: ToastOptions
  variant: ToastVariant
  startedAt: number
  copiedAt: number
}): string {
  const { message, data, variant, startedAt, copiedAt } = input
  const timing: CopyTimingInput = { startedAt, copiedAt }

  const report = resolveCopyReport(data)
  if (report) {
    return appendOrReplaceCopyTimingSection(report, timing)
  }

  return buildToastFallbackCopyReport(message, data, variant, timing)
}
