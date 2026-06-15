"use client"

import {
  CheckSquare,
  ChevronDown,
  Download,
  FilterX,
  ListFilter,
  Search,
  X,
} from "lucide-react"
import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import type { ColumnFiltersState, Header } from "@tanstack/react-table"
import { Button } from "../button"
import { Input } from "../input"
import { TreeMultiSelectPicker } from "../pickers"
import { cn } from "../../lib/utils"
import type { AdminDataTableBulkAction } from "./data-table"
import { DataTableToolbarField } from "./data-table-toolbar-field"

const FILTER_GRID_CLASS =
  "grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"

function ToolbarActionCluster({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1">{children}</div>
  )
}

function ToolbarButtonContent({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="leading-none">{label}</span>
    </span>
  )
}

function ToolbarLabeledButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      className={cn(
        "h-8 min-h-8 gap-0 rounded-md px-2.5 text-xs leading-none",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

type DataTableToolbarProps<TData> = {
  globalFilterControlId: string
  showGlobalFilter: boolean
  globalFilterPlaceholder: string
  globalFilterLabel?: string
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  showClearFiltersButton: boolean
  hasActiveFilters: boolean
  onClearFilters: () => void
  xlsxExportEnabled: boolean
  exportDisabled: boolean
  onXlsxExport: () => void
  filterToolbarExtra?: ReactNode
  showBulkBar: boolean
  selectedCount: number
  bulkActions: AdminDataTableBulkAction<TData>[]
  bulkToolbarExtra?: ReactNode
  onClearRowSelection?: () => void
  selectedRows: TData[]
  runningBulkActionId: string | null
  onRunBulkAction: (action: AdminDataTableBulkAction<TData>) => void
  filterableHeadersCount: number
  visibleFilterableHeaders: Header<TData, unknown>[]
  renderColumnFilter: (header: Header<TData, unknown>) => ReactNode
  columnFilterToolbarLabel: (header: Header<TData, unknown>) => string
  showFilterColumnPicker: boolean
  filterColumnOptions: Array<{ value: string; label: string }>
  filterColumnVisibilityValue: string[]
  onFilterColumnVisibilityChange: (value: unknown) => void
  hideableTableColumnOptions: Array<{ value: string; label: string }>
  visibleTableColumnIds: string[]
  onTableColumnVisibilityChange: (value: unknown) => void
  columnFilters: ColumnFiltersState
}

export function DataTableToolbar<TData>({
  globalFilterControlId,
  showGlobalFilter,
  globalFilterPlaceholder,
  globalFilterLabel,
  globalFilter,
  onGlobalFilterChange,
  showClearFiltersButton,
  hasActiveFilters,
  onClearFilters,
  xlsxExportEnabled,
  exportDisabled,
  onXlsxExport,
  filterToolbarExtra,
  showBulkBar,
  selectedCount,
  bulkActions,
  bulkToolbarExtra,
  onClearRowSelection,
  selectedRows,
  runningBulkActionId,
  onRunBulkAction,
  filterableHeadersCount,
  visibleFilterableHeaders,
  renderColumnFilter,
  columnFilterToolbarLabel,
  showFilterColumnPicker,
  filterColumnOptions,
  filterColumnVisibilityValue,
  onFilterColumnVisibilityChange,
  hideableTableColumnOptions,
  visibleTableColumnIds,
  onTableColumnVisibilityChange,
  columnFilters,
}: DataTableToolbarProps<TData>) {
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const activeColumnFilterCount = columnFilters.length
  const hasBulkSelection = showBulkBar && selectedCount > 0

  useEffect(() => {
    if (hasActiveFilters || activeColumnFilterCount > 0) {
      setFiltersExpanded(true)
    }
  }, [hasActiveFilters, activeColumnFilterCount])

  const showToolbar =
    showGlobalFilter ||
    filterToolbarExtra ||
    xlsxExportEnabled ||
    showClearFiltersButton ||
    hasBulkSelection ||
    filterableHeadersCount > 0 ||
    hideableTableColumnOptions.length > 0

  if (!showToolbar) return null

  const showTopActions =
    showClearFiltersButton ||
    xlsxExportEnabled ||
    filterToolbarExtra ||
    hideableTableColumnOptions.length > 0

  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
      {showGlobalFilter || showTopActions ? (
        <div className="flex flex-wrap items-end gap-3 px-2.5 py-2">
          {showGlobalFilter ? (
            <DataTableToolbarField
              label={globalFilterLabel ?? "Tìm kiếm"}
              htmlFor={globalFilterControlId}
              className="min-w-[min(100%,12rem)] flex-1"
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id={globalFilterControlId}
                  placeholder={globalFilterPlaceholder}
                  value={globalFilter}
                  onChange={(e) => onGlobalFilterChange(e.target.value)}
                  className="h-8 w-full rounded-md border-border/80 bg-background pl-7 text-sm shadow-none"
                />
              </div>
            </DataTableToolbarField>
          ) : null}

          {filterToolbarExtra}

          {showTopActions ? (
            <div className="flex flex-wrap items-end gap-1.5 sm:ml-auto">
              {showClearFiltersButton || xlsxExportEnabled ? (
                <ToolbarActionCluster>
                  {showClearFiltersButton ? (
                    <ToolbarLabeledButton
                      variant={"destructive"}
                      onClick={onClearFilters}
                      title="Xóa tìm nhanh và toàn bộ bộ lọc theo cột"
                    >
                      <ToolbarButtonContent
                        icon={FilterX}
                        label="Xóa bộ lọc"
                      />
                    </ToolbarLabeledButton>
                  ) : null}
                  {xlsxExportEnabled ? (
                    <ToolbarLabeledButton
                      variant="success"
                      disabled={exportDisabled}
                      onClick={onXlsxExport}
                      title="Tải Excel theo cột đang hiển thị"
                    >
                      <ToolbarButtonContent
                        icon={Download}
                        label="Xuất Excel"
                      />
                    </ToolbarLabeledButton>
                  ) : null}
                </ToolbarActionCluster>
              ) : null}

              {hideableTableColumnOptions.length > 0 ? (
                <DataTableToolbarField
                  label="Hiện cột"
                  className="w-[9.5rem] sm:w-[9.5rem]"
                >
                  <TreeMultiSelectPicker
                    value={visibleTableColumnIds}
                    onChange={onTableColumnVisibilityChange}
                    options={hideableTableColumnOptions}
                    placeholder="Chọn cột"
                    showBulkActions
                    size="sm"
                    className="w-full"
                  />
                </DataTableToolbarField>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasBulkSelection ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-primary/20 bg-gradient-to-r from-primary/[0.07] via-primary/[0.04] to-transparent px-3 py-2">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/90 px-2.5 py-1 shadow-sm">
            <CheckSquare
              className="size-3.5 shrink-0 text-primary"
              aria-hidden
            />
            <span className="text-xs font-medium tabular-nums text-primary">
              {selectedCount}
            </span>
            <span className="text-xs text-muted-foreground">đã chọn</span>
            {onClearRowSelection ? (
              <button
                type="button"
                className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={onClearRowSelection}
                aria-label="Bỏ chọn tất cả"
                title="Bỏ chọn"
              >
                <X className="size-3" aria-hidden />
              </button>
            ) : null}
          </div>
          {bulkToolbarExtra ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {bulkToolbarExtra}
            </div>
          ) : null}
          {bulkActions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {bulkActions.map((action) => {
                const requiresSelection = action.requiresSelection ?? true
                const disabledBySelection =
                  requiresSelection && selectedCount === 0
                const disabledByAction =
                  action.disabled?.(selectedRows) ?? false
                const isRunning = runningBulkActionId === action.id
                return (
                  <Button
                    key={action.id}
                    type="button"
                    size="sm"
                    variant={action.variant ?? "outline"}
                    className={cn(
                      "h-7 gap-1.5 rounded-md px-2.5 text-xs shadow-sm",
                      action.className
                    )}
                    disabled={
                      isRunning ||
                      runningBulkActionId != null ||
                      disabledBySelection ||
                      disabledByAction
                    }
                    onClick={() => onRunBulkAction(action)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {filterableHeadersCount > 0 ? (
        <div className="border-t border-border/60">
          <div className="flex items-center gap-2 px-2.5 py-1.5">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md py-0.5 text-left transition-colors hover:text-foreground"
              onClick={() => setFiltersExpanded((open) => !open)}
              aria-expanded={filtersExpanded}
            >
              <ListFilter
                className="size-3.5 shrink-0 text-primary/80"
                aria-hidden
              />
              <span className="text-xs font-medium text-foreground">
                Lọc cột
              </span>
              {activeColumnFilterCount > 0 ? (
                <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary tabular-nums">
                  {activeColumnFilterCount}
                </span>
              ) : null}
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform",
                  filtersExpanded && "rotate-180"
                )}
                aria-hidden
              />
            </button>

            {showFilterColumnPicker ? (
              <TreeMultiSelectPicker
                value={filterColumnVisibilityValue}
                onChange={onFilterColumnVisibilityChange}
                options={filterColumnOptions}
                placeholder="Cột lọc"
                showBulkActions
                size="sm"
                className="w-[9.5rem] shrink-0 sm:w-[9.5rem]"
              />
            ) : null}
          </div>

          {filtersExpanded ? (
            <div className="border-t border-border/50 bg-muted/5 px-2.5 py-2">
              {visibleFilterableHeaders.length > 0 ? (
                <div className={FILTER_GRID_CLASS}>
                  {visibleFilterableHeaders.map((header) => {
                    const filterControlId = `admin-col-filter-ctl-${header.id}`
                    return (
                      <label
                        key={header.id}
                        htmlFor={filterControlId}
                        className="flex min-w-0 flex-col gap-1"
                      >
                        <span
                          className="truncate text-[11px] font-medium text-muted-foreground"
                          title={columnFilterToolbarLabel(header)}
                        >
                          {columnFilterToolbarLabel(header)}
                        </span>
                        {renderColumnFilter(header)}
                      </label>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Chọn ít nhất một cột ở &quot;Cột lọc&quot;.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function DataTablePanelLegend({
  icon: Icon,
  children,
}: {
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/10 px-3 py-1.5">
      {Icon ? (
        <Icon className="size-3.5 shrink-0 text-primary/80" aria-hidden />
      ) : null}
      <span className="text-xs font-semibold text-foreground">{children}</span>
    </div>
  )
}
