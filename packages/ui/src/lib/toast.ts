"use client"

import { toast as baseToast, type ExternalToast } from "sonner"
import { suppressRealtimeToastForEntity } from "./admin-toast-suppress"
import {
  buildToastCopyText,
  mergeCopyContext,
} from "./toast-copy-report"
import { resolveCopyStartedAt } from "./toast-copy-timing"
import {
  type ToastCopyContext,
  type ToastOptions,
  type ToastVariant,
  TOAST_COPY_HINT_DONE,
  TOAST_COPY_HINT_ERROR,
  TOAST_COPY_HINT_LOADING,
  toSonnerToastOptions,
} from "./toast-types"

type ToastMessage = Parameters<typeof baseToast>[0]

/** Bật nút Sao chép trên mọi toast (tắt bằng NEXT_PUBLIC_TOAST_COPY=false). */
const showToastCopyAction = process.env.NEXT_PUBLIC_TOAST_COPY !== "false"

type OperationToastState = {
  startedAt: number
  copyContext?: ToastCopyContext
}

const operationStateByToastId = new Map<string | number, OperationToastState>()

async function copyToastText(text: string): Promise<void> {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    baseToast.success("Đã sao chép báo cáo", { duration: 1500 })
  } catch {
    baseToast.error("Không sao chép được", { duration: 2000 })
  }
}

function resolveOperationStartedAt(
  data?: ToastOptions,
): number | undefined {
  if (typeof data?.copyStartedAt === "number") return data.copyStartedAt
  if (data?.id != null) return operationStateByToastId.get(data.id)?.startedAt
  return undefined
}

function mergeOperationToastOptions(
  message: ToastMessage,
  data: ToastOptions | undefined,
  variant: ToastVariant,
): ToastOptions {
  const loadingState =
    data?.id != null ? operationStateByToastId.get(data.id) : undefined
  const startedAt = resolveOperationStartedAt(data)
  const copyContext = mergeCopyContext(
    loadingState?.copyContext,
    data?.copyContext,
  )

  const merged: ToastOptions = {
    ...data,
    ...(startedAt != null ? { copyStartedAt: startedAt } : {}),
    ...(copyContext ? { copyContext } : {}),
  }

  if (variant === "loading") {
    merged.copyStartedAt = merged.copyStartedAt ?? Date.now()
    merged.copyVariant = merged.copyVariant ?? "loading"
    merged.description = merged.description ?? TOAST_COPY_HINT_LOADING
    if (merged.duration == null) merged.duration = Number.POSITIVE_INFINITY
  } else if (startedAt != null) {
    if (!merged.description) {
      merged.description =
        variant === "error" ? TOAST_COPY_HINT_ERROR : TOAST_COPY_HINT_DONE
    }
    if (variant === "success" && merged.duration == null) {
      merged.duration = 6000
    }
    if (variant === "error" && merged.duration == null) {
      merged.duration = 8000
    }
    if (
      copyContext &&
      !copyContext.operationLabel &&
      typeof message === "string" &&
      message.trim()
    ) {
      merged.copyContext = {
        ...copyContext,
        operationLabel: message.trim(),
      }
    }
  }

  return merged
}

function rememberLoadingToastState(
  id: string | number,
  data?: ToastOptions,
): void {
  const startedAt = data?.copyStartedAt ?? Date.now()
  operationStateByToastId.set(id, {
    startedAt,
    copyContext: data?.copyContext,
  })
}

function forgetOperationToastState(id: string | number | undefined): void {
  if (id != null) operationStateByToastId.delete(id)
}

function withCopyAction(
  message: ToastMessage,
  data?: ToastOptions,
  variant: ToastVariant = "default",
): ExternalToast | undefined {
  if (!showToastCopyAction) return toSonnerToastOptions(data)
  if (data?.action) return toSonnerToastOptions(data)

  const merged = mergeOperationToastOptions(message, data, variant)
  const startedAt = resolveCopyStartedAt(merged.copyStartedAt)
  const sonnerData = toSonnerToastOptions(merged)

  return {
    ...sonnerData,
    action: {
      label: "Sao chép",
      onClick: (event) => {
        event.preventDefault()
        const copiedAt = Date.now()
        const copyText = buildToastCopyText({
          message,
          data: merged,
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
  const merged = mergeOperationToastOptions(message, data, "success")
  forgetOperationToastState(merged.id)
  return baseToast.success(message, withCopyAction(message, merged, "success"))
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
    success: (message: ToastMessage, data?: ToastOptions) => {
      const merged = mergeOperationToastOptions(message, data, "success")
      forgetOperationToastState(merged.id)
      return baseToast.success(
        message,
        withCopyAction(message, merged, "success"),
      )
    },
    error: (message: ToastMessage, data?: ToastOptions) => {
      const merged = mergeOperationToastOptions(message, data, "error")
      forgetOperationToastState(merged.id)
      return baseToast.error(message, withCopyAction(message, merged, "error"))
    },
    warning: (message: ToastMessage, data?: ToastOptions) => {
      const merged = mergeOperationToastOptions(message, data, "warning")
      forgetOperationToastState(merged.id)
      return baseToast.warning(
        message,
        withCopyAction(message, merged, "warning"),
      )
    },
    info: (message: ToastMessage, data?: ToastOptions) =>
      baseToast.info(message, withCopyAction(message, data, "info")),
    loading: (message: ToastMessage, data?: ToastOptions) => {
      const merged = mergeOperationToastOptions(message, data, "loading")
      const id = baseToast.loading(
        message,
        withCopyAction(message, merged, "loading"),
      )
      rememberLoadingToastState(id, merged)
      return id
    },
    mutationSuccess,
  },
) as AppToast

export type { ToastOptions, ToastVariant, ToastCopyContext } from "./toast-types"
export {
  TOAST_COPY_HINT_DONE,
  TOAST_COPY_HINT_ERROR,
  TOAST_COPY_HINT_LOADING,
} from "./toast-types"
export {
  buildToastCopyText,
  buildToastFallbackCopyReport,
  buildAutoOperationCopyReport,
} from "./toast-copy-report"
export {
  appendOrReplaceCopyTimingSection,
  formatCopyTimingSection,
  formatDurationMs,
} from "./toast-copy-timing"
