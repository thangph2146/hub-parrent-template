"use client"

import { toast as baseToast, type ExternalToast } from "sonner"
import { suppressRealtimeToastForEntity } from "./admin-toast-suppress"
import { buildToastCopyText } from "./toast-copy-report"
import { resolveCopyStartedAt } from "./toast-copy-timing"
import {
  type ToastOptions,
  type ToastVariant,
  toSonnerToastOptions,
} from "./toast-types"

type ToastMessage = Parameters<typeof baseToast>[0]

/** Bật nút Sao chép trên mọi toast (tắt bằng NEXT_PUBLIC_TOAST_COPY=false). */
const showToastCopyAction = process.env.NEXT_PUBLIC_TOAST_COPY !== "false"

async function copyToastText(text: string): Promise<void> {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    baseToast.success("Đã sao chép báo cáo", { duration: 1500 })
  } catch {
    baseToast.error("Không sao chép được", { duration: 2000 })
  }
}

function withCopyAction(
  message: ToastMessage,
  data?: ToastOptions,
  variant: ToastVariant = "default",
): ExternalToast | undefined {
  if (!showToastCopyAction) return toSonnerToastOptions(data)
  if (data?.action) return toSonnerToastOptions(data)

  const startedAt = resolveCopyStartedAt(data?.copyStartedAt)
  const sonnerData = toSonnerToastOptions(data)

  return {
    ...sonnerData,
    action: {
      label: "Sao chép",
      onClick: (event) => {
        event.preventDefault()
        const copiedAt = Date.now()
        const copyText = buildToastCopyText({
          message,
          data,
          variant,
          startedAt,
          copiedAt,
        })
        if (!copyText.trim()) return
        void copyToastText(copyText)
      },
    },
  }
}

export type MutationSuccessSuppress = {
  resource: string
  id?: string
  action?: string
}

/**
 * Toast sau mutation API thành công (onSuccess) — chỉ gọi khi đã có response 2xx.
 * Đăng ký suppress socket trùng qua toast-coordinator.
 */
export function mutationSuccess(
  message: ToastMessage,
  data?: ToastOptions,
  suppress?: MutationSuccessSuppress
): string | number {
  if (suppress?.resource) {
    suppressRealtimeToastForEntity(
      suppress.resource,
      suppress.id,
      suppress.action
    )
  }
  return baseToast.success(message, withCopyAction(message, data, "success"))
}

type ToastMethod = (
  message: ToastMessage,
  data?: ToastOptions,
) => string | number

/** Toast Sonner — nút Sao chép (`copyReport` = báo cáo đầy đủ, UI chỉ hiện message). */
export type AppToast = Omit<
  typeof baseToast,
  "success" | "error" | "warning" | "info" | "loading"
> & {
  (message: ToastMessage, data?: ToastOptions): string | number
  success: ToastMethod
  error: ToastMethod
  warning: ToastMethod
  info: ToastMethod
  loading: ToastMethod
  mutationSuccess: typeof mutationSuccess
}

export const toast = Object.assign(
  (message: ToastMessage, data?: ToastOptions) =>
    baseToast(message, withCopyAction(message, data)),
  {
    ...baseToast,
    success: (message: ToastMessage, data?: ToastOptions) =>
      baseToast.success(message, withCopyAction(message, data, "success")),
    error: (message: ToastMessage, data?: ToastOptions) =>
      baseToast.error(message, withCopyAction(message, data, "error")),
    warning: (message: ToastMessage, data?: ToastOptions) =>
      baseToast.warning(message, withCopyAction(message, data, "warning")),
    info: (message: ToastMessage, data?: ToastOptions) =>
      baseToast.info(message, withCopyAction(message, data, "info")),
    loading: (message: ToastMessage, data?: ToastOptions) =>
      baseToast.loading(message, withCopyAction(message, data, "loading")),
    mutationSuccess,
  },
) as AppToast

export type { ToastOptions, ToastVariant } from "./toast-types"
export { buildToastCopyText, buildToastFallbackCopyReport } from "./toast-copy-report"
export {
  appendOrReplaceCopyTimingSection,
  formatCopyTimingSection,
  formatDurationMs,
} from "./toast-copy-timing"
