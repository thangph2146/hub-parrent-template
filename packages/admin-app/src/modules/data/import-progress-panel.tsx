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
  Database,
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
    badgeClass: string
    iconClass: string
    spin?: boolean
  }
> = {
  pending: {
    label: "Chờ",
    icon: Circle,
    badgeClass:
      "border-border/70 bg-muted/50 text-muted-foreground",
    iconClass: "text-muted-foreground",
  },
  importing: {
    label: "Đang import",
    icon: Loader2,
    badgeClass:
      "border-primary/30 bg-primary/10 text-primary",
    iconClass: "text-primary",
    spin: true,
  },
  done: {
    label: "Xong",
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    iconClass: "text-emerald-600",
  },
  error: {
    label: "Lỗi",
    icon: XCircle,
    badgeClass:
      "border-destructive/30 bg-destructive/10 text-destructive",
    iconClass: "text-destructive",
  },
  skipped: {
    label: "Bỏ qua",
    icon: MinusCircle,
    badgeClass:
      "border-border/70 bg-muted/40 text-muted-foreground",
    iconClass: "text-muted-foreground",
  },
}

const PANEL_STATUS_CLASS: Record<
  ImportProgressState["status"],
  string
> = {
  idle: "border-border/70 bg-muted/20",
  importing: "border-primary/25 bg-primary/[0.04] shadow-sm shadow-primary/5",
  done: "border-emerald-500/30 bg-emerald-500/[0.05] shadow-sm shadow-emerald-500/5",
  error: "border-destructive/30 bg-destructive/[0.04] shadow-sm shadow-destructive/5",
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
  variant = "outline",
  onCopied,
}: {
  text: string
  label: string
  copiedLabel?: string
  className?: string
  variant?: "outline" | "ghost"
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
      variant={variant}
      className={cn("h-8 gap-1.5 px-2.5 text-xs", className)}
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

function ModelStatusBadge({ status }: { status: ImportModelStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 px-2 py-0.5 text-[10px] font-medium",
        meta.badgeClass
      )}
    >
      <Icon
        className={cn(
          "size-3 shrink-0",
          meta.iconClass,
          meta.spin && "animate-spin"
        )}
        aria-hidden
      />
      {meta.label}
    </Badge>
  )
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
      ) : null}
    </div>
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

  const HeaderIcon =
    status === "importing"
      ? Loader2
      : status === "done"
        ? CheckCircle2
        : status === "error"
          ? XCircle
          : Database

  const headerIconClass =
    status === "importing"
      ? "border-primary/25 bg-primary/10 text-primary animate-pulse"
      : status === "done"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
        : status === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border/70 bg-muted/50 text-muted-foreground"

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

  const batchLabel = chunkMode
    ? `${Math.min(currentIndex + 1, total)}/${total}`
    : models.length > 0
      ? `${doneCount}/${models.length}`
      : "—"

  const batchSub = chunkMode ? "lô HTTP" : "bảng xong"

  return (
    <FieldSectionValue
      copyable={false}
      className={cn(
        "overflow-hidden p-0",
        PANEL_STATUS_CLASS[status]
      )}
      data-import-progress-panel
    >
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                headerIconClass
              )}
            >
              <HeaderIcon
                className={cn(
                  "size-5",
                  status === "importing" && "animate-spin"
                )}
                aria-hidden
              />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {headerLabel}
                </p>
                {errorCount > 0 ? (
                  <Badge variant="destructive" className="text-[10px]">
                    {errorCount} lỗi
                  </Badge>
                ) : null}
                {skippedCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {skippedCount} bỏ qua
                  </Badge>
                ) : null}
              </div>
              {displayMessage ? (
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    status === "error"
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  )}
                  title={message !== displayMessage ? message : undefined}
                >
                  {displayMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
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
                className="h-8 px-2.5 text-xs text-muted-foreground"
                onClick={onReset}
              >
                Đóng
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-foreground">Tiến độ</span>
            <span className="tabular-nums text-muted-foreground">{percent}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-background/80 ring-1 ring-border/50"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Tiến trình import"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                status === "error"
                  ? "bg-destructive"
                  : status === "done"
                    ? "bg-emerald-500"
                    : "bg-primary"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile
            label="Bản ghi"
            value={cumulativeImported.toLocaleString("vi-VN")}
            sub={
              totalRecords > 0
                ? `/ ${totalRecords.toLocaleString("vi-VN")} tổng`
                : undefined
            }
          />
          <StatTile label={chunkMode ? "Lô" : "Bảng"} value={batchLabel} sub={batchSub} />
          <StatTile
            label="Thời gian"
            value={
              totalDurationMs != null && totalDurationMs > 0
                ? formatImportDuration(totalDurationMs)
                : status === "importing"
                  ? "…"
                  : "—"
            }
          />
          <StatTile
            label="Trạng thái"
            value={
              errorCount > 0
                ? `${errorCount} lỗi`
                : status === "done"
                  ? "Hoàn tất"
                  : status === "importing"
                    ? "Đang chạy"
                    : "—"
            }
            sub={
              models.length > 0 && errorCount === 0
                ? `${doneCount} bảng OK`
                : undefined
            }
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border/60 bg-background/70">
          <div className="hidden grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 border-b border-border/60 bg-muted/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Bảng</span>
            <span className="text-right">Bản ghi</span>
            <span>Trạng thái</span>
            <span className="text-right">Thời gian</span>
          </div>
          <ul className="max-h-64 divide-y divide-border/50 overflow-y-auto">
            {models.map((model) => {
              const displayError = model.error
                ? formatImportErrorMessage(model.error)
                : undefined
              const rowDetails = model.rowErrorDetails ?? []
              return (
                <li
                  key={model.name}
                  className="px-3 py-2.5 transition-colors hover:bg-muted/20"
                >
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center sm:gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-medium text-foreground">
                        {model.name}
                      </p>
                      {model.detail ? (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {model.detail}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xs tabular-nums text-muted-foreground sm:text-right">
                      {model.records.toLocaleString("vi-VN")}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ModelStatusBadge status={model.status} />
                      {model.status === "error" ? (
                        <CopyTextButton
                          text={buildModelImportCopyText(model)}
                          label="Copy lỗi"
                          copiedLabel="OK"
                          variant="ghost"
                          className="h-7 px-2 text-[10px]"
                          onCopied={() =>
                            toast.success(`Đã copy lỗi bảng ${model.name}.`)
                          }
                        />
                      ) : null}
                    </div>
                    <p
                      className="text-[10px] text-muted-foreground sm:text-right"
                      title={
                        model.timing
                          ? formatModelTimingSummary(model.timing)
                          : undefined
                      }
                    >
                      {model.timing && model.timing.wallMs > 0
                        ? formatModelTimingSummary(model.timing)
                        : "—"}
                    </p>
                  </div>
                  {displayError ? (
                    <p
                      className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-destructive"
                      title={model.errorTitle}
                    >
                      {displayError}
                    </p>
                  ) : null}
                  {rowDetails.length > 0 ? (
                    <ul className="mt-2 space-y-1 rounded-md border border-destructive/15 bg-destructive/[0.03] px-2.5 py-2">
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
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </FieldSectionValue>
  )
}
