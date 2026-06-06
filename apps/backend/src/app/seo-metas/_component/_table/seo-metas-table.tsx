"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table"
import type { SeoMetaRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin";

export interface SeoMetasTableProps {
  data: SeoMetaRow[]
  columns: ColumnDef<SeoMetaRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete?: (rows: SeoMetaRow[]) => Promise<void>
  onBulkRestore?: (rows: SeoMetaRow[]) => Promise<void>
  onBulkPurge?: (rows: SeoMetaRow[]) => Promise<void>
  onRowPrefetch?: (row: SeoMetaRow) => void
}

export function SeoMetasTable({
  data,
  columns,
  isLoading,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  total,
  onClearFilters,
  onBulkDelete,
  onBulkRestore,
  onBulkPurge,
  onRowPrefetch,
}: SeoMetasTableProps) {
  const bulkActions = [
    ...(onBulkRestore
      ? [
          {
            id: "bulk-seo-meta-restore" as const,
            label: "Khôi phục đã chọn",
            variant: "outline" as const,
            confirm: {
              title: "Khôi phục các SEO metadata đã chọn?",
              description: (rows: SeoMetaRow[]) =>
                `Bạn đã chọn ${rows.length} mục. Các mục sẽ được khôi phục.`,
              confirmLabel: "Khôi phục",
            },
            onAction: onBulkRestore,
          },
        ]
      : []),
    ...(onBulkDelete
      ? [
          {
            id: "bulk-seo-meta-delete" as const,
            label: "Xóa tạm đã chọn",
            variant: "destructive" as const,
            confirm: {
              title: "Đưa các SEO metadata đã chọn vào thùng rác?",
              description: (rows: SeoMetaRow[]) =>
                `Bạn đã chọn ${rows.length} mục. Các mục sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
              confirmLabel: "Xóa tạm",
              destructive: true,
            },
            onAction: onBulkDelete,
          },
        ]
      : []),
    ...(onBulkPurge
      ? [
          {
            id: "bulk-seo-meta-purge" as const,
            label: "Xóa vĩnh viễn đã chọn",
            variant: "destructive" as const,
            confirm: {
              title: "Xóa vĩnh viễn các SEO metadata đã chọn?",
              description: (rows: SeoMetaRow[]) =>
                `Bạn đã chọn ${rows.length} mục. Hành động này không thể hoàn tác!`,
              confirmLabel: "Xóa vĩnh viễn",
              destructive: true,
            },
            onAction: onBulkPurge,
          },
        ]
      : []),
  ];

  return (
    <AdminDataTable<SeoMetaRow>
      tableScope="seo-metas"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có SEO metadata — bấm "Thêm SEO".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo đường dẫn..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch
          ? (row) => onRowPrefetch(row.original)
          : undefined
      }
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("seo-metas", { pageCount: data.length, total })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={bulkActions}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} SEO metadata`}
          </p>
        </div>
      }
    />
  )
}
