"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { Download, FolderInput, Trash2 } from "lucide-react"
import {
  ADMIN_DATA_TABLE_MAX_PAGE_SIZE,
  AdminDataTable,
  adminTableRowSelectionProps,
  type AdminDataTableBulkAction,
} from "@ui/components/data-table"
import { FileStorageTabEmpty } from "../browse/file-storage-empty"
import type { FileStorageRow } from "../shared/types"

export type FileStorageTableProps = {
  tableScope: string
  data: FileStorageRow[]
  columns: ColumnDef<FileStorageRow>[]
  isLoading: boolean
  isFetching?: boolean
  emptyLabel: string
  itemLabel: string
  emptySummary: string
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  onClearFilters: () => void
  onBulkDelete: (rows: FileStorageRow[]) => Promise<void>
  onBulkDownload: (rows: FileStorageRow[]) => Promise<void>
  onBulkMove?: (rows: FileStorageRow[]) => void
  onMoveAllInScope?: () => Promise<void>
  onDeleteAllInTab?: () => Promise<void>
  includeDescendants?: boolean
  canDelete: boolean
  /** Nhãn tab — dùng empty state đẹp khi không có dòng. */
  tabLabel?: string
  canUpload?: boolean
  uploading?: boolean
  onUpload?: () => void
}

export function FileStorageTable({
  tableScope,
  data,
  columns,
  isLoading,
  isFetching = false,
  emptyLabel,
  itemLabel,
  emptySummary,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  columnFilters,
  onColumnFiltersChange,
  onClearFilters,
  onBulkDelete,
  onBulkDownload,
  onBulkMove,
  onMoveAllInScope,
  onDeleteAllInTab,
  includeDescendants = false,
  canDelete,
  tabLabel,
  canUpload = false,
  uploading = false,
  onUpload,
}: FileStorageTableProps) {
  const hasActiveColumnFilters = columnFilters.some((filter) => {
    const value = filter.value
    if (value == null) return false
    if (typeof value === "string") return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  })

  const showTabEmptyState =
    !isLoading &&
    data.length === 0 &&
    Boolean(tabLabel) &&
    !hasActiveColumnFilters

  if (showTabEmptyState) {
    return (
      <FileStorageTabEmpty
        tabLabel={tabLabel!}
        canUpload={canUpload}
        uploading={uploading}
        onUpload={onUpload}
      />
    )
  }

  const bulkActions: AdminDataTableBulkAction<FileStorageRow>[] = [
    {
      id: "download-selected",
      label: "Tải về",
      icon: <Download className="size-4" />,
      onAction: onBulkDownload,
    },
    ...(onBulkMove
      ? [
          {
            id: "move-selected",
            label: "Di chuyển",
            icon: <FolderInput className="size-4" />,
            onAction: async (rows: FileStorageRow[]) => {
              onBulkMove(rows)
            },
          },
          ...(onMoveAllInScope && total > 0
            ? [
                {
                  id: "move-all-in-scope",
                  label: includeDescendants
                    ? "Di chuyển tất cả (gồm subfolder)"
                    : "Di chuyển tất cả trong folder",
                  icon: <FolderInput className="size-4" />,
                  requiresSelection: false,
                  confirm: {
                    title: "Di chuyển toàn bộ file trong phạm vi?",
                    description: () =>
                      `Toàn bộ ${total} ${itemLabel} trong phạm vi hiện tại sẽ được chọn để di chuyển.`,
                    confirmLabel: "Tiếp tục",
                  },
                  onAction: async () => {
                    await onMoveAllInScope()
                  },
                },
              ]
            : []),
        ]
      : []),
    ...(canDelete
      ? [
          {
            id: "delete-selected",
            label: "Xóa",
            icon: <Trash2 className="size-4" />,
            variant: "destructive" as const,
            confirm: {
              title: "Xóa các file đã chọn?",
              description: (rows: FileStorageRow[]) =>
                `Bạn đã chọn ${rows.length} file. Các file sẽ bị xóa vĩnh viễn khỏi kho lưu trữ.`,
              confirmLabel: "Xóa",
              destructive: true,
              dismissOnConfirm: true,
            },
            onAction: onBulkDelete,
          },
          ...(onDeleteAllInTab && total > 0
            ? [
                {
                  id: "delete-all-in-tab",
                  label: "Xóa tất cả trong tab",
                  icon: <Trash2 className="size-4" />,
                  variant: "destructive" as const,
                  requiresSelection: false,
                  confirm: {
                    title: "Xóa tất cả file trong tab này?",
                    description: () =>
                      `Toàn bộ ${total} ${itemLabel} trong tab hiện tại sẽ bị xóa vĩnh viễn. Thao tác chạy trên server (một request), không gửi hàng ngàn request riêng lẻ.`,
                    confirmLabel: "Xóa tất cả",
                    destructive: true,
                    dismissOnConfirm: true,
                  },
                  onAction: async () => {
                    await onDeleteAllInTab()
                  },
                },
              ]
            : []),
        ]
      : []),
  ]

  return (
    <AdminDataTable<FileStorageRow>
      tableScope={tableScope}
      data={data}
      getRowId={(row) => row.relativePath}
      columns={columns}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      manualFiltering
      showIndexColumn
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={bulkActions}
      showColumnFilters
      showTableColumnPicker={false}
      pagination={{
        page,
        pageSize,
        total,
        isLoading: isFetching,
        onPageChange,
        onPageSizeChange,
        emptySummary,
        itemLabel,
        maxPageSize: ADMIN_DATA_TABLE_MAX_PAGE_SIZE,
        showAllPageSizeOption: true,
        pageSizeOptions: [10, 20, 50, 100, 200, 500, 1000],
      }}
    />
  )
}
