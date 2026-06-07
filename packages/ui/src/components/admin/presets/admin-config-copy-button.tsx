"use client"

import { useCallback, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "../../button"
import { toast } from "../../sonner"

export function AdminConfigCopyButton({
  configText,
  copySuccessMessage,
  hasUnsavedChanges = false,
  label = "Sao chép JSON",
}: {
  configText: string
  copySuccessMessage: string
  hasUnsavedChanges?: boolean
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(configText)
      setCopied(true)
      toast.success(copySuccessMessage)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Không sao chép được")
    }
  }, [configText, copySuccessMessage])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 gap-1.5 rounded-lg"
      onClick={() => void onCopy()}
      title={
        hasUnsavedChanges
          ? "Snapshot form — có thay đổi chưa lưu"
          : "Snapshot JSON cấu hình hiện tại"
      }
    >
      {copied ? (
        <>
          <Check className="size-3.5" aria-hidden />
          Đã copy
        </>
      ) : (
        <>
          <Copy className="size-3.5" aria-hidden />
          {label}
        </>
      )}
      {hasUnsavedChanges ? (
        <span
          className="size-1.5 rounded-full bg-amber-500"
          aria-label="Có thay đổi chưa lưu"
        />
      ) : null}
    </Button>
  )
}
