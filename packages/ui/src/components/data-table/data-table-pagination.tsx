"use client"

import { useEffect, useId, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Rows3,
} from "lucide-react"
import { Button } from "../button"
import { Input } from "../input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"
import { cn } from "../../lib/utils"

/** Mức page size dùng chung (API admin cho phép tới 5000). */
export const ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS = [
  10, 15, 20, 25, 50, 100, 500, 1000,
] as const

export const ADMIN_DATA_TABLE_MIN_PAGE_SIZE = 1
export const ADMIN_DATA_TABLE_MAX_PAGE_SIZE = 5000

const CUSTOM_PAGE_SIZE_VALUE = "__custom__"

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
  /** Số dòng thực tế đang hiển thị (thường = `data.length` từ server). */
  currentPageRowCount?: number
  /** Trang / limit server trả về sau chuẩn hóa — đồng bộ UI khi khác state client. */
  appliedPage?: number
  appliedPageSize?: number
  /** Nút "Tất cả" — gọi khi user muốn tải/hiển thị đủ bản ghi (server fetch). */
  onShowAllRows?: () => void
  showAllPageSizeOption?: boolean
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
  currentPageRowCount?: number
  appliedPage?: number
  appliedPageSize?: number
  /** Hiện nút đặt page size = tổng bản ghi đã lọc (client). @default true */
  showAllPageSizeOption?: boolean
  onShowAllRows?: () => void
}

export type AdminDataTablePaginationConfig =
  | AdminDataTableServerPaginationConfig
  | AdminDataTableClientPaginationConfig

export type AdminDataTablePaginationProps = AdminDataTablePaginationConfig

function clampPageSize(value: number, maxPageSize: number): number {
  if (!Number.isFinite(value)) return ADMIN_DATA_TABLE_MIN_PAGE_SIZE
  return Math.min(
    maxPageSize,
    Math.max(ADMIN_DATA_TABLE_MIN_PAGE_SIZE, Math.floor(value))
  )
}

function buildVisiblePages(
  page: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return totalPages === 1 ? [1] : []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const result: Array<number | "ellipsis"> = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis")
    result.push(p)
    prev = p
  }
  return result
}

function resolvePageSizeOptions(
  pageSize: number,
  pageSizeOptions?: readonly number[]
): number[] {
  const base = [...(pageSizeOptions ?? ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS)]
  const merged = new Set(base)
  merged.add(pageSize)
  return [...merged].sort((a, b) => a - b)
}

export function AdminDataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  maxPageSize = ADMIN_DATA_TABLE_MAX_PAGE_SIZE,
  emptySummary = "Không có dữ liệu",
  itemLabel,
  isLoading = false,
  currentPageRowCount,
  appliedPage,
  appliedPageSize,
  showAllPageSizeOption = true,
  onShowAllRows,
}: AdminDataTablePaginationProps) {
  const pageSizeSelectId = useId()
  const pageJumpId = useId()
  const empty = !isLoading && total === 0
  const navDisabled = isLoading || empty

  const displayPageSize = appliedPageSize ?? pageSize
  const displayPage = appliedPage ?? page

  const resolvedPageSizeOptions = useMemo(
    () => resolvePageSizeOptions(displayPageSize, pageSizeOptions),
    [displayPageSize, pageSizeOptions]
  )

  const pageSizeInPresets = resolvedPageSizeOptions.includes(displayPageSize)

  const [customPageSizeMode, setCustomPageSizeMode] = useState(
    () => !pageSizeInPresets
  )
  const [draftPageSize, setDraftPageSize] = useState(String(displayPageSize))
  const [draftPage, setDraftPage] = useState(String(displayPage))

  useEffect(() => {
    setDraftPageSize(String(displayPageSize))
    if (pageSizeInPresets) setCustomPageSizeMode(false)
  }, [displayPageSize, pageSizeInPresets])

  useEffect(() => {
    setDraftPage(String(displayPage))
  }, [displayPage])

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, displayPageSize)))
  const safePage = Math.min(Math.max(1, displayPage), totalPages)

  useEffect(() => {
    if (isLoading || total <= 0) return
    if (appliedPage != null && appliedPage !== page) {
      onPageChange(appliedPage)
      return
    }
    if (page > totalPages) {
      onPageChange(totalPages)
    }
  }, [
    appliedPage,
    isLoading,
    onPageChange,
    page,
    total,
    totalPages,
  ])

  useEffect(() => {
    if (isLoading) return
    if (appliedPageSize != null && appliedPageSize !== pageSize) {
      onPageSizeChange(appliedPageSize)
    }
  }, [appliedPageSize, isLoading, onPageSizeChange, pageSize])

  const from =
    empty || total <= 0 ? 0 : (safePage - 1) * displayPageSize + 1
  const rowsOnPage =
    currentPageRowCount ??
    (empty || total <= 0
      ? 0
      : Math.min(displayPageSize, Math.max(0, total - from + 1)))
  const to =
    empty || total <= 0 || rowsOnPage <= 0
      ? 0
      : Math.min(from + rowsOnPage - 1, total)
  const showingAll =
    !empty && total > 0 && displayPageSize >= total && rowsOnPage >= total

  const summary = useMemo(() => {
    if (isLoading && empty) return "Đang tải…"
    if (empty) return emptySummary
    if (showingAll) {
      return itemLabel
        ? `Hiển thị tất cả ${total} ${itemLabel}`
        : `Hiển thị tất cả ${total}`
    }
    return itemLabel
      ? `Hiển thị ${from}–${to} / ${total} ${itemLabel}`
      : `Hiển thị ${from}–${to} / ${total}`
  }, [
    empty,
    emptySummary,
    from,
    isLoading,
    itemLabel,
    showingAll,
    to,
    total,
  ])

  const visiblePages = useMemo(
    () => buildVisiblePages(safePage, totalPages),
    [safePage, totalPages]
  )

  const commitPageSize = () => {
    const parsed = Number.parseInt(draftPageSize.trim(), 10)
    const next = clampPageSize(parsed, maxPageSize)
    setDraftPageSize(String(next))
    if (next !== pageSize) onPageSizeChange(next)
  }

  const commitPageJump = () => {
    const parsed = Number.parseInt(draftPage.trim(), 10)
    if (!Number.isFinite(parsed)) {
      setDraftPage(String(safePage))
      return
    }
    const next = Math.min(totalPages, Math.max(1, parsed))
    setDraftPage(String(next))
    if (next !== safePage) onPageChange(next)
  }

  const showAllRows = () => {
    if (onShowAllRows) {
      onShowAllRows()
      return
    }
    if (total <= 0) return
    const next = clampPageSize(total, maxPageSize)
    setDraftPageSize(String(next))
    setCustomPageSizeMode(false)
    if (next !== pageSize) onPageSizeChange(next)
  }

  const canShowAll =
    total > 0 &&
    displayPageSize < total &&
    (onShowAllRows != null ||
      (showAllPageSizeOption && total <= maxPageSize))

  const selectValue = customPageSizeMode
    ? CUSTOM_PAGE_SIZE_VALUE
    : String(displayPageSize)

  const showPageJump = totalPages > 7

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-busy={isLoading}
    >
      <p
        className="min-w-0 text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2
              className="size-3.5 shrink-0 animate-spin text-muted-foreground/80"
              aria-hidden
            />
            <span>{summary}</span>
          </span>
        ) : (
          <span>
            {empty ? (
              summary
            ) : (
              <>
                {showingAll ? (
                  <>
                    Hiển thị tất cả{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {total}
                    </span>
                    {itemLabel ? ` ${itemLabel}` : null}
                  </>
                ) : (
                  <>
                    Hiển thị{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {from}–{to}
                    </span>{" "}
                    /{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {total}
                    </span>
                    {itemLabel ? ` ${itemLabel}` : null}
                  </>
                )}
              </>
            )}
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        <div
          className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background p-1 shadow-xs"
          role="group"
          aria-label="Số dòng mỗi trang"
        >
          <label
            htmlFor={
              customPageSizeMode ? `${pageSizeSelectId}-custom` : pageSizeSelectId
            }
            className="inline-flex items-center gap-1.5 ps-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground"
          >
            <Rows3 className="size-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="hidden min-[420px]:inline">Mỗi trang</span>
          </label>

          {customPageSizeMode ? (
            <Input
              id={`${pageSizeSelectId}-custom`}
              type="number"
              inputMode="numeric"
              min={ADMIN_DATA_TABLE_MIN_PAGE_SIZE}
              max={maxPageSize}
              disabled={navDisabled}
              value={draftPageSize}
              onChange={(e) => setDraftPageSize(e.target.value)}
              onBlur={commitPageSize}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  commitPageSize()
                }
                if (e.key === "Escape") {
                  setDraftPageSize(String(displayPageSize))
                  setCustomPageSizeMode(!pageSizeInPresets)
                }
              }}
              aria-label="Nhập số dòng mỗi trang"
              title={`Nhập từ ${ADMIN_DATA_TABLE_MIN_PAGE_SIZE} đến ${maxPageSize}, Enter để áp dụng`}
              className="h-8 w-[4.5rem] border-0 bg-transparent px-2 shadow-none focus-visible:ring-1"
              autoFocus
            />
          ) : (
            <Select
              value={selectValue}
              onValueChange={(value) => {
                if (value === CUSTOM_PAGE_SIZE_VALUE) {
                  setCustomPageSizeMode(true)
                  return
                }
                const next = clampPageSize(Number(value), maxPageSize)
                setDraftPageSize(String(next))
                if (next !== displayPageSize) onPageSizeChange(next)
              }}
              disabled={navDisabled}
            >
              <SelectTrigger
                id={pageSizeSelectId}
                size="sm"
                className="h-8 min-w-[4.5rem] border-0 bg-transparent shadow-none focus-visible:ring-1"
                aria-label="Chọn số dòng mỗi trang"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {resolvedPageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_PAGE_SIZE_VALUE}>
                  Tùy chỉnh…
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {canShowAll ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 shrink-0 rounded-md px-2.5 text-xs"
              disabled={navDisabled}
              onClick={showAllRows}
              title="Hiển thị toàn bộ dòng đang có trong bảng"
            >
              Tất cả
            </Button>
          ) : null}
        </div>

        <nav
          className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-background p-0.5 shadow-xs"
          aria-label="Phân trang bảng"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage <= 1 || navDisabled}
            onClick={() => onPageChange(1)}
            aria-label="Trang đầu"
            title="Trang đầu"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage <= 1 || navDisabled}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            aria-label="Trang trước"
            title="Trang trước"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="hidden items-center gap-0.5 px-0.5 min-[480px]:flex">
            {visiblePages.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center text-sm text-muted-foreground select-none"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={item === safePage ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-8 shrink-0 rounded-md text-sm tabular-nums",
                    item === safePage && "pointer-events-none shadow-sm"
                  )}
                  disabled={navDisabled}
                  onClick={() => onPageChange(item)}
                  aria-label={`Trang ${item}`}
                  aria-current={item === safePage ? "page" : undefined}
                >
                  {item}
                </Button>
              )
            )}
          </div>

          <span className="px-2 text-xs font-medium text-muted-foreground tabular-nums max-[479px]:inline min-[480px]:hidden">
            {safePage}/{totalPages}
          </span>

          {showPageJump ? (
            <div className="hidden items-center gap-1 px-1 lg:flex">
              <label htmlFor={pageJumpId} className="sr-only">
                Nhảy tới trang
              </label>
              <Input
                id={pageJumpId}
                type="number"
                inputMode="numeric"
                min={1}
                max={totalPages}
                disabled={navDisabled}
                value={draftPage}
                onChange={(e) => setDraftPage(e.target.value)}
                onBlur={commitPageJump}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commitPageJump()
                  }
                }}
                aria-label={`Trang (1–${totalPages})`}
                title="Nhập số trang, Enter để chuyển"
                className="h-8 w-12 border-0 bg-muted/40 px-1.5 text-center text-xs tabular-nums shadow-none focus-visible:ring-1"
              />
              <span className="text-xs text-muted-foreground tabular-nums">
                / {totalPages}
              </span>
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage >= totalPages || navDisabled}
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            aria-label="Trang sau"
            title="Trang sau"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md"
            disabled={safePage >= totalPages || navDisabled}
            onClick={() => onPageChange(totalPages)}
            aria-label="Trang cuối"
            title="Trang cuối"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}
