import { getAdminApiCallsSince } from "@workspace/api-client"
import {
  adminOperationToastConfig,
  formatAdminOperationReviewReport,
  formatStorageOperationCopyReport,
} from "./admin-operation-toast-config"
import {
  formatAdminOperationReportBrandingSection,
  resolveAdminOperationReportHeader,
} from "./admin-operation-report-branding"
import {
  appendOrReplaceCopyTimingSection,
  formatCopyTimingSection,
  type CopyTimingInput,
} from "./toast-copy-timing"
import type { ToastCopyContext, ToastOptions, ToastVariant } from "./toast-types"

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

function isStorageCopyContext(
  ctx: ToastCopyContext | undefined,
  apiCalls: ReturnType<typeof getAdminApiCallsSince>,
): boolean {
  if (ctx?.storageOperation) return true
  return apiCalls.some((call) => /\/admin\/uploads/i.test(call.path))
}

function mergeCopyContext(
  base: ToastCopyContext | undefined,
  patch: ToastCopyContext | undefined,
): ToastCopyContext | undefined {
  if (!base && !patch) return undefined
  return {
    ...base,
    ...patch,
    data: patch?.data !== undefined ? patch.data : base?.data,
    error: patch?.error !== undefined ? patch.error : base?.error,
    variables:
      patch?.variables !== undefined ? patch.variables : base?.variables,
  }
}

/** Báo cáo copy đầy đủ từ HTTP trace + ngữ cảnh thao tác. */
export function buildAutoOperationCopyReport(input: {
  message: unknown
  data?: ToastOptions
  variant: ToastVariant
  startedAt: number
}): string | undefined {
  if (!adminOperationToastConfig.devFullCopyReport) return undefined

  const { message, data, variant, startedAt } = input
  const apiCalls = getAdminApiCallsSince(startedAt)
  const ctx = data?.copyContext
  const operationLabel =
    ctx?.operationLabel?.trim() || resolveToastMessageText(message) || "Thao tác"

  const hasTrace = apiCalls.length > 0
  const hasContext =
    ctx != null &&
    (ctx.variables !== undefined ||
      ctx.data !== undefined ||
      ctx.error !== undefined ||
      ctx.mutationKey != null ||
      ctx.adminApi != null ||
      ctx.storageOperation === true)

  const isOperationVariant =
    variant === "loading" ||
    variant === "success" ||
    variant === "error" ||
    variant === "warning"

  const isTrackedOperation =
    hasTrace ||
    hasContext ||
    typeof data?.copyStartedAt === "number" ||
    isOperationVariant

  if (!isTrackedOperation) return undefined

  if (isStorageCopyContext(ctx, apiCalls)) {
    return formatStorageOperationCopyReport({
      operationLabel,
      variables: ctx?.variables,
      data: ctx?.data,
      error:
        ctx?.error ??
        (variant === "error" ? resolveToastMessageText(message) : undefined),
      adminApi:
        ctx?.adminApi &&
        typeof ctx.adminApi.path === "string"
          ? { method: ctx.adminApi.method, path: ctx.adminApi.path }
          : ctx?.adminApi
            ? {
                method: ctx.adminApi.method,
                path:
                  typeof ctx.adminApi.path === "function"
                    ? ctx.adminApi.path(ctx.variables)
                    : ctx.adminApi.path,
              }
            : undefined,
      apiCalls,
    })
  }

  return formatAdminOperationReviewReport({
    operationLabel,
    mutationKey: ctx?.mutationKey,
    variables: ctx?.variables,
    data: ctx?.data,
    error:
      ctx?.error ??
      (variant === "error" ? resolveToastMessageText(message) : undefined),
    adminApi: ctx?.adminApi,
    apiCalls,
  })
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

  const autoReport = buildAutoOperationCopyReport({
    message,
    data,
    variant,
    startedAt,
  })
  if (autoReport) {
    return appendOrReplaceCopyTimingSection(autoReport, timing)
  }

  return buildToastFallbackCopyReport(message, data, variant, timing)
}

export { mergeCopyContext }
