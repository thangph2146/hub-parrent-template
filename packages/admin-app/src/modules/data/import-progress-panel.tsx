"use client"

import { useEffect, useState } from "react"
import { Button } from "@ui/components/button"
import { Badge } from "@ui/components/badge"
import { FieldCopyButton, FieldSectionValue } from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import {
  CheckCircle2,
  Database,
  Loader2,
  XCircle,
} from "lucide-react"
import {
  buildImportProgressReportFromState,
  formatImportErrorMessage,
} from "./_component/import-error-message"
import {
  formatImportDuration,
  resolveWallClockElapsedMs,
} from "./_component/import-timing"
import { ImportProgressModelsTable } from "./_component/import-progress-models-table"
import type { ImportProgressState } from "./_component/import-progress-types"

export type {
  ImportModelProgress,
  ImportModelStatus,
  ImportProgressState,
  ImportSourceFormat,
} from "./_component/import-progress-types"
export { withSkippedRemaining } from "./_component/import-progress-types"

const PANEL_STATUS_CLASS: Record<
  ImportProgressState["status"],
  string
> = {
  idle: "border-border/70 bg-muted/20",
  importing: "border-primary/25 bg-primary/[0.04] shadow-sm shadow-primary/5",
  done: "border-emerald-500/30 bg-emerald-500/[0.05] shadow-sm shadow-emerald-500/5",
  error: "border-destructive/30 bg-destructive/[0.04] shadow-sm shadow-destructive/5",
}

function resolveDetailMessage(
  status: ImportProgressState["status"],
  message?: string
): string | undefined {
  if (!message?.trim()) return undefined
  const display = formatImportErrorMessage(message)
  if (status === "done") {
    const slowest = display.match(/chậm nhất:\s*[^.]+\([^)]+\)/i)?.[0]?.trim()
    return slowest ?? undefined
  }
  return display
}

function resolveImportProgressPercent(
  progress: Pick<
    ImportProgressState,
    "cumulativeImported" | "totalRecords" | "total" | "currentIndex" | "status"
  >
): number {
  const { cumulativeImported, totalRecords, total, currentIndex, status } =
    progress
  const importing = status === "importing"

  if (totalRecords > 0) {
    const ratio = cumulativeImported / totalRecords
    if (importing && cumulativeImported < totalRecords) {
      return Math.min(99, Math.floor(ratio * 100))
    }
    return Math.min(100, Math.round(ratio * 100))
  }

  if (total > 0) {
    const completedJobs =
      importing ? currentIndex : Math.min(currentIndex + 1, total)
    const ratio = completedJobs / total
    if (importing && completedJobs < total) {
      return Math.min(99, Math.floor(ratio * 100))
    }
    return Math.min(100, Math.round(ratio * 100))
  }

  return 0
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
    importStartedAtMs,
    sourceFileName,
    sourceFormat,
  } = progress

  const [, setElapsedTick] = useState(0)
  useEffect(() => {
    if (status !== "importing") return
    const id = setInterval(() => setElapsedTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [status])

  const displayDurationMs =
    status === "importing"
      ? resolveWallClockElapsedMs(importStartedAtMs) ?? totalDurationMs
      : totalDurationMs

  const doneCount = models.filter((m) => m.status === "done").length
  const errorCount = models.filter((m) => m.status === "error").length
  const chunkMode = total > models.length
  const percent = resolveImportProgressPercent({
    cumulativeImported,
    totalRecords,
    total,
    currentIndex,
    status,
  })

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
      ? "border-primary/25 bg-primary/10 text-primary"
      : status === "done"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
        : status === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border/70 bg-muted/50 text-muted-foreground"

  const canReset = status === "done" || status === "error"
  const detailMessage = resolveDetailMessage(status, message)
  const copyReportText = buildImportProgressReportFromState(progress)
  const canCopyReport = active && status !== "idle"

  const completedHttpJobs =
    status === "importing"
      ? currentIndex
      : Math.min(currentIndex + 1, total)

  const batchLabel = chunkMode
    ? `${completedHttpJobs}/${total} lô`
    : models.length > 0
      ? `${doneCount}/${models.length} bảng`
      : null

  const durationLabel =
    displayDurationMs != null && displayDurationMs > 0
      ? formatImportDuration(displayDurationMs)
      : status === "importing"
        ? "…"
        : null

  const recordsLabel =
    totalRecords > 0
      ? `${cumulativeImported.toLocaleString("vi-VN")}/${totalRecords.toLocaleString("vi-VN")} bản ghi`
      : `${cumulativeImported.toLocaleString("vi-VN")} bản ghi`

  const summaryLine = [
    recordsLabel,
    batchLabel,
    durationLabel,
    errorCount > 0 ? `${errorCount} lỗi` : status === "done" ? "Hoàn tất" : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const sourceLabel = sourceFileName
    ? `${sourceFileName}${sourceFormat ? ` · ${sourceFormat.toUpperCase()}` : ""}`
    : null

  return (
    <div className="space-y-3" data-import-progress-panel>
      <FieldSectionValue
        copyable={false}
        className={cn("overflow-hidden p-0", PANEL_STATUS_CLASS[status])}
      >
        <div className="space-y-2.5 p-2.5 sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border",
                  headerIconClass
                )}
              >
                <HeaderIcon
                  className={cn(
                    "size-4",
                    status === "importing" && "animate-spin"
                  )}
                  aria-hidden
                />
              </span>
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {headerLabel}
                  </p>
                  {errorCount > 0 ? (
                    <Badge
                      variant="destructive"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {errorCount} lỗi
                    </Badge>
                  ) : null}
                </div>
                {sourceLabel ? (
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={sourceLabel}
                  >
                    {sourceLabel}
                  </p>
                ) : null}
                {summaryLine ? (
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {summaryLine}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
              {canCopyReport ? (
                <FieldCopyButton
                  text={copyReportText}
                  successMessage="Đã copy báo cáo"
                  className="h-8"
                />
              ) : null}
              {canReset ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 whitespace-nowrap px-2.5 text-xs"
                  onClick={onReset}
                >
                  Đóng
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/50"
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
              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {percent}%
              </span>
            </div>
            {detailMessage ? (
              <p
                className={cn(
                  "text-xs leading-snug",
                  status === "error"
                    ? "font-medium text-destructive"
                    : "text-muted-foreground"
                )}
                title={message !== detailMessage ? message : undefined}
              >
                {detailMessage}
              </p>
            ) : null}
          </div>
        </div>
      </FieldSectionValue>

      {models.length > 0 ? <ImportProgressModelsTable models={models} /> : null}
    </div>
  )
}
