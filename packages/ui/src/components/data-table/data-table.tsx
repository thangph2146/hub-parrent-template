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
  isActionsColumn?: boolean
  isIndexColumn?: boolean
  enableHiding?: boolean
  hideInTable?: boolean
  defaultHidden?: boolean
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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type FilterFn,
  type Header,
  type OnChangeFn,
  type RowSelectionState,
  type Row,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronRight,
  Columns3,
  Download,
  Eye,
  EyeOff,
  FilterX,
  ListFilter,
  Table2,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
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
import {
  buildCsvFromColumns,
  filterExportColumnsByVisibility,
} from "../../lib/build-table-csv"
import {
  buildDefaultTableColumnVisibility,
  getHideableTableColumnOptions,
  readStoredColumnVisibility,
} from "./data-table-column-visibility"
import {
  formatFlatRowIndex,
  formatHierarchicalRowIndex,
} from "./data-table-row-index"
import {
  downloadXlsxFile,
  type XlsxRelatedSection,
} from "../../lib/export-xlsx"
import {
  ADMIN_PAGED_LIST_FETCH_LIMIT,
  fetchAllPagedList,
} from "../../lib/fetch-all-paged-list"
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
import {
  AdminDataTablePagination,
  ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS,
  type AdminDataTableServerPaginationConfig,
  ADMIN_DATA_TABLE_MAX_PAGE_SIZE,
} from "./data-table-pagination"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldSetContent,
  FieldTitle,
} from "../field"
import {
  dataTableColumnsHasActionsColumn,
  normalizeDataTableColumns,
} from "./data-table-columns"
import {
  DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_SIZE,
  DATA_TABLE_EXPAND_COLUMN_ID,
  DATA_TABLE_INDEX_COLUMN_ID,
  DATA_TABLE_SELECTION_COLUMN_ID,
  dataTableCellContentClampClassName,
  dataTableCellWidthClassName,
  isDataTableActionsColumn,
} from "./data-table-column-width"
import { DataTableHorizontalScroll } from "./data-table-horizontal-scroll"
import { DataTableRowContextMenu } from "./data-table-row-context-menu"
import {
  DataTableRowActionsRegistryProvider,
  DataTableRowActionsRowProvider,
  DataTableScopeProvider,
} from "./data-table-row-actions-registry"
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
    | "warning"
    | "success"
  className?: string
  requiresSelection?: boolean
  clearSelectionOnSuccess?: boolean
  disabled?: (selectedRows: TData[]) => boolean
  /**
   * Dialog xác nhận trước khi thực hiện.
   * Mặc định: **bật** cho mọi thao tác hàng loạt. Truyền `confirm: false` để bỏ qua.
   */
  confirm?:
    | boolean
    | {
        title: string
        description?: string | ((selectedRows: TData[]) => ReactNode)
        confirmLabel?: string
        destructive?: boolean
      }
}

function bulkActionNeedsConfirm<TData>(
  action: AdminDataTableBulkAction<TData>
): boolean {
  return action.confirm !== false
}

function resolveBulkActionConfirmTitle<TData>(
  action: AdminDataTableBulkAction<TData>
): string {
  if (typeof action.confirm === "object") return action.confirm.title
  return action.label
}

function resolveBulkActionConfirmDescription<TData>(
  action: AdminDataTableBulkAction<TData>,
  selectedCount: number,
  selectedRows: TData[]
): ReactNode {
  if (typeof action.confirm === "object" && action.confirm.description) {
    return typeof action.confirm.description === "function"
      ? action.confirm.description(selectedRows)
      : action.confirm.description
  }
  if (action.variant === "destructive") {
    return `Bạn đã chọn ${selectedCount} dòng. Hành động này có thể không hoàn tác được.`
  }
  return `Bạn đã chọn ${selectedCount} dòng. Tiếp tục thực hiện "${action.label}"?`
}

function resolveBulkActionConfirmLabel<TData>(
  action: AdminDataTableBulkAction<TData>
): string {
  if (typeof action.confirm === "object" && action.confirm.confirmLabel) {
    return action.confirm.confirmLabel
  }
  return action.label
}

function resolveBulkActionConfirmDestructive<TData>(
  action: AdminDataTableBulkAction<TData>
): boolean {
  if (typeof action.confirm === "object") {
    return action.confirm.destructive ?? action.variant === "destructive"
  }
  return action.variant === "destructive"
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
      /** Bảng liên quan chèn sau dữ liệu chính (cùng sheet). */
      relatedSections?: import("../../lib/export-xlsx").XlsxRelatedSection[]
      /**
       * Xuất tùy chỉnh (field phẳng, sheet quan hệ…) — thay cho `buildCsvFromColumns`.
       * Dùng với `downloadAdminTableXlsx` từ `@ui/lib/admin-table-export`.
       */
      runExport?: () => void | Promise<void>
      /**
       * Tải toàn bộ dữ liệu (phân trang server) trước khi xuất — khớp bộ lọc hiện tại.
       * Dùng `fetchAllAdminList` từ `apps/backend`.
       */
      fetchAllForExport?: () => Promise<unknown[]>
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
  /** Nội dung tùy chọn bên trái footer (tóm tắt, ghi chú). */
  footer?: ReactNode
  /** Phân trang server — `data` là một trang từ API. */
  pagination?: AdminDataTableServerPaginationConfig
  /** Phân trang client — tự cắt `data` sau lọc (danh sách load một lần). */
  clientPagination?: {
    initialPageSize?: number
    pageSizeOptions?: readonly number[]
    maxPageSize?: number
    emptySummary?: string
    itemLabel?: string
    isLoading?: boolean
  }
  /**
   * Hiện nút xuất Excel (dữ liệu đúng mảng `data` hiện tại — thường là một trang/lớp đã lọc).
   * Bảng cây (`getSubRows`) sẽ xuất đủ nhánh con theo thứ tự hiển thị.
   */
  xlsxExport?: AdminDataTableXlsxExportConfig
  /**
   * Bật cột checkbox chọn dòng.
   * Mặc định tự bật khi có `bulkActions` (không cần truyền `rowSelectionEnabled`).
   * Truyền `false` để tắt dù vẫn có bulk (trường hợp hiếm).
   */
  rowSelectionEnabled?: boolean
  /** Kiểm soát dòng nào được phép tick */
  canSelectRow?: (row: Row<TData>) => boolean
  selectedRowIds?: RowSelectionState
  onSelectedRowIdsChange?: OnChangeFn<RowSelectionState>
  bulkActions?: AdminDataTableBulkAction<TData>[]
  /**
   * Phạm vi bảng admin — tự sinh key localStorage:
   * `{scope}-table-filters` và `{scope}-table-columns`.
   */
  tableScope?: string
  /** localStorage key để lưu trạng thái hiển thị filter cột (mặc định: không lưu) */
  filterColumnVisibilityKey?: string
  /**
   * localStorage key cho "Hiện cột" bảng dữ liệu.
   * Mặc định: `{tableScope}-table-columns` hoặc `{filterColumnVisibilityKey}-table-columns`.
   */
  tableColumnVisibilityKey?: string
  /**
   * Tải toàn bộ dữ liệu phân trang server trước khi xuất Excel.
   * Tự gắn `fetchAllForExport` khi `xlsxExport` chưa có.
   */
  exportFetchPage?: (params: {
    page: number
    limit: number
  }) => Promise<{ items: TData[]; total: number }>
  /** Bật bộ chọn hiện/ẩn cột dữ liệu. @default true */
  showTableColumnPicker?: boolean
  /**
   * Cột STT (số thứ tự) tự chèn đầu bảng. Tắt nếu `columns` đã có `id: "stt"` hoặc `"_index"`.
   * @default true
   */
  showIndexColumn?: boolean
  /** Nhãn cột STT — @default "STT" */
  indexColumnLabel?: string
  /** Bỏ cột STT khi xuất Excel — @default false */
  indexColumnExcludeFromExport?: boolean
  /**
   * Độ rộng cột checkbox chọn dòng (px).
   * @default DATA_TABLE_SELECTION_COLUMN_WIDTH (48)
   */
  selectionColumnWidth?: number
  /**
   * Thanh cuộn ngang phía trên bảng (đồng bộ với vùng cuộn bảng).
   * Tự ẩn khi bảng không tràn ngang.
   * @default true
   */
  horizontalScrollButtons?: boolean
  /**
   * Header bảng dính trên khi cuộn dọc (scroll ancestor, thường là `<main>` admin).
   * @default true
   */
  stickyTableHeader?: boolean
  /**
   * Giá trị CSS `top` cho header dính (số = px, chuỗi = đơn vị tùy ý).
   * @default 0
   */
  stickyTableHeaderTop?: string | number
  /**
   * Chiều cao tối đa vùng cuộn bảng (`overflow-auto` trên table-container).
   * Khi `stickyTableHeader` và không truyền — dùng `DATA_TABLE_STICKY_HEADER_DEFAULT_MAX_HEIGHT`.
   */
  tableBodyMaxHeight?: string | number
  /**
   * Chuột phải trên dòng mở menu thao tác (cùng nội dung cột actions / `DataTableRowActionsMenu`).
   * Mặc định bật khi bảng có cột thao tác.
   */
  rowContextMenu?: boolean
}

export {
  DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_SIZE,
  DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_WIDTH_CLASS,
  DATA_TABLE_EXPAND_COLUMN_ID,
  DATA_TABLE_INDEX_COLUMN_ID,
  DATA_TABLE_SELECTION_COLUMN_ID,
} from "./data-table-column-width"

/** Độ rộng mặc định cột checkbox (px) — chỉnh qua prop `selectionColumnWidth`. */
export const DATA_TABLE_SELECTION_COLUMN_WIDTH = 48

/** Chiều cao tối đa mặc định vùng cuộn bảng khi `stickyTableHeader` (trừ header/filter admin). */
export const DATA_TABLE_STICKY_HEADER_DEFAULT_MAX_HEIGHT =
  "calc(100dvh - 15rem)"

export const DATA_TABLE_SELECTION_COLUMN_CLASS =
  "sticky left-0 z-[11] px-0 text-center align-middle shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]"

/** Cột ghim checkbox / thao tác — căn giữa; nền opaque đồng bộ dòng (xem stickyPinnedBodyCell*). */
export const DATA_TABLE_PINNED_COLUMN_CLASS = "text-center align-middle"

/** Nền opaque + hover đồng bộ giữa `<tr>` và ô ghim — cùng token & transition. */
const DATA_TABLE_ROW_BG_TRANSITION =
  "transition-colors duration-150 ease-in-out"

const STICKY_PINNED_BG_EVEN = "!bg-card"
const STICKY_PINNED_BG_ODD =
  "!bg-[color-mix(in_oklch,var(--primary)_8%,var(--card))]"
const DATA_TABLE_ROW_BG_HOVER =
  "hover:!bg-[color-mix(in_oklch,var(--primary)_8%,var(--card))]"
const STICKY_PINNED_BG_HOVER_GROUP =
  "group-hover/row:!bg-[color-mix(in_oklch,var(--primary)_8%,var(--card))]"
const STICKY_PINNED_BG_SELECTED =
  "!bg-[color-mix(in_oklch,var(--primary)_12%,var(--card)))]"

const DATA_TABLE_SELECTION_CHECKBOX_WRAP_HEADER =
  "inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-primary-foreground/15 focus-within:ring-2 focus-within:ring-primary-foreground/25"

const DATA_TABLE_SELECTION_CHECKBOX_WRAP_BODY =
  "inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-primary/10 focus-within:ring-2 focus-within:ring-primary/20"

function stickyPinnedHeadCellClassName(options: {
  isSelectionCol: boolean
  isActionsCol: boolean
  stickyTableHeader: boolean
}): string {
  const { isSelectionCol, isActionsCol, stickyTableHeader } = options
  if (!isSelectionCol && !isActionsCol) return ""
  return cn(
    "bg-primary text-center align-middle text-primary-foreground",
    isSelectionCol && "sticky left-0 px-0",
    isActionsCol && "sticky right-0",
    stickyTableHeader ? "z-[25]" : isSelectionCol ? "z-[12]" : "z-[10]"
  )
}

function dataTableRowBodyClassName(options: {
  rowIndex: number
  isSelected: boolean
  extra?: string
}): string {
  const { rowIndex, isSelected, extra } = options
  const isOdd = rowIndex % 2 === 1
  const baseBg = isSelected
    ? STICKY_PINNED_BG_SELECTED
    : isOdd
      ? STICKY_PINNED_BG_ODD
      : STICKY_PINNED_BG_EVEN

  return cn(
    "group/row",
    DATA_TABLE_ROW_BG_TRANSITION,
    baseBg,
    !isSelected && DATA_TABLE_ROW_BG_HOVER,
    extra
  )
}

function stickyPinnedBodyCellClassName(options: {
  rowIndex: number
  isSelected: boolean
  side: "left" | "right"
}): string {
  const { rowIndex, isSelected, side } = options
  const isOdd = rowIndex % 2 === 1
  const baseBg = isSelected
    ? STICKY_PINNED_BG_SELECTED
    : isOdd
      ? STICKY_PINNED_BG_ODD
      : STICKY_PINNED_BG_EVEN

  return cn(
    side === "left" ? "sticky left-0 z-[11]" : "sticky right-0 z-[10]",
    DATA_TABLE_PINNED_COLUMN_CLASS,
    DATA_TABLE_ROW_BG_TRANSITION,
    side === "left"
      ? "shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]"
      : "shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.08)]",
    baseBg,
    !isSelected && STICKY_PINNED_BG_HOVER_GROUP
  )
}

function selectionColumnBoxStyle(widthPx: number): CSSProperties {
  return {
    width: widthPx,
    minWidth: widthPx,
    maxWidth: widthPx,
  }
}

function toCssSize(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value
}

function stickyTableHeadClassName(options: {
  enabled: boolean
  isSelectionCol: boolean
  isActionsCol: boolean
}): string {
  if (!options.enabled) return ""
  const corner = options.isSelectionCol || options.isActionsCol
  return cn(
    "sticky top-0 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1)]",
    corner ? "z-[25]" : "z-[15]",
    "bg-primary"
  )
}

function resolveDataTableScrollMaxHeight(
  stickyTableHeader: boolean,
  tableBodyMaxHeight: string | number | undefined
): string | number | undefined {
  if (tableBodyMaxHeight != null) return tableBodyMaxHeight
  if (stickyTableHeader) return DATA_TABLE_STICKY_HEADER_DEFAULT_MAX_HEIGHT
  return undefined
}

function stickyTableHeadTopStyle(
  enabled: boolean,
  top: string | number | undefined
): CSSProperties | undefined {
  if (!enabled) return undefined
  const resolved = top ?? 0
  return {
    top: typeof resolved === "number" ? `${resolved}px` : resolved,
  }
}

/** Kiểm tra `columns` đã có cột STT thủ công. */
export function dataTableColumnsHasIndexColumn<TData>(
  columns: ColumnDef<TData, unknown>[]
): boolean {
  const walk = (cols: ColumnDef<TData, unknown>[]): boolean => {
    for (const col of cols) {
      const id =
        col.id ??
        ("accessorKey" in col && col.accessorKey != null
          ? String(col.accessorKey)
          : "")
      if (id === DATA_TABLE_INDEX_COLUMN_ID || id === "_index") return true
      const group = col as ColumnDef<TData, unknown> & {
        columns?: ColumnDef<TData, unknown>[]
      }
      if (group.columns?.length && walk(group.columns)) return true
    }
    return false
  }
  return walk(columns)
}

export type DataTableProps<TData> = AdminDataTableProps<TData>

export type {
  AdminDataTablePaginationConfig,
  AdminDataTablePaginationProps,
  AdminDataTableServerPaginationConfig,
  AdminDataTableClientPaginationConfig,
} from "./data-table-pagination"
export {
  AdminDataTablePagination,
  ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS,
  ADMIN_DATA_TABLE_MIN_PAGE_SIZE,
  ADMIN_DATA_TABLE_MAX_PAGE_SIZE,
} from "./data-table-pagination"

function includesText(a: unknown, q: string): boolean {
  if (!q) return true
  const s = String(a ?? "").toLowerCase()
  return s.includes(q.toLowerCase())
}

/** Áp `size` / `minSize` / `maxSize` từ ColumnDef khi chưa có class width trong meta. */
function columnSizeBoxStyle<TData>(
  column: Column<TData, unknown>
): CSSProperties | undefined {
  const def = column.columnDef
  const meta = def.meta as ColumnMeta | undefined
  if (
    meta?.className &&
    /\b(min-w-|max-w-|w-\[|w-\d|w-auto|w-full|w-fit)\b/.test(meta.className)
  ) {
    return undefined
  }

  const { size, minSize, maxSize } = def
  if (size == null && minSize == null && maxSize == null) return undefined

  const style: CSSProperties = {}
  if (size != null) {
    style.width = size
    if (minSize == null) style.minWidth = size
    if (maxSize == null) style.maxWidth = size
  }
  if (minSize != null) style.minWidth = minSize
  if (maxSize != null) style.maxWidth = maxSize
  return style
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

const DATA_TABLE_PANEL_FIELDSET_CLASS = "bg-card rounded-lg"
const DATA_TABLE_PANEL_LEGEND_CLASS =
  "!normal-case !text-sm !font-semibold !tracking-normal text-foreground"

function DataTablePanelLegend({
  icon: Icon,
  children,
}: {
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <FieldLegend variant="custom" className={DATA_TABLE_PANEL_LEGEND_CLASS}>
      <span className="flex items-center gap-1.5">
        {Icon ? (
          <Icon className="size-4 shrink-0 text-primary/80" aria-hidden />
        ) : null}
        {children}
      </span>
    </FieldLegend>
  )
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
  filterToolbarExtra,
  footer,
  pagination,
  clientPagination,
  xlsxExport,
  rowSelectionEnabled = false,
  canSelectRow,
  getRowId,
  selectedRowIds: selectedRowIdsControlled,
  onSelectedRowIdsChange,
  bulkActions = [],
  tableScope,
  filterColumnVisibilityKey,
  tableColumnVisibilityKey,
  exportFetchPage,
  showTableColumnPicker = true,
  showIndexColumn = true,
  indexColumnLabel = "STT",
  indexColumnExcludeFromExport = false,
  selectionColumnWidth = DATA_TABLE_SELECTION_COLUMN_WIDTH,
  horizontalScrollButtons = true,
  stickyTableHeader = true,
  stickyTableHeaderTop,
  tableBodyMaxHeight,
  rowContextMenu,
}: AdminDataTableProps<TData>) {
  const tableScopeId = useId()
  const globalFilterControlId = useId()
  const resolvedFilterColumnVisibilityKey =
    filterColumnVisibilityKey ??
    (tableScope ? `${tableScope}-table-filters` : undefined)
  const resolvedTableColumnVisibilityKey =
    tableColumnVisibilityKey ??
    (tableScope
      ? `${tableScope}-table-columns`
      : resolvedFilterColumnVisibilityKey
        ? `${resolvedFilterColumnVisibilityKey}-table-columns`
        : undefined)
  const resolvedServerPagination = useMemo(() => {
    if (!pagination) return null
    const maxPageSize = pagination.maxPageSize ?? ADMIN_DATA_TABLE_MAX_PAGE_SIZE
    return {
      ...pagination,
      maxPageSize,
      pageSizeOptions:
        pagination.pageSizeOptions ?? ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS,
      currentPageRowCount:
        pagination.currentPageRowCount ?? data.length,
      showAllPageSizeOption: pagination.showAllPageSizeOption ?? true,
      onShowAllRows:
        pagination.onShowAllRows ??
        (() => {
          pagination.onPageChange(1)
          pagination.onPageSizeChange(Math.min(pagination.total, maxPageSize))
        }),
    }
  }, [pagination, data.length])
  const resolvedSelectionColumnWidth = Math.max(
    32,
    Math.min(80, Math.round(selectionColumnWidth))
  )
  const resolvedTableScrollMaxHeight = useMemo(
    () =>
      resolveDataTableScrollMaxHeight(stickyTableHeader, tableBodyMaxHeight),
    [stickyTableHeader, tableBodyMaxHeight]
  )
  const tableScrollContainerStyle = useMemo((): CSSProperties | undefined => {
    if (resolvedTableScrollMaxHeight == null) return undefined
    return { maxHeight: toCssSize(resolvedTableScrollMaxHeight) }
  }, [resolvedTableScrollMaxHeight])
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
  const rowSelectionActive = rowSelectionEnabled ?? hasBulkActions
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
  const exportRelatedSectionsProp: XlsxRelatedSection[] | undefined =
    typeof xlsxExport === "object" && xlsxExport != null
      ? xlsxExport.relatedSections
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
  const clientPaginationEnabled = Boolean(clientPagination)
  const [clientPageIndex, setClientPageIndex] = useState(0)
  const [clientPageSize, setClientPageSize] = useState(
    clientPagination?.initialPageSize ?? 15
  )
  const clientPaginationState = useMemo<PaginationState>(
    () => ({
      pageIndex: clientPageIndex,
      pageSize: clientPageSize,
    }),
    [clientPageIndex, clientPageSize]
  )

  useEffect(() => {
    if (!clientPaginationEnabled) return
    setClientPageIndex(0)
  }, [clientPaginationEnabled, data.length, globalFilter, columnFilters])

  // Filter column visibility — lưu localStorage
  const storageKey = resolvedFilterColumnVisibilityKey
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      buildDefaultTableColumnVisibility(
        columns,
        readStoredColumnVisibility(resolvedTableColumnVisibilityKey)
      )
  )
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

  useEffect(() => {
    setColumnVisibility(
      buildDefaultTableColumnVisibility(
        columns,
        readStoredColumnVisibility(resolvedTableColumnVisibilityKey)
      )
    )
  }, [columns, resolvedTableColumnVisibilityKey])

  useEffect(() => {
    if (!resolvedTableColumnVisibilityKey) return
    localStorage.setItem(
      resolvedTableColumnVisibilityKey,
      JSON.stringify(columnVisibility)
    )
  }, [columnVisibility, resolvedTableColumnVisibilityKey])

  const expanderColumn = useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: DATA_TABLE_EXPAND_COLUMN_ID,
      header: () => null,
      cell: ({ row }) => {
        if (!row.getCanExpand()) {
          return <span className="inline-block h-8 w-8 shrink-0" aria-hidden />
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
        enableHiding: false,
        className: "w-8 min-w-8 max-w-8 px-0",
      },
      size: 32,
      minSize: 32,
      maxSize: 32,
    }),
    []
  )

  const hasManualIndexColumn = useMemo(
    () => dataTableColumnsHasIndexColumn(columns),
    [columns]
  )
  const hasActionsColumn = useMemo(
    () => dataTableColumnsHasActionsColumn(columns),
    [columns]
  )
  const rowContextMenuEnabled = rowContextMenu ?? hasActionsColumn
  const indexColumnEnabled = showIndexColumn && !hasManualIndexColumn

  const indexRowOffset = useMemo(() => {
    if (pagination) {
      return Math.max(0, (pagination.page - 1) * pagination.pageSize)
    }
    if (clientPaginationEnabled) {
      return clientPageIndex * clientPageSize
    }
    return 0
  }, [clientPageIndex, clientPageSize, clientPaginationEnabled, pagination])

  const indexColumn = useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: DATA_TABLE_INDEX_COLUMN_ID,
      header: indexColumnLabel,
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        isIndexColumn: true,
        disableColumnFilter: true,
        enableHiding: false,
        excludeFromExport: indexColumnExcludeFromExport,
        className: "w-12 min-w-12 max-w-14 text-start tabular-nums",
      },
      size: 48,
      minSize: 44,
      maxSize: 56,
      cell: ({ row, table }) => {
        const label = getSubRows
          ? formatHierarchicalRowIndex(row, indexRowOffset)
          : (() => {
              const flatIndex = table
                .getRowModel()
                .rows.findIndex((r) => r.id === row.id)
              const order = flatIndex >= 0 ? flatIndex : row.index
              return formatFlatRowIndex(order, indexRowOffset)
            })()
        return (
          <span className="text-sm text-muted-foreground tabular-nums">
            {label}
          </span>
        )
      },
    }),
    [getSubRows, indexColumnExcludeFromExport, indexColumnLabel, indexRowOffset]
  )

  const selectionColumn = useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: DATA_TABLE_SELECTION_COLUMN_ID,
      header: ({ table }) => (
        <div className="flex w-full items-center justify-center">
          <span className={DATA_TABLE_SELECTION_CHECKBOX_WRAP_HEADER}>
            <Checkbox
              className="size-[18px] border-primary-foreground/40 data-checked:border-primary-foreground data-checked:bg-primary-foreground data-checked:text-primary"
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={
                !table.getIsAllPageRowsSelected() &&
                table.getIsSomePageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(value === true)
              }
              onClick={(event) => event.stopPropagation()}
              aria-label="Chọn tất cả dòng trên trang"
            />
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <span
            className={cn(
              DATA_TABLE_SELECTION_CHECKBOX_WRAP_BODY,
              row.getIsSelected() && "bg-primary/15 ring-2 ring-primary/25",
              !row.getCanSelect() && "pointer-events-none opacity-40"
            )}
          >
            <Checkbox
              className="size-[18px]"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(value === true)}
              disabled={!row.getCanSelect()}
              onClick={(event) => event.stopPropagation()}
              aria-label="Chọn dòng"
            />
          </span>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: false,
      meta: {
        disableColumnFilter: true,
        enableHiding: false,
        className: DATA_TABLE_SELECTION_COLUMN_CLASS,
      } satisfies ColumnMeta,
      size: resolvedSelectionColumnWidth,
      minSize: resolvedSelectionColumnWidth,
      maxSize: resolvedSelectionColumnWidth,
    }),
    [resolvedSelectionColumnWidth]
  )

  const exportColumns = useMemo(() => {
    if (!indexColumnEnabled || hasManualIndexColumn) return columns
    if (indexColumnExcludeFromExport) return columns
    return [indexColumn, ...columns]
  }, [
    columns,
    hasManualIndexColumn,
    indexColumn,
    indexColumnEnabled,
    indexColumnExcludeFromExport,
  ])

  const tableColumns = useMemo(() => {
    const built: ColumnDef<TData, unknown>[] = []
    if (rowSelectionActive) built.push(selectionColumn)
    if (indexColumnEnabled) built.push(indexColumn)
    if (getSubRows) built.push(expanderColumn)
    built.push(...applyDefaultFilterFns(normalizeDataTableColumns(columns)))
    return built
  }, [
    columns,
    expanderColumn,
    getSubRows,
    indexColumn,
    indexColumnEnabled,
    rowSelectionActive,
    selectionColumn,
  ])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      expanded,
      rowSelection: selectedRowIds,
      ...(clientPaginationEnabled ? { pagination: clientPaginationState } : {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setSelectedRowIds,
    ...(clientPaginationEnabled
      ? {
          onPaginationChange: (updater) => {
            const next =
              typeof updater === "function"
                ? updater(clientPaginationState)
                : updater
            setClientPageIndex(next.pageIndex)
            setClientPageSize(next.pageSize)
          },
        }
      : {}),
    getSubRows,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(clientPaginationEnabled
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
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
      minSize: DATA_TABLE_DEFAULT_DATA_COLUMN_MIN_SIZE,
      enableColumnFilter: true,
      enableHiding: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return includesText(row.getValue(columnId), String(filterValue))
      },
    },
    enableRowSelection: rowSelectionActive
      ? (row) => (canSelectRow ? canSelectRow(row) : true)
      : false,
  })

  const clientFilteredTotal = clientPaginationEnabled
    ? table.getFilteredRowModel().rows.length
    : 0

  const serverPaginationFooter = resolvedServerPagination ? (
    <AdminDataTablePagination {...resolvedServerPagination} mode="server" />
  ) : null

  const clientPaginationFooter =
    clientPaginationEnabled && clientPagination ? (
      <AdminDataTablePagination
        mode="client"
        page={clientPageIndex + 1}
        pageSize={clientPageSize}
        total={clientFilteredTotal}
        onPageChange={(nextPage) =>
          setClientPageIndex(Math.max(0, nextPage - 1))
        }
        onPageSizeChange={(size) => {
          setClientPageSize(size)
          setClientPageIndex(0)
        }}
        pageSizeOptions={
          clientPagination.pageSizeOptions ?? ADMIN_DATA_TABLE_PAGE_SIZE_OPTIONS
        }
        maxPageSize={clientPagination.maxPageSize}
        emptySummary={clientPagination.emptySummary}
        itemLabel={clientPagination.itemLabel}
        isLoading={clientPagination.isLoading ?? isLoading}
        showAllPageSizeOption
      />
    ) : null

  const paginationFooter = serverPaginationFooter ?? clientPaginationFooter
  const showTableFooter = Boolean(footer || paginationFooter)

  const handleXlsxExport = useCallback(async () => {
    if (
      typeof xlsxExport === "object" &&
      xlsxExport != null &&
      xlsxExport.runExport
    ) {
      await xlsxExport.runExport()
      return
    }

    let exportData: TData[] = table
      .getFilteredRowModel()
      .rows.map((row) => row.original)

    if (
      typeof xlsxExport === "object" &&
      xlsxExport != null &&
      xlsxExport.fetchAllForExport
    ) {
      exportData = (await xlsxExport.fetchAllForExport()) as TData[]
    } else if (exportFetchPage) {
      exportData = await fetchAllPagedList(
        exportFetchPage,
        ADMIN_PAGED_LIST_FETCH_LIMIT
      )
    }

    const visibleColumnIds = new Set(
      table.getVisibleLeafColumns().map((column) => column.id)
    )
    const columnsForExport = filterExportColumnsByVisibility(
      exportColumns,
      visibleColumnIds
    )

    const { headers, rows, columnWidths, columnWraps } = buildCsvFromColumns(
      exportData,
      columnsForExport,
      getSubRows || indexRowOffset > 0
        ? { getSubRows, indexRowOffset }
        : undefined
    )
    await downloadXlsxFile(
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
        relatedSections: exportRelatedSectionsProp,
      }
    )
  }, [
    exportColumns,
    exportMetadataProp,
    exportRelatedSectionsProp,
    exportSheetNameProp,
    exportSubtitleProp,
    exportTitleProp,
    getSubRows,
    indexRowOffset,
    resolvedXlsxFileName,
    table,
    exportFetchPage,
    xlsxExport,
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
      if (bulkActionNeedsConfirm(action)) {
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
        h.column.getCanFilter() &&
        !h.column.columnDef.meta?.disableColumnFilter &&
        !h.column.columnDef.meta?.isIndexColumn
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

  const hideableTableColumnOptions = useMemo(
    () => getHideableTableColumnOptions(table),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, columnVisibility, columns]
  )

  const handleTableColumnVisibilityChange = useCallback(
    (v: unknown) => {
      const selectedIds = Array.isArray(v) ? v : []
      const next: VisibilityState = {}
      hideableTableColumnOptions.forEach((option) => {
        next[option.value] = selectedIds.includes(option.value)
      })
      setColumnVisibility((prev) => ({ ...prev, ...next }))
    },
    [hideableTableColumnOptions]
  )

  const showAllTableColumns = useCallback(() => {
    handleTableColumnVisibilityChange(
      hideableTableColumnOptions.map((option) => option.value)
    )
  }, [handleTableColumnVisibilityChange, hideableTableColumnOptions])

  const hideOptionalTableColumns = useCallback(() => {
    handleTableColumnVisibilityChange([])
  }, [handleTableColumnVisibilityChange])

  const showTableColumnPickerUi =
    showTableColumnPicker && hideableTableColumnOptions.length > 0

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
            <div
              key={i}
              className="h-10 animate-pulse rounded-md bg-muted/40"
            />
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

  const showSearchToolbarPanel =
    showGlobalFilter ||
    filterToolbarExtra ||
    xlsxExportEnabled ||
    showClearFiltersButton
  const showBulkBar = rowSelectionActive && hasBulkActions

  return (
    <div className="flex flex-col gap-4">
      {showSearchToolbarPanel || showBulkBar ? (
        <FieldSet variant="custom" className={DATA_TABLE_PANEL_FIELDSET_CLASS}>
          <DataTablePanelLegend>Tìm kiếm & thao tác</DataTablePanelLegend>
          <FieldSetContent className="space-y-4">
            {showSearchToolbarPanel ? (
              <div className="flex flex-wrap items-end gap-3">
                {showGlobalFilter ? (
                  <Field className="min-w-[min(100%,18rem)] flex-1 gap-1.5">
                    <FieldLabel
                      htmlFor={globalFilterControlId}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Tìm nhanh
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={globalFilterControlId}
                        placeholder={globalFilterPlaceholder}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full"
                      />
                    </FieldContent>
                  </Field>
                ) : null}
                <div className="flex shrink-0 flex-wrap items-end gap-2">
                  {showClearFiltersButton ? (
                    <Field className="w-auto gap-1.5">
                      <FieldTitle className="text-xs font-semibold text-muted-foreground">
                        Bộ lọc
                      </FieldTitle>
                      <FieldContent>
                        <Button
                          type="button"
                          variant={"destructive"}
                          onClick={handleClearFilters}
                          title="Xóa tìm nhanh và toàn bộ bộ lọc theo cột"
                        >
                          <FilterX className="size-4" />
                          Xóa bộ lọc
                        </Button>
                      </FieldContent>
                    </Field>
                  ) : null}
                  {xlsxExportEnabled ? (
                    <Field className="w-auto gap-1.5">
                      <FieldTitle className="text-xs font-semibold text-muted-foreground">
                        Xuất file
                      </FieldTitle>
                      <FieldContent>
                        <Button
                          type="button"
                          variant="success"
                          disabled={data.length === 0}
                          onClick={handleXlsxExport}
                          title="Excel: cột rộng theo nội dung, Unicode chuẩn"
                        >
                          <Download className="size-4" />
                          Download Excel
                        </Button>
                      </FieldContent>
                    </Field>
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
              visible={showBulkBar}
              selectedCount={selectedCount}
              bulkActions={bulkActions}
              selectedRows={selectedRows}
              runningBulkActionId={runningBulkActionId}
              onRunAction={runBulkAction}
            />
          </FieldSetContent>
        </FieldSet>
      ) : null}
      {filterableHeaders.length > 0 ? (
        <FieldSet variant="custom" className={DATA_TABLE_PANEL_FIELDSET_CLASS}>
          <DataTablePanelLegend icon={ListFilter}>
            Lọc theo cột
          </DataTablePanelLegend>
          <FieldSetContent className="space-y-3">
            <div className="w-full flex flex-wrap items-end justify-end gap-2">
              {resolvedFilterColumnVisibilityKey ? (
                <>
                  <div className="w-full max-w-[14rem] flex-1">
                    <Field className="w-full gap-1">
                      <FieldLabel className="text-xs font-medium text-foreground/80">
                        Chọn cột lọc
                      </FieldLabel>
                      <FieldContent>
                        <TreeMultiSelectPicker
                          value={filterableHeaders
                            .filter(
                              (h) => filterColumnVisibility[h.id] !== false
                            )
                            .map((h) => h.id)}
                          onChange={handleFilterColumnVisibilityChange}
                          options={filterColumnOptions}
                          placeholder="Chọn cột lọc"
                          showBulkActions
                        />
                      </FieldContent>
                    </Field>
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
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
              {visibleFilterableHeaders.map((header) => {
                const filterControlId = `admin-col-filter-ctl-${header.id}`
                return (
                  <Field
                    key={header.id}
                    className="w-[16rem] min-w-[min(100%,12rem)] gap-1"
                  >
                    <FieldLabel
                      htmlFor={filterControlId}
                      className="text-xs font-medium text-foreground/80"
                    >
                      {columnFilterToolbarLabel(header)}
                    </FieldLabel>
                    <FieldContent>
                      {renderOutsideColumnFilter(header)}
                    </FieldContent>
                  </Field>
                )
              })}
            </div>
          </FieldSetContent>
        </FieldSet>
      ) : null}
      <FieldSet
        variant="custom"
        className={cn("min-w-0", DATA_TABLE_PANEL_FIELDSET_CLASS)}
      >
        <div className="w-full flex flex-wrap items-end justify-end gap-4 mb-4">
          <div className="w-full max-w-[14rem] flex-1">
            <Field className="w-full gap-1">
              <FieldLabel className="text-xs font-medium text-foreground/80">
                Hiện cột
              </FieldLabel>
              <FieldContent>
                <TreeMultiSelectPicker
                  value={hideableTableColumnOptions
                    .filter(
                      (option) =>
                        table.getColumn(option.value)?.getIsVisible() !== false
                    )
                    .map((option) => option.value)}
                  onChange={handleTableColumnVisibilityChange}
                  options={hideableTableColumnOptions}
                  placeholder="Chọn cột hiển thị"
                  showBulkActions
                />
              </FieldContent>
            </Field>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={showAllTableColumns}
          >
            <Eye className="size-4 shrink-0" aria-hidden />
            Hiện tất cả
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={hideOptionalTableColumns}
          >
            <EyeOff className="size-4 shrink-0" aria-hidden />
            Ẩn tùy chọn
          </Button>
        </div>
        <DataTablePanelLegend icon={Table2}>Dữ liệu</DataTablePanelLegend>
        <FieldSetContent className="space-y-0 p-0">
          <DataTableRowActionsRegistryProvider>
            <DataTableScopeProvider scopeId={tableScopeId}>
              <DataTableHorizontalScroll
                enabled={horizontalScrollButtons}
                watchKey={`${isLoading}-${data.length}`}
              >
                <div className="border border-border">
                  <Table
                    className="min-w-[640px]"
                    scrollContainerClassName={
                      resolvedTableScrollMaxHeight != null
                        ? "overflow-auto"
                        : undefined
                    }
                    scrollContainerStyle={tableScrollContainerStyle}
                  >
                    <TableHeader className="bg-primary text-primary-foreground">
                      {headerGroups.map((hg) => (
                        <TableRow key={hg.id} className="hover:bg-transparent">
                          {hg.headers.map((header) => {
                            const isSelectionCol =
                              header.column.id ===
                              DATA_TABLE_SELECTION_COLUMN_ID
                            const headerMeta = header.column.columnDef.meta as
                              | ColumnMeta
                              | undefined
                            const isActionsCol = isDataTableActionsColumn(
                              header.column.id,
                              headerMeta
                            )
                            const headBoxStyle = isSelectionCol
                              ? selectionColumnBoxStyle(
                                  resolvedSelectionColumnWidth
                                )
                              : columnSizeBoxStyle(header.column)
                            return (
                              <TableHead
                                key={header.id}
                                className={cn(
                                  "bg-primary align-top font-semibold whitespace-normal text-primary-foreground",
                                  header.column.getCanSort() &&
                                    "cursor-pointer select-none",
                                  dataTableCellWidthClassName(
                                    header.column.id,
                                    headerMeta,
                                    header.column.columnDef
                                  ),
                                  stickyPinnedHeadCellClassName({
                                    isSelectionCol,
                                    isActionsCol,
                                    stickyTableHeader,
                                  }),
                                  stickyTableHeadClassName({
                                    enabled: stickyTableHeader,
                                    isSelectionCol,
                                    isActionsCol,
                                  })
                                )}
                                style={{
                                  ...headBoxStyle,
                                  ...stickyTableHeadTopStyle(
                                    stickyTableHeader,
                                    stickyTableHeaderTop
                                  ),
                                }}
                                onClick={
                                  header.column.getCanSort()
                                    ? header.column.getToggleSortingHandler()
                                    : undefined
                                }
                              >
                                {header.isPlaceholder ? null : (
                                  <div
                                    className={cn(
                                      "flex h-full gap-1",
                                      isSelectionCol || isActionsCol
                                        ? "flex-row items-center justify-center"
                                        : "flex-col items-start justify-center"
                                    )}
                                  >
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
                            )
                          })}
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
                          <DataTableRowActionsRowProvider
                            key={row.id}
                            rowId={row.id}
                          >
                            <DataTableRowContextMenu
                              rowId={row.id}
                              enabled={rowContextMenuEnabled}
                              data-depth={row.depth}
                              className={dataTableRowBodyClassName({
                                rowIndex: row.index,
                                isSelected: row.getIsSelected(),
                                extra: getRowClassName?.(row),
                              })}
                              style={{
                                borderLeft:
                                  row.depth > 0
                                    ? `3px solid hsl(var(--primary) / ${0.15 + row.depth * 0.1})`
                                    : undefined,
                              }}
                            >
                              {row.getVisibleCells().map((cell) => {
                                const colIndex = cell.column.getIndex()
                                // Cột dữ liệu đầu tiên — sau checkbox, STT, expander (theo thứ tự đó).
                                const firstDataColumnIndex =
                                  (rowSelectionActive ? 1 : 0) +
                                  (indexColumnEnabled ? 1 : 0) +
                                  (getSubRows ? 1 : 0)
                                const indent =
                                  getSubRows &&
                                  colIndex === firstDataColumnIndex
                                    ? row.depth * 24
                                    : 0
                                const isSelectionCol =
                                  cell.column.id ===
                                  DATA_TABLE_SELECTION_COLUMN_ID
                                const cellMeta = cell.column.columnDef.meta as
                                  | ColumnMeta
                                  | undefined
                                const isActionsCol = isDataTableActionsColumn(
                                  cell.column.id,
                                  cellMeta
                                )
                                const isPinnedCol =
                                  isSelectionCol || isActionsCol
                                return (
                                  <TableCell
                                    key={cell.id}
                                    className={cn(
                                      dataTableCellWidthClassName(
                                        cell.column.id,
                                        cellMeta,
                                        cell.column.columnDef
                                      ),
                                      isPinnedCol &&
                                        stickyPinnedBodyCellClassName({
                                          rowIndex: row.index,
                                          isSelected: row.getIsSelected(),
                                          side: isSelectionCol
                                            ? "left"
                                            : "right",
                                        }),
                                      isSelectionCol && "px-0",
                                      isActionsCol && "px-1"
                                    )}
                                    style={{
                                      ...(isSelectionCol
                                        ? selectionColumnBoxStyle(
                                            resolvedSelectionColumnWidth
                                          )
                                        : columnSizeBoxStyle(cell.column)),
                                      paddingLeft:
                                        indent > 0
                                          ? `calc(0.5rem + ${indent}px)`
                                          : undefined,
                                    }}
                                  >
                                    {(() => {
                                      const cellContent = flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )
                                      const clampClass =
                                        dataTableCellContentClampClassName(
                                          cell.column.id,
                                          cellMeta
                                        )
                                      if (!clampClass) return cellContent
                                      return (
                                        <div className={clampClass}>
                                          {cellContent}
                                        </div>
                                      )
                                    })()}
                                  </TableCell>
                                )
                              })}
                            </DataTableRowContextMenu>
                          </DataTableRowActionsRowProvider>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </DataTableHorizontalScroll>
            </DataTableScopeProvider>
          </DataTableRowActionsRegistryProvider>
          {showTableFooter ? (
            <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/15 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
              {footer ? (
                <div className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {footer}
                </div>
              ) : null}
              <div
                className={cn(
                  "min-w-0",
                  footer ? "shrink-0" : "w-full"
                )}
              >
                {paginationFooter}
              </div>
            </div>
          ) : null}
        </FieldSetContent>
      </FieldSet>

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

  const title = confirmAction
    ? resolveBulkActionConfirmTitle(confirmAction)
    : "Xác nhận thao tác"

  const description = confirmAction
    ? resolveBulkActionConfirmDescription(
        confirmAction,
        selectedCount,
        selectedRows
      )
    : null

  const confirmLabel = confirmAction
    ? resolveBulkActionConfirmLabel(confirmAction)
    : "Xác nhận"

  const isDestructive = confirmAction
    ? resolveBulkActionConfirmDestructive(confirmAction)
    : false

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
