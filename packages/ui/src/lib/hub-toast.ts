"use client"

import { toast as baseToast, type ExternalToast } from "sonner"

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
  data?: ExternalToast
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

type HubToast = typeof baseToast

/** Toast Sonner — `error` / `warning` có nút Sao chép nội dung. */
export const toast: HubToast = Object.assign(
  (message: ToastMessage, data?: ExternalToast) => baseToast(message, data),
  {
    ...baseToast,
    error: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.error(message, withCopyAction(message, data)),
    warning: (message: ToastMessage, data?: ExternalToast) =>
      baseToast.warning(message, withCopyAction(message, data)),
  }
)
