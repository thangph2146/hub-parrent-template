"use client"

import { useMemo, useState } from "react"
import type { ColumnDef, ColumnFiltersState, Row } from "@tanstack/react-table"
import { Copy } from "lucide-react"
import { toast } from "@ui/components/sonner"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { AdminDataTable } from "@ui/components/data-table"
import { cn } from "@ui/lib/utils"
import {
  buildModelImportCopyText,
  formatImportErrorMessage,
} from "./import-error-message"
import {
  formatInProgressModelTiming,
  formatModelTimingSummary,
} from "./import-timing"
import type {
  ImportModelProgress,
  ImportModelStatus,
} from "./import-progress-types"

const STATUS_META: Record<
  ImportModelStatus,
  {
    label: string
    badgeClass: string
  }
> = {
  pending: {
    label: "Chờ",
    badgeClass: "border-border/70 bg-muted/50 text-muted-foreground",
  },
  importing: {
    label: "Đang import",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
  done: {
    label: "Xong",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  error: {
    label: "Lỗi",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  skipped: {
    label: "Bỏ qua",
    badgeClass: "border-border/70 bg-muted/40 text-muted-foreground",
  },
}

function ModelStatusBadge({ status }: { status: ImportModelStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-0.5 text-xs font-medium", meta.badgeClass)}
    >
      {meta.label}
    </Badge>
  )
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

function getModelTimingText(model: ImportModelProgress): string | null {
  if (!model.timing) return null
  if (model.status === "importing" && model.timing.startedAtMs != null) {
    return formatInProgressModelTiming(model.timing)
  }
  if (model.timing.wallMs > 0) {
    return formatModelTimingSummary(model.timing)
  }
  return null
}

function renderModelExpandedRow(row: Row<ImportModelProgress>) {
  const model = row.original
  const displayError = model.error
    ? formatImportErrorMessage(model.error)
    : undefined
  const rowDetails = model.rowErrorDetails ?? []

  if (!displayError && rowDetails.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 px-4 py-3 text-sm">
      {displayError ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 leading-snug text-destructive"
          title={model.errorTitle}
        >
          {displayError}
        </p>
      ) : null}
      {rowDetails.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-destructive/15 bg-destructive/[0.03] px-3 py-2">
          {rowDetails.map((line, index) => (
            <li
              key={`${model.name}-err-${index}`}
              className="leading-snug break-words text-destructive/90"
            >
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      {model.status === "error" ? (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => {
              void copyTextToClipboard(buildModelImportCopyText(model)).then(
                (ok) => {
                  if (ok) {
                    toast.success(
                      `Đã copy lỗi bảng ${model.tableName ?? model.name}.`
                    )
                  } else {
                    toast.error("Không sao chép được")
                  }
                }
              )
            }}
          >
            <Copy className="size-3.5" aria-hidden />
            Copy lỗi bảng
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function getImportModelColumns(): ColumnDef<ImportModelProgress>[] {
  return [
    {
      accessorKey: "tableName",
      header: "Bảng DB",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const model = row.original
        const label = model.tableName ?? model.name
        return (
          <div className="min-w-0">
            <span className="font-mono text-sm font-medium" title={label}>
              {label}
            </span>
            {model.detail ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {model.detail}
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Model export",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true, defaultHidden: true },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "records",
      header: "Bản ghi",
      enableColumnFilter: false,
      size: 100,
      meta: {
        disableColumnFilter: true,
        className: "w-[100px] min-w-[100px] max-w-[120px]",
      },
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          {row.original.records.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => <ModelStatusBadge status={row.original.status} />,
    },
    {
      id: "timing",
      header: "Thời gian",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const timingText = getModelTimingText(row.original)
        return (
          <span
            className="text-xs text-muted-foreground"
            title={timingText ?? undefined}
          >
            {timingText ?? "—"}
          </span>
        )
      },
    },
  ]
}

export function ImportProgressModelsTable({
  models,
}: {
  models: ImportModelProgress[]
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const columns = useMemo(() => getImportModelColumns(), [])

  const hasExpandableErrors = useMemo(
    () =>
      models.some(
        (model) =>
          model.status === "error" &&
          Boolean(model.error || (model.rowErrorDetails?.length ?? 0) > 0)
      ),
    [models]
  )

  if (models.length === 0) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground">
        Chưa có bảng import.
      </p>
    )
  }

  return (
    <AdminDataTable<ImportModelProgress>
      tableScope="import-progress-models"
      data={models}
      columns={columns}
      getRowId={(row) => row.name}
      emptyLabel="Chưa có bảng import."
      manualFiltering
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      globalFilterPlaceholder="Tìm theo tên bảng, model, trạng thái…"
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      showIndexColumn
      showColumnFilters={false}
      defaultExpandedAll={false}
      {...(hasExpandableErrors
        ? {
            renderExpandedRow: renderModelExpandedRow,
            getRowCanExpand: (row: Row<ImportModelProgress>) =>
              row.original.status === "error" &&
              Boolean(
                row.original.error ||
                  (row.original.rowErrorDetails?.length ?? 0) > 0
              ),
            footer: (
              <p className="text-xs text-muted-foreground">
                Mở rộng hàng có lỗi để xem chi tiết và copy báo cáo theo bảng.
              </p>
            ),
          }
        : {})}
    />
  )
}
