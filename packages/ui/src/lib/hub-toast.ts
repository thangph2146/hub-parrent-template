"use client"

import { toast as baseToast, type ExternalToast } from "sonner"
import { suppressRealtimeToastForEntity } from "./admin-toast-suppress"
import {
  type HubToastOptions,
  toSonnerToastOptions,
} from "./hub-toast-types"

type ToastMessage = Parameters<typeof baseToast>[0]

function extractCopyText(message: ToastMessage, data?: HubToastOptions): string {
  if (data?.copyReport?.trim()) return data.copyReport.trim()
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
    baseToast.success("Đã sao chép báo cáo", { duration: 1500 })
  } catch {
    baseToast.error("Không sao chép được", { duration: 2000 })
  }
}

function withCopyAction(
  message: ToastMessage,
  data?: HubToastOptions,
): ExternalToast | undefined {
  if (data?.action) return toSonnerToastOptions(data)
  const copyText = extractCopyText(message, data)
  if (!copyText) return toSonnerToastOptions(data)
  const sonnerData = toSonnerToastOptions(data)
  return {
    ...sonnerData,
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
  data?: HubToastOptions,
  suppress?: MutationSuccessSuppress
): string | number {
  if (suppress?.resource) {
    suppressRealtimeToastForEntity(
      suppress.resource,
      suppress.id,
      suppress.action
    )
  }
  return baseToast.success(message, withCopyAction(message, data))
}

export type HubToast = typeof baseToast & {
  mutationSuccess: typeof mutationSuccess
}

/** Toast Sonner — nút Sao chép (dev: `copyReport` = báo cáo đầy đủ, UI chỉ hiện message). */
export const toast: HubToast = Object.assign(
  (message: ToastMessage, data?: HubToastOptions) =>
    baseToast(message, withCopyAction(message, data)),
  {
    ...baseToast,
    success: (message: ToastMessage, data?: HubToastOptions) =>
      baseToast.success(message, withCopyAction(message, data)),
    error: (message: ToastMessage, data?: HubToastOptions) =>
      baseToast.error(message, withCopyAction(message, data)),
    warning: (message: ToastMessage, data?: HubToastOptions) =>
      baseToast.warning(message, withCopyAction(message, data)),
    info: (message: ToastMessage, data?: HubToastOptions) =>
      baseToast.info(message, withCopyAction(message, data)),
    loading: (message: ToastMessage, data?: HubToastOptions) =>
      baseToast.loading(message, withCopyAction(message, data)),
    mutationSuccess,
  }
)

export type { HubToastOptions } from "./hub-toast-types"
