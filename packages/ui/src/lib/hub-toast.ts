"use client"

import { toast as baseToast, type ExternalToast } from "sonner"
import { suppressRealtimeToastForEntity } from "./admin-toast-suppress"

type ToastMessage = Parameters<typeof baseToast>[0]

function extractCopyText(message: ToastMessage, data?: ExternalToast): string {
  const parts: string[] = []
  if (typeof message === "string") parts.push(message)
  else if (message != null) parts.push(String(message))
  const desc = data?.description
  if (typeof desc === "string" && desc.trim()) parts.push(desc)
  return parts.join("\n").trim()
}

async function copyToastText(text: string): Promise<void> {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    baseToast.success("Đã sao chép", { duration: 1500 })
  } catch {
    baseToast.error("Không sao chép được", { duration: 2000 })
  }
}

function withCopyAction(
  message: ToastMessage,
  data?: ExternalToast,
): ExternalToast | undefined {
  if (data?.action) return data
  const copyText = extractCopyText(message, data)
  if (!copyText) return data
  return {
    ...data,
    action: {
      label: "Sao chép",
      onClick: (event) => {
        event.preventDefault()
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
  data?: ExternalToast,
  suppress?: MutationSuccessSuppress,
): string | number {
  if (suppress?.resource) {
    suppressRealtimeToastForEntity(
      suppress.resource,
      suppress.id,
      suppress.action,
    )
  }
  return baseToast.success(message, withCopyAction(message, data))
}

export type HubToast = typeof baseToast & {
  mutationSuccess: typeof mutationSuccess
}

/** Toast Sonner — mọi loại đều có nút Sao chép (trừ khi đã có action khác). */
export const toast: HubToast = Object.assign(
  (message: ToastMessage, data?: ExternalToast) =>
    baseToast(message, withCopyAction(message, data)),
  {
    ...baseToast,
    success: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.success(message, withCopyAction(message, data)),
    error: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.error(message, withCopyAction(message, data)),
    warning: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.warning(message, withCopyAction(message, data)),
    info: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.info(message, withCopyAction(message, data)),
    loading: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.loading(message, withCopyAction(message, data)),
    mutationSuccess,
  },
)
