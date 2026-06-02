"use client"

// Simple debounce utility
function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const debouncedFn = (...args: TArgs) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
  debouncedFn.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
  }
  return debouncedFn
}

type ColumnMeta = {
  disableColumnFilter?: boolean
  className?: string
  filterPlaceholder?: string
  filterVariant?: string
  selectOptions?: Array<{ value: string; label: string }>
  treeOptions?: Array<{
    value: string
    label: string
    children?: Array<{ value: string; label: string }>
  }>
}

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type FilterFn,
  type Header,
  type OnChangeFn,
  type RowSelectionState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronRight, Download, Eye, EyeOff, FilterX, ListFilter } from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Button } from "../button"
import { Checkbox } from "../checkbox"
import { Input } from "../input"
import {
  DatePicker,
  DateRangePicker,
  MultiSelectPicker,
  SelectPicker,
  TreeMultiSelectPicker,
  TreePicker,
} from "../pickers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table"
import { cn } from "../../lib/utils"
import "./table-meta"
import { buildCsvFromColumns } from "../../lib/build-table-csv"
import { downloadXlsxFile } from "../../lib/export-xlsx"
import { Separator } from "../separator"
import { TypographyPSmall } from "../typography"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../alert-dialog"

export type AdminDataTableBulkAction<TData> = {
  id: string
  label: string
  onAction: (selectedRows: TData[]) => void | Promise<void>
  icon?: ReactNode
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  className?: string
  requiresSelection?: boolean
  clearSelectionOnSuccess?: boolean
  disabled?: (selectedRows: TData[]) => boolean
  /** Hiển thị dialog xác nhận trước khi thực hiện */
  confirm?:
    | boolean
    | {
        title: string
        description?: string | ((selectedRows: TData[]) => ReactNode)
        confirmLabel?: string
        destructive?: boolean
      }
}

export type DataTableBulkAction<TData> = AdminDataTableBulkAction<TData>

export type AdminDataTableXlsxExportConfig =
  | boolean
  | {
      fileName?: string
      sheetName?: string
      title?: string
      subtitle?: string
      metadata?: Array<{
        label: string
        value: string | number | null | undefined
      }>
    }

export type AdminDataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  getSubRows?: (row: TData) => TData[] | undefined
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  isLoading?: boolean
  emptyLabel?: string
  /** Mở toàn bộ nhánh cây lúc đầu */
  defaultExpandedAll?: boolean
  getRowClassName?: (row: Row<TData>) => string | undefined
  /** Ô tìm nhanh (chuỗi do bạn cung cấp cho mỗi dòng) */
  getGlobalFilterText?: (row: TData) => string
  globalFilterPlaceholder?: string
  /** Bật khi lọc do API/server — chỉ giữ state ô lọc, không lọc lại `data` trên client */
  manualFiltering?: boolean
  /** true: lọc từ lá lên (giữ cha khi còn lá con khớp) — dùng cho cây */
  filterFromLeafRows?: boolean
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  /** Xóa tìm nhanh + lọc cột; dùng khi cần reset thêm state trang (phân trang, query API…). */
  onClearFilters?: () => void
  clearFiltersVariant?: "outline" | "destructive"
  /** Nút / nhóm tùy chọn cạnh ô tìm nhanh (vd. xuất file) */
  filterToolbarExtra?: ReactNode
  /** Phân trang / tóm tắt ngay dưới bảng */
  footer?: ReactNode
  /**
   * Hiện nút xuất Excel (dữ liệu đúng mảng `data` hiện tại — thường là một trang/lớp đã lọc).
   * Bảng cây (`getSubRows`) sẽ xuất đủ nhánh con theo thứ tự hiển thị.
   */
  xlsxExport?: AdminDataTableXlsxExportConfig
  /** Bật cột chọn dòng cho thao tác hàng loạt */
  rowSelectionEnabled?: boolean
  /** Kiểm soát dòng nào được phép tick */
  canSelectRow?: (row: Row<TData>) => boolean
  selectedRowIds?: RowSelectionState
  onSelectedRowIdsChange?: OnChangeFn<RowSelectionState>
  bulkActions?: AdminDataTableBulkAction<TData>[]
  /** localStorage key để lưu trạng thái hiển thị filter cột (mặc định: không lưu) */
  filterColumnVisibilityKey?: string
}

export type DataTableProps<TData> = AdminDataTableProps<TData>

function includesText(a: unknown, q: string): boolean {
  if (!q) return true
  const s = String(a ?? "").toLowerCase()
  return s.includes(q.toLowerCase())
}

function columnHasMinWidth(meta: ColumnMeta | undefined): boolean {
  return Boolean(meta?.className && /\bmin-w-/.test(meta.className))
}

function cellWidthClassName(meta: ColumnMeta | undefined): string {
  return cn(
    "align-middle whitespace-normal",
    !columnHasMinWidth(meta) && "max-w-[min(420px,40vw)]",
    meta?.className
  )
}

function toDateOnly(value: unknown): string | null {
  if (value == null || value === "") return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString().slice(0, 10)
  }
  if (typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
  }
  const text = String(value).trim()
  if (!text) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10)
}

function getDateRangeFilterFn<TData>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    if (filterValue == null || filterValue === "") return true
    const rowDate = toDateOnly(row.getValue(columnId))
    if (!rowDate) return false
    const [fromStr = "", toStr = ""] = String(filterValue).split(",")
    if (fromStr && rowDate < fromStr) return false
    if (toStr && rowDate > toStr) return false
    return true
  }
}

function getDateFilterFn<TData>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    if (filterValue == null || filterValue === "") return true
    return (
      toDateOnly(row.getValue(columnId)) === String(filterValue).slice(0, 10)
    )
  }
}

function applyDefaultFilterFns<TData>(
  columns: ColumnDef<TData, unknown>[]
): ColumnDef<TData, unknown>[] {
  return columns.map((column) => {
    const groupColumn = column as ColumnDef<TData, unknown> & {
      columns?: ColumnDef<TData, unknown>[]
    }
    const children = groupColumn.columns
      ? applyDefaultFilterFns(groupColumn.columns)
      : undefined
    const variant = column.meta?.filterVariant
    const filterFn =
      column.filterFn ??
      (variant === "date-range"
        ? getDateRangeFilterFn<TData>()
        : variant === "date"
          ? getDateFilterFn<TData>()
          : undefined)

    if (!children && !filterFn) return column
    return {
      ...column,
      ...(children ? { columns: children } : {}),
      ...(filterFn ? { filterFn } : {}),
    }
  })
}

function columnFilterToolbarLabel<TData>(
  header: Header<TData, unknown>
): string {
  const meta = header.column.columnDef.meta
  if (meta?.filterLabel) return meta.filterLabel
  const h = header.column.columnDef.header
  if (typeof h === "string") return h
  return header.column.id
}

export function AdminDataTable<TData>({
  data,
  columns,
  getSubRows,
  isLoading,
  emptyLabel = "Không có dữ liệu",
  defaultExpandedAll = true,
  getRowClassName,
  getGlobalFilterText,
  globalFilterPlaceholder = "Tìm trong bảng…",
  manualFiltering = false,
  filterFromLeafRows: filterFromLeafRowsProp = false,
  columnFilters: columnFiltersControlled,
  onColumnFiltersChange,
  globalFilter: globalFilterControlled,
  onGlobalFilterChange,
  onClearFilters,
  clearFiltersVariant = "outline",
  filterToolbarExtra,
  footer,
  xlsxExport,
  rowSelectionEnabled = false,
  canSelectRow,
  getRowId,
  selectedRowIds: selectedRowIdsControlled,
  onSelectedRowIdsChange,
  bulkActions = [],
  filterColumnVisibilityKey,
}: AdminDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFiltersInternal, setColumnFiltersInternal] =
    useState<ColumnFiltersState>([])
  const [globalFilterInternal, setGlobalFilterInternal] = useState("")
  const [selectedRowIdsInternal, setSelectedRowIdsInternal] =
    useState<RowSelectionState>({})
  const [runningBulkActionId, setRunningBulkActionId] = useState<string | null>(
    null
  )
  const [confirmAction, setConfirmAction] =
    useState<AdminDataTableBulkAction<TData> | null>(null)
  const columnFilters = columnFiltersControlled ?? columnFiltersInternal
  const setColumnFilters = onColumnFiltersChange ?? setColumnFiltersInternal
  const globalFilter = globalFilterControlled ?? globalFilterInternal
  const setGlobalFilter = onGlobalFilterChange ?? setGlobalFilterInternal
  const selectedRowIds = selectedRowIdsControlled ?? selectedRowIdsInternal
  const setSelectedRowIds = onSelectedRowIdsChange ?? setSelectedRowIdsInternal
  const showGlobalFilter =
    getGlobalFilterText != null || onGlobalFilterChange != null
  const xlsxExportEnabled = Boolean(xlsxExport)
  const hasBulkActions = bulkActions.length > 0
  const exportFileNameProp =
    typeof xlsxExport === "object" && xlsxExport != null
      ? xlsxExport.fileName?.trim()
      : undefined
  const exportSheetNameProp =
    typeof xlsxExport === "object" && xlsxExport != null
      ? xlsxExport.sheetName?.trim()
      : undefined
  const exportTitleProp =
    typeof xlsxExport === "object" && xlsxExport != null
      ? xlsxExport.title?.trim()
      : undefined
  const exportSubtitleProp =
    typeof xlsxExport === "object" && xlsxExport != null
      ? xlsxExport.subtitle?.trim()
      : undefined
  const exportMetadataProp =
    typeof xlsxExport === "object" && xlsxExport != null
      ? xlsxExport.metadata
      : undefined
  const resolvedXlsxFileName = useMemo(() => {
    if (exportFileNameProp) {
      const name = exportFileNameProp.trim()
      if (name.toLowerCase().endsWith(".xlsx")) return name
      return `${name.replace(/\.[^.]+$/, "")}.xlsx`
    }
    return `xuat-bang-${new Date().toISOString().slice(0, 10)}.xlsx`
  }, [exportFileNameProp])

  const [expanded, setExpanded] = useState<ExpandedState>(
    defaultExpandedAll ? true : {}
  )

  // Filter column visibility — lưu localStorage
  const storageKey = filterColumnVisibilityKey
  const [filterColumnVisibility, setFilterColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    if (!storageKey) return {}
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(filterColumnVisibility))
  }, [filterColumnVisibility, storageKey])

  const expanderColumn = useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "_expand",
      header: () => null,
      cell: ({ row }) => {
        if (!row.getCanExpand()) {
          return (
            <span className="inline-block h-8 w-8 shrink-0" aria-hidden />
          )
        }
        return (
          <div className="flex w-8 items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-expanded={row.getIsExpanded()}
              aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
              onClick={(e) => {
                e.stopPropagation()
                row.getToggleExpandedHandler()()
              }}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        disableColumnFilter: true,
        className: "w-8 min-w-8 max-w-8 px-0",
      },
      size: 32,
      minSize: 32,
      maxSize: 32,
    }),
    []
  )

  const selectionColumn = useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "_select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            !table.getIsAllPageRowsSelected() &&
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(value === true)
          }
          onClick={(event) => event.stopPropagation()}
          aria-label="Chọn tất cả dòng"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          disabled={!row.getCanSelect()}
          onClick={(event) => event.stopPropagation()}
          aria-label="Chọn dòng"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        disableColumnFilter: true,
        className:
          "sticky left-0 z-10 min-w-8 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
      } satisfies ColumnMeta,
      size: 48,
    }),
    []
  )

  const tableColumns = useMemo(() => {
    const built: ColumnDef<TData, unknown>[] = []
    if (rowSelectionEnabled) built.push(selectionColumn)
    if (getSubRows) built.push(expanderColumn)
    built.push(
      ...applyDefaultFilterFns(
        columns.filter((column) => !column.meta?.hideInTable)
      )
    )
    return built
  }, [
    columns,
    expanderColumn,
    getSubRows,
    rowSelectionEnabled,
    selectionColumn,
  ])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      expanded,
      rowSelection: selectedRowIds,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setSelectedRowIds,
    getSubRows,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualFiltering,
    filterFromLeafRows: filterFromLeafRowsProp,
    globalFilterFn: manualFiltering
      ? "includesString"
      : getGlobalFilterText
        ? (row, _columnId, filterValue) => {
            const q = String(filterValue ?? "").trim()
            if (!q) return true
            return includesText(getGlobalFilterText(row.original), q)
          }
        : "includesString",
    autoResetExpanded: false,
    defaultColumn: {
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return includesText(row.getValue(columnId), String(filterValue))
      },
    },
    enableRowSelection: rowSelectionEnabled
      ? (row) => (canSelectRow ? canSelectRow(row) : true)
      : false,
  })

  const handleXlsxExport = useCallback(() => {
    const { headers, rows, columnWidths, columnWraps } = buildCsvFromColumns(
      data,
      columns,
      getSubRows ? { getSubRows } : undefined
    )
    void downloadXlsxFile(
      resolvedXlsxFileName,
      headers,
      rows,
      exportSheetNameProp || "Dữ liệu",
      {
        title: exportTitleProp,
        subtitle: exportSubtitleProp,
        metadata: exportMetadataProp,
        columnWidths,
        columnWraps,
      }
    )
  }, [
    columns,
    data,
    exportMetadataProp,
    exportSheetNameProp,
    exportSubtitleProp,
    exportTitleProp,
    getSubRows,
    resolvedXlsxFileName,
  ])

  const hasActiveFilters =
    String(globalFilter ?? "").trim().length > 0 || columnFilters.length > 0
  const clearAllFilters = useCallback(() => {
    setGlobalFilter("")
    setColumnFilters([])
  }, [setColumnFilters, setGlobalFilter])

  const handleClearFilters = useCallback(() => {
    if (onClearFilters) {
      onClearFilters()
      return
    }
    clearAllFilters()
  }, [clearAllFilters, onClearFilters])

  const showClearFiltersButton = Boolean(onClearFilters) || hasActiveFilters

  const headerGroups = table.getHeaderGroups()
  const rows = table.getRowModel().rows
  // Recursively collect selected rows including sub-rows for tree-structured tables
  // When parent is selected, all descendants are also considered selected
  const selectedRows = useMemo(() => {
    const result: TData[] = []
    const addedIds = new Set<string>()
    const visit = (rws: Row<TData>[], parentSelected = false) => {
      for (const row of rws) {
        const isSelected = row.getIsSelected() || parentSelected
        if (isSelected && !addedIds.has(row.id)) {
          result.push(row.original)
          addedIds.add(row.id)
        }
        if (row.subRows?.length) {
          visit(row.subRows, isSelected)
        }
      }
    }
    visit(table.getRowModel().rows)
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, table.getState().rowSelection])
  const selectedCount = selectedRows.length

  const runBulkAction = useCallback(
    async (action: AdminDataTableBulkAction<TData>) => {
      if (runningBulkActionId != null) return
      const requiresSelection = action.requiresSelection ?? true
      if (requiresSelection && selectedRows.length === 0) return
      if (action.disabled?.(selectedRows)) return
      // If action has confirm, show confirmation dialog first
      if (action.confirm) {
        setConfirmAction(action)
        return
      }
      setRunningBulkActionId(action.id)
      try {
        await action.onAction(selectedRows)
        if (action.clearSelectionOnSuccess ?? true) {
          table.resetRowSelection()
        }
      } finally {
        setRunningBulkActionId(null)
      }
    },
    [runningBulkActionId, selectedRows, table]
  )

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return
    setRunningBulkActionId(confirmAction.id)
    try {
      await confirmAction.onAction(selectedRows)
      if (confirmAction.clearSelectionOnSuccess ?? true) {
        table.resetRowSelection()
      }
    } catch {
      // Caller handles user-facing errors (toast, etc.)
    } finally {
      setRunningBulkActionId(null)
      setConfirmAction(null)
    }
  }, [confirmAction, selectedRows, table])

  const filterableHeaders = table
    .getFlatHeaders()
    .filter(
      (h) =>
        h.column.getCanFilter() && !h.column.columnDef.meta?.disableColumnFilter
    )

  const visibleFilterableHeaders = useMemo(() => {
    if (!storageKey) return filterableHeaders
    return filterableHeaders.filter(
      (h) => filterColumnVisibility[h.id] !== false
    )
  }, [filterableHeaders, filterColumnVisibility, storageKey])

  const filterColumnOptions = useMemo((): Array<{
    value: string
    label: string
  }> => {
    return filterableHeaders.map((h) => ({
      value: h.id,
      label: columnFilterToolbarLabel(h),
    }))
  }, [filterableHeaders])

  const handleFilterColumnVisibilityChange = useCallback(
    (v: unknown) => {
      const selectedIds = Array.isArray(v) ? v : []
      const next: Record<string, boolean> = {}
      filterableHeaders.forEach((h) => {
        next[h.id] = selectedIds.includes(h.id)
      })
      setFilterColumnVisibility(next)
    },
    [filterableHeaders]
  )

  const showAllFilterColumns = useCallback(() => {
    handleFilterColumnVisibilityChange(
      filterableHeaders.map((header) => header.id)
    )
  }, [filterableHeaders, handleFilterColumnVisibilityChange])

  const hideAllFilterColumns = useCallback(() => {
    handleFilterColumnVisibilityChange([])
  }, [handleFilterColumnVisibilityChange])

  // Debounced column filter input component
  function DebouncedFilterInput({
    column,
    controlId,
    placeholder,
    type = "text",
  }: {
    column: Header<TData, unknown>["column"]
    controlId: string
    placeholder: string
    type?: "text" | "number"
  }) {
    const rawFilterValue = column.getFilterValue()
    const currentFilterValue =
      rawFilterValue == null ? "" : String(rawFilterValue)
    const [value, setValue] = useState(() => currentFilterValue)

    // Debounce the actual filter update
    const debouncedSetFilter = useMemo(
      () =>
        debounce((nextValue: string) => {
          column.setFilterValue(
            nextValue === ""
              ? undefined
              : type === "number"
                ? Number(nextValue)
                : nextValue
          )
        }, 300),
      [column, type]
    )

    // Cleanup debounce on unmount
    useEffect(() => {
      return () => {
        debouncedSetFilter.cancel()
      }
    }, [debouncedSetFilter])

    useEffect(() => {
      setValue(currentFilterValue)
    }, [currentFilterValue])

    return (
      <Input
        id={controlId}
        type={type}
        className="h-9 rounded-lg text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          debouncedSetFilter(next)
        }}
      />
    )
  }

  function renderOutsideColumnFilter(header: Header<TData, unknown>) {
    const col = header.column
    const controlId = `admin-col-filter-ctl-${header.id}`
    const meta = col.columnDef.meta
    const variant = meta?.filterVariant ?? "text"
    const ph = meta?.filterPlaceholder ?? "Lọc…"

    if (variant === "select") {
      return (
        <SelectPicker
          id={controlId}
          value={col.getFilterValue()}
          onChange={(v: unknown) => col.setFilterValue(v)}
          options={meta?.selectOptions ?? []}
        />
      )
    }

    if (variant === "multi-select") {
      return (
        <MultiSelectPicker
          id={controlId}
          value={col.getFilterValue()}
          onChange={(v: unknown) => col.setFilterValue(v)}
          options={meta?.selectOptions ?? []}
        />
      )
    }

    if (variant === "tree-select") {
      return (
        <TreePicker
          id={controlId}
          value={col.getFilterValue()}
          onChange={(v: unknown) => col.setFilterValue(v)}
          options={meta?.treeOptions ?? []}
        />
      )
    }

    if (variant === "tree-multi-select") {
      return (
        <TreeMultiSelectPicker
          id={controlId}
          value={col.getFilterValue()}
          onChange={(v: unknown) => col.setFilterValue(v)}
          options={meta?.treeOptions ?? []}
        />
      )
    }

    if (variant === "date") {
      return (
        <DatePicker
          id={controlId}
          value={col.getFilterValue()}
          onChange={(v: unknown) => col.setFilterValue(v)}
        />
      )
    }

    if (variant === "date-range") {
      return (
        <DateRangePicker
          id={controlId}
          value={col.getFilterValue()}
          onChange={(v: unknown) => col.setFilterValue(v)}
          placeholder={ph}
        />
      )
    }

    if (variant === "number") {
      return (
        <DebouncedFilterInput
          column={col}
          controlId={controlId}
          placeholder={ph}
          type="number"
        />
      )
    }

    return (
      <DebouncedFilterInput
        column={col}
        controlId={controlId}
        placeholder={ph}
      />
    )
  }

  if (isLoading) {
    return (
      <>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted/40" />
          ))}
        </div>
        <BulkActionConfirmDialog
          confirmAction={confirmAction}
          selectedCount={selectedCount}
          selectedRows={selectedRows}
          runningBulkActionId={runningBulkActionId}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
        />
      </>
    )
  }

  return (
    <div className="space-y-3">
      {(showGlobalFilter ||
        filterableHeaders.length > 0 ||
        filterToolbarExtra ||
        xlsxExportEnabled ||
        (rowSelectionEnabled && hasBulkActions)) && (
        <div className="space-y-4 bg-card">
          {showGlobalFilter || filterToolbarExtra || xlsxExportEnabled ? (
            <div className="flex flex-wrap items-end gap-3">
              {showGlobalFilter ? (
                <div className="flex min-w-[min(100%,18rem)] flex-1 flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Tìm nhanh
                  </label>
                  <Input
                    placeholder={globalFilterPlaceholder}
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full"
                  />
                </div>
              ) : null}
              <div className="flex shrink-0 flex-wrap items-end gap-2">
                {showClearFiltersButton ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Bộ lọc
                    </span>
                    <Button
                      type="button"
                      variant={"destructive"}
                      onClick={handleClearFilters}
                      title="Xóa tìm nhanh và toàn bộ bộ lọc theo cột"
                    >
                      <FilterX className="size-4" />
                      Xóa bộ lọc
                    </Button>
                  </div>
                ) : null}
                {xlsxExportEnabled ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Xuất file
                    </span>
                    <Button
                      type="button"
                      variant="success"
                      disabled={data.length === 0}
                      onClick={handleXlsxExport}
                      title="Excel: cột rộng theo nội dung, Unicode chuẩn"
                    >
                      <Download className="size-4" />
                      Excel
                    </Button>
                  </div>
                ) : null}
                {filterToolbarExtra ? (
                  <div className="flex flex-wrap gap-2">
                    {filterToolbarExtra}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <BulkActionsBar
            visible={rowSelectionEnabled && hasBulkActions}
            selectedCount={selectedCount}
            bulkActions={bulkActions}
            selectedRows={selectedRows}
            runningBulkActionId={runningBulkActionId}
            onRunAction={runBulkAction}
          />
          {filterableHeaders.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <div className="flex flex-wrap items-center gap-2">
                <TypographyPSmall className="flex items-center gap-1.5 font-semibold">
                  <ListFilter className="size-4 shrink-0 text-primary/80" aria-hidden />
                  Lọc theo cột
                </TypographyPSmall>
                {filterColumnVisibilityKey && (
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[14rem]">
                      <TreeMultiSelectPicker
                        value={filterableHeaders
                          .filter((h) => filterColumnVisibility[h.id] !== false)
                          .map((h) => h.id)}
                        onChange={handleFilterColumnVisibilityChange}
                        options={filterColumnOptions}
                        placeholder="Chọn cột lọc"
                        showBulkActions
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5"
                      onClick={showAllFilterColumns}
                    >
                      <Eye className="size-4 shrink-0" aria-hidden />
                      Hiện tất cả
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5"
                      onClick={hideAllFilterColumns}
                    >
                      <EyeOff className="size-4 shrink-0" aria-hidden />
                      Ẩn tất cả
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                {visibleFilterableHeaders.map((header) => (
                  <div
                    key={header.id}
                    className="flex w-[12rem] min-w-[min(100%,12rem)] flex-col gap-1"
                  >
                    <label
                      htmlFor={`admin-col-filter-ctl-${header.id}`}
                      className="text-xs font-medium text-foreground/80"
                    >
                      {columnFilterToolbarLabel(header)}
                    </label>
                    <div>{renderOutsideColumnFilter(header)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border pt-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px] text-sm sm:min-w-0">
            <TableHeader className="bg-primary text-primary-foreground">
              {headerGroups.map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "bg-primary align-top font-semibold whitespace-normal text-primary-foreground",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none",
                        cellWidthClassName(
                          header.column.columnDef.meta as
                            | ColumnMeta
                            | undefined
                        )
                      )}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex h-full flex-col items-start justify-center gap-1">
                          <span className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc"
                              ? " ↑"
                              : header.column.getIsSorted() === "desc"
                                ? " ↓"
                                : null}
                          </span>
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-depth={row.depth}
                    className={cn(
                      "hover:bg-primary/8",
                      row.index % 2 === 1 && "bg-primary/8",
                      getRowClassName?.(row)
                    )}
                    style={{
                      borderLeft:
                        row.depth > 0
                          ? `3px solid hsl(var(--primary) / ${0.15 + row.depth * 0.1})`
                          : undefined,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colIndex = cell.column.getIndex()
                      // Calculate which column should get indent:
                      // if rowSelection + expander: first data column is at index 2
                      // if only expander: first data column is at index 1
                      // if only rowSelection: first data column is at index 1
                      const firstDataColumnIndex =
                        (rowSelectionEnabled ? 1 : 0) + (getSubRows ? 1 : 0)
                      const indent =
                        getSubRows && colIndex === firstDataColumnIndex
                          ? row.depth * 24
                          : 0
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cellWidthClassName(
                              cell.column.columnDef.meta as
                                | ColumnMeta
                                | undefined
                            ),
                            row.getIsSelected() && "!bg-primary/8",
                            cell.column.id === "_select" &&
                              !row.getIsSelected() &&
                              "hover:!bg-primary/8"
                          )}
                          style={{
                            paddingLeft:
                              indent > 0
                                ? `calc(0.5rem + ${indent}px)`
                                : undefined,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:px-4">
          {footer}
        </div>
      ) : null}

      <BulkActionConfirmDialog
        confirmAction={confirmAction}
        selectedCount={selectedCount}
        selectedRows={selectedRows}
        runningBulkActionId={runningBulkActionId}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}

export const DataTable = AdminDataTable

// Extracted component for bulk action confirmation dialog
type BulkActionConfirmDialogProps<TData> = {
  confirmAction: AdminDataTableBulkAction<TData> | null
  selectedCount: number
  selectedRows: TData[]
  runningBulkActionId: string | null
  onCancel: () => void
  onConfirm: () => void
}

function BulkActionConfirmDialog<TData>({
  confirmAction,
  selectedCount,
  selectedRows,
  runningBulkActionId,
  onCancel,
  onConfirm,
}: BulkActionConfirmDialogProps<TData>) {
  const isOpen = confirmAction != null

  const title =
    typeof confirmAction?.confirm === "object"
      ? confirmAction.confirm.title
      : (confirmAction?.label ?? "Xác nhận thao tác")

  const description =
    typeof confirmAction?.confirm === "object" &&
    confirmAction.confirm.description
      ? typeof confirmAction.confirm.description === "function"
        ? confirmAction.confirm.description(selectedRows)
        : confirmAction.confirm.description
      : `Bạn đã chọn ${selectedCount} mục. Thao tác này không thể hoàn tác.`

  const confirmLabel =
    typeof confirmAction?.confirm === "object"
      ? confirmAction.confirm.confirmLabel
      : "Xác nhận"

  const isDestructive =
    typeof confirmAction?.confirm === "object" &&
    confirmAction.confirm.destructive

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            disabled={runningBulkActionId != null}
            className={
              isDestructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {runningBulkActionId != null ? "Đang xử lý..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Extracted component for bulk actions bar
type BulkActionsBarProps<TData> = {
  visible: boolean
  selectedCount: number
  bulkActions: AdminDataTableBulkAction<TData>[]
  selectedRows: TData[]
  runningBulkActionId: string | null
  onRunAction: (action: AdminDataTableBulkAction<TData>) => void
}

function BulkActionsBar<TData>({
  visible,
  selectedCount,
  bulkActions,
  selectedRows,
  runningBulkActionId,
  onRunAction,
}: BulkActionsBarProps<TData>) {
  if (!visible) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">
        Đã chọn{" "}
        <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
        dòng
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {bulkActions.map((action) => {
          const requiresSelection = action.requiresSelection ?? true
          const disabledBySelection = requiresSelection && selectedCount === 0
          const disabledByAction = action.disabled?.(selectedRows) ?? false
          const isRunning = runningBulkActionId === action.id
          return (
            <Button
              key={action.id}
              type="button"
              size="sm"
              variant={action.variant ?? "outline"}
              className={cn("h-8 gap-1.5 rounded-lg", action.className)}
              disabled={
                isRunning ||
                runningBulkActionId != null ||
                disabledBySelection ||
                disabledByAction
              }
              onClick={() => onRunAction(action)}
            >
              {action.icon}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
