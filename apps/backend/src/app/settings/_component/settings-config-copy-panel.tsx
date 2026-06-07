"use client"

import { useCallback, useState } from "react"
import { Check, ChevronDown, Copy } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/components/collapsible"
import { toast } from "@ui/components/sonner"
import { cn } from "@ui/lib/utils"

function useCopyConfig(configText: string, copySuccessMessage: string) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(configText)
      setCopied(true)
      toast.success(copySuccessMessage)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Không sao chép được — mở khung xem JSON bên dưới")
    }
  }, [configText, copySuccessMessage])

  return { copied, onCopy }
}

export function SettingsConfigCopyButton({
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
  const { copied, onCopy } = useCopyConfig(configText, copySuccessMessage)

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

export function SettingsConfigCopyPanel({
  configText,
  copySuccessMessage,
  hasUnsavedChanges = false,
  defaultOpen = false,
}: {
  configText: string
  copySuccessMessage: string
  hasUnsavedChanges?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const { copied, onCopy } = useCopyConfig(configText, copySuccessMessage)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border border-border/60 bg-muted/15"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
          <span className="truncate">
            Xem JSON cấu hình
            {hasUnsavedChanges ? (
              <span className="text-amber-600 dark:text-amber-500">
                {" "}
                · chưa lưu
              </span>
            ) : null}
          </span>
        </CollapsibleTrigger>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 gap-1 rounded-lg px-2 text-xs"
          onClick={() => void onCopy()}
        >
          {copied ? (
            <>
              <Check className="size-3" aria-hidden />
              Đã copy
            </>
          ) : (
            <>
              <Copy className="size-3" aria-hidden />
              Copy
            </>
          )}
        </Button>
      </div>
      <CollapsibleContent>
        <pre className="max-h-40 overflow-auto border-t border-border/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {configText}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}
