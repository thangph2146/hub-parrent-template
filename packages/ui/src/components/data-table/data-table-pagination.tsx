"use client"

import { useEffect, useId, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "../button"
import { Input } from "../input"
import { cn } from "../../lib/utils"

/** Mức page size dùng chung (API thường giới hạn ≤ 200). */
export const ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS = [
  10, 15, 20, 25, 50, 100,
] as const

export const ADMIN_DATA_TABLE_MIN_PAGE_SIZE = 1
export const ADMIN_DATA_TABLE_MAX_PAGE_SIZE = 200

export type AdminDataTableServerPaginationConfig = {
  mode?: "server"
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: readonly number[]
  maxPageSize?: number
  emptySummary?: string
  itemLabel?: string
  isLoading?: boolean
}

export type AdminDataTableClientPaginationConfig = {
  mode: "client"
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: readonly number[]
  maxPageSize?: number
  emptySummary?: string
  itemLabel?: string
  isLoading?: boolean
}

export type AdminDataTablePaginationConfig =
  | AdminDataTableServerPaginationConfig
  | AdminDataTableClientPaginationConfig

export type AdminDataTablePaginationProps = AdminDataTablePaginationConfig

function clampPageSize(
  value: number,
  maxPageSize: number,
): number {
  if (!Number.isFinite(value)) return ADMIN_DATA_TABLE_MIN_PAGE_SIZE
  return Math.min(
    maxPageSize,
    Math.max(ADMIN_DATA_TABLE_MIN_PAGE_SIZE, Math.floor(value)),
  )
}

function buildVisiblePages(
  page: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return totalPages === 1 ? [1] : []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort(
    (a, b) => a - b,
  )

  const result: Array<number | "ellipsis"> = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis")
    result.push(p)
    prev = p
  }
  return result
}

export function AdminDataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  maxPageSize = ADMIN_DATA_TABLE_MAX_PAGE_SIZE,
  emptySummary = "Không có dữ liệu",
  itemLabel,
  isLoading = false,
}: AdminDataTablePaginationProps) {
  const pageSizeListId = useId()
  const disabled = isLoading || total === 0

  const [draftPageSize, setDraftPageSize] = useState(String(pageSize))

  useEffect(() => {
    setDraftPageSize(String(pageSize))
  }, [pageSize])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  const summary =
    total === 0
      ? emptySummary
      : itemLabel
        ? `Hiển thị ${from}–${to} / ${total} ${itemLabel}`
        : `Hiển thị ${from}–${to} / ${total}`

  const visiblePages = useMemo(
    () => buildVisiblePages(safePage, totalPages),
    [safePage, totalPages],
  )

  const commitPageSize = () => {
    const parsed = Number.parseInt(draftPageSize.trim(), 10)
    const next = clampPageSize(parsed, maxPageSize)
    setDraftPageSize(String(next))
    if (next !== pageSize) onPageSizeChange(next)
  }

  return (
    <>
      <p className="min-w-0 text-sm text-muted-foreground">{summary}</p>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2 py-1">
          <label
            htmlFor={pageSizeListId}
            className="text-xs font-medium whitespace-nowrap text-muted-foreground"
          >
            Mỗi trang
          </label>
          <Input
            id={pageSizeListId}
            type="number"
            inputMode="numeric"
            min={ADMIN_DATA_TABLE_MIN_PAGE_SIZE}
            max={maxPageSize}
            disabled={disabled}
            value={draftPageSize}
            onChange={(e) => setDraftPageSize(e.target.value)}
            onBlur={commitPageSize}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commitPageSize()
              }
            }}
            list={`${pageSizeListId}-options`}
            aria-label="Số dòng mỗi trang"
            title={`Nhập từ ${ADMIN_DATA_TABLE_MIN_PAGE_SIZE} đến ${maxPageSize}, Enter để áp dụng`}
          />
        </div>

        <nav
          className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-background p-0.5"
          aria-label="Phân trang bảng"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage <= 1 || disabled}
            onClick={() => onPageChange(1)}
            aria-label="Trang đầu"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage <= 1 || disabled}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            aria-label="Trang trước"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="hidden items-center gap-0.5 px-0.5 sm:flex">
            {visiblePages.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center text-sm text-muted-foreground"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={item === safePage ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-8 shrink-0 rounded-md text-sm tabular-nums",
                    item === safePage && "font-semibold",
                  )}
                  disabled={disabled}
                  onClick={() => onPageChange(item)}
                  aria-label={`Trang ${item}`}
                  aria-current={item === safePage ? "page" : undefined}
                >
                  {item}
                </Button>
              ),
            )}
          </div>

          <span className="px-2 text-xs tabular-nums text-muted-foreground sm:hidden">
            {safePage}/{totalPages}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage >= totalPages || disabled}
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            aria-label="Trang sau"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage >= totalPages || disabled}
            onClick={() => onPageChange(totalPages)}
            aria-label="Trang cuối"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </nav>
      </div>
    </>
  )
}
