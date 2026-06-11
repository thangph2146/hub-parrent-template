"use client"

import { useCallback, useState } from "react"
import { toast } from "@ui/components/sonner"
import { Button } from "@ui/components/button"
import { Badge } from "@ui/components/badge"
import { FieldSectionValue } from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Loader2,
  MinusCircle,
  XCircle,
} from "lucide-react"
import {
  buildImportProgressReport,
  buildModelImportCopyText,
  formatImportErrorMessage,
} from "./_component/import-error-message"
import {
  formatImportDuration,
  formatModelTimingSummary,
} from "./_component/import-timing"
import type {
  ImportJobTimingEntry,
  ImportModelTimingStats,
} from "./_component/import-timing"

export type ImportModelStatus =
  | "pending"
  | "importing"
  | "done"
  | "error"
  | "skipped"

export type ImportModelProgress = {
  name: string
  records: number
  status: ImportModelStatus
  /** Ví dụ: "lô 2/5" khi import file lớn theo từng phần. */
  detail?: string
  /** Tóm tắt ngắn (1 dòng). */
  error?: string
  /** Chi tiết từng dòng lỗi — hiển thị danh sách. */
  rowErrorDetails?: string[]
  /** Tooltip: lỗi gốc từ API (SQL đầy đủ). */
  errorTitle?: string
  /** Thời gian import bảng (wall + HTTP + server). */
  timing?: ImportModelTimingStats
}

export type ImportProgressState = {
  active: boolean
  models: ImportModelProgress[]
  currentIndex: number
  total: number
  totalRecords: number
  cumulativeImported: number
  status: "idle" | "importing" | "done" | "error"
  message?: string
  /** Tổng thời gian import (ms). */
  totalDurationMs?: number
  /** Chi tiết từng lô HTTP (báo cáo copy). */
  jobTimings?: ImportJobTimingEntry[]
}

export function withSkippedRemaining(
  models: ImportModelProgress[]
): ImportModelProgress[] {
  return models.map((model) =>
    model.status === "pending" || model.status === "importing"
      ? { ...model, status: "skipped" as const }
      : model
  )
}

const STATUS_META: Record<
  ImportModelStatus,
  {
    label: string
    icon: typeof Circle
    className: string
    spin?: boolean
  }
> = {
  pending: {
    label: "Chờ",
    icon: Circle,
    className: "text-muted-foreground",
  },
  importing: {
    label: "Đang import",
    icon: Loader2,
    className: "text-primary",
    spin: true,
  },
  done: {
    label: "Xong",
    icon: CheckCircle2,
    className: "text-emerald-600",
  },
  error: {
    label: "Lỗi",
    icon: XCircle,
    className: "text-destructive",
  },
  skipped: {
    label: "Bỏ qua",
    icon: MinusCircle,
    className: "text-muted-foreground",
  },
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(textarea)
      return ok
    } catch {
      return false
    }
  }
}

function CopyTextButton({
  text,
  label,
  copiedLabel = "Đã copy",
  className,
  onCopied,
}: {
  text: string
  label: string
  copiedLabel?: string
  className?: string
  onCopied?: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const ok = await copyTextToClipboard(text)
    if (!ok) {
      toast.error("Không copy được — thử chọn và copy thủ công.")
      return
    }
    setCopied(true)
    onCopied?.()
    window.setTimeout(() => setCopied(false), 2000)
  }, [onCopied, text])

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn("h-7 gap-1 px-2 text-xs", className)}
      onClick={() => void handleCopy()}
      title={label}
    >
      {copied ? (
        <>
          <Check className="size-3.5" aria-hidden />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="size-3.5" aria-hidden />
          {label}
        </>
      )}
    </Button>
  )
}

function ModelStatusIcon({ status }: { status: ImportModelStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <Icon
      className={cn(
        "size-3.5 shrink-0",
        meta.className,
        meta.spin && "animate-spin"
      )}
      aria-hidden
    />
  )
}

type ImportProgressPanelProps = {
  progress: ImportProgressState
  onReset: () => void
}

export function ImportProgressPanel({
  progress,
  onReset,
}: ImportProgressPanelProps) {
  const {
    active,
    models,
    total,
    totalRecords,
    cumulativeImported,
    status,
    message,
    currentIndex,
    totalDurationMs,
  } = progress

  const doneCount = models.filter((m) => m.status === "done").length
  const errorCount = models.filter((m) => m.status === "error").length
  const skippedCount = models.filter((m) => m.status === "skipped").length
  const chunkMode = total > models.length
  const percent =
    totalRecords > 0
      ? Math.min(100, Math.round((cumulativeImported / totalRecords) * 100))
      : total > 0
        ? Math.min(100, Math.round(((currentIndex + 1) / total) * 100))
        : 0

  const headerLabel =
    status === "importing"
      ? "Đang import dữ liệu…"
      : status === "done"
        ? "Import hoàn tất"
        : status === "error"
          ? "Import có lỗi"
          : "Tiến trình import"

  const canReset = status === "done" || status === "error"

  const displayMessage = message ? formatImportErrorMessage(message) : undefined

  const copyReportText = buildImportProgressReport({
    status,
    message,
    cumulativeImported,
    totalRecords,
    currentIndex,
    total,
    models,
    totalDurationMs: progress.totalDurationMs,
    jobTimings: progress.jobTimings,
  })
  const canCopyReport = active && status !== "idle"
  const copyButtonLabel =
    status === "error" || errorCount > 0
      ? "Copy báo cáo"
      : status === "importing"
        ? "Copy tiến độ"
        : "Copy báo cáo"

  return (
    <FieldSectionValue
      className="max-w-full min-w-0 space-y-3 overflow-hidden px-4 py-3"
      data-import-progress-panel
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-full min-w-0 flex-1 space-y-1 overflow-hidden">
          <p className="text-sm font-medium">{headerLabel}</p>
          <p className="text-xs text-muted-foreground">
            {cumulativeImported.toLocaleString("vi-VN")}
            {totalRecords > 0
              ? ` / ${totalRecords.toLocaleString("vi-VN")} bản ghi`
              : null}
            {chunkMode
              ? ` · lô ${Math.min(currentIndex + 1, total)}/${total}`
              : total > 0
                ? ` · ${doneCount}/${models.length} bảng`
                : null}
            {totalDurationMs != null && totalDurationMs > 0
              ? ` · ${formatImportDuration(totalDurationMs)}`
              : null}
          </p>
          {displayMessage ? (
            <p
              className={cn(
                "text-xs leading-relaxed font-medium break-words",
                status === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
              title={message !== displayMessage ? message : undefined}
            >
              {displayMessage}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {errorCount > 0 ? (
            <Badge variant="destructive" className="text-[10px] font-normal">
              {errorCount} lỗi
            </Badge>
          ) : null}
          {skippedCount > 0 ? (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {skippedCount} bỏ qua
            </Badge>
          ) : null}
          {canCopyReport ? (
            <CopyTextButton
              text={copyReportText}
              label={copyButtonLabel}
              onCopied={() =>
                toast.success(
                  status === "importing"
                    ? "Đã copy tiến độ import."
                    : "Đã copy báo cáo import."
                )
              }
            />
          ) : null}
          {canReset ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={onReset}
            >
              Đóng
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Tiến trình import"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            status === "error" ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="max-h-72 space-y-1 overflow-y-auto rounded-md border bg-background/60 p-2 text-xs">
        {models.map((model) => {
          const meta = STATUS_META[model.status]
          const displayError = model.error
            ? formatImportErrorMessage(model.error)
            : undefined
          const rowDetails = model.rowErrorDetails ?? []
          return (
            <li
              key={model.name}
              className="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-muted/40"
            >
              <ModelStatusIcon status={model.status} />
              <div className="min-w-0 flex-1">
                <div className="flex w-full items-start justify-between gap-1.5">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px]">{model.name}</span>
                    <span className="text-muted-foreground">
                      ({model.records.toLocaleString("vi-VN")})
                    </span>
                    <span className={cn("text-[10px]", meta.className)}>
                      {meta.label}
                    </span>
                    {model.detail ? (
                      <span className="text-[10px] text-muted-foreground">
                        {model.detail}
                      </span>
                    ) : null}
                    {model.timing && model.timing.wallMs > 0 ? (
                      <span
                        className="text-[10px] text-muted-foreground"
                        title={formatModelTimingSummary(model.timing)}
                      >
                        {formatModelTimingSummary(model.timing)}
                      </span>
                    ) : null}
                  </div>
                  {model.status === "error" ? (
                    <CopyTextButton
                      text={buildModelImportCopyText(model)}
                      label="Copy"
                      copiedLabel="OK"
                      className="h-6 shrink-0 px-1.5 text-[10px]"
                      onCopied={() =>
                        toast.success(`Đã copy lỗi bảng ${model.name}.`)
                      }
                    />
                  ) : null}
                </div>
                {displayError ? (
                  <p
                    className="mt-0.5 text-[10px] leading-relaxed font-medium break-words text-destructive"
                    title={model.errorTitle}
                  >
                    {displayError}
                  </p>
                ) : null}
                {rowDetails.length > 0 ? (
                  <ul className="mt-1 space-y-0.5 border-l border-destructive/30 pl-2">
                    {rowDetails.map((line, index) => (
                      <li
                        key={`${model.name}-err-${index}`}
                        className="text-[10px] leading-relaxed break-words text-destructive/90"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </FieldSectionValue>
  )
}
