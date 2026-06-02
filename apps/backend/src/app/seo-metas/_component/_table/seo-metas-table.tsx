"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@ui/components/data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import { RefreshCw, FilterX } from "lucide-react"
import type { SeoMetaRow } from "../types"
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";

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
  onRefresh: () => void
  onClearFilters: () => void
  onBulkDelete: (rows: SeoMetaRow[]) => Promise<void>
  onBulkPurge: (rows: SeoMetaRow[]) => Promise<void>
  isFetching?: boolean
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
  onRefresh,
  onClearFilters,
  onBulkDelete,
  onBulkPurge,
  isFetching,
}: SeoMetasTableProps) {
  return (
    <AdminDataTable<SeoMetaRow>
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có SEO metadata — bấm "Thêm SEO".'
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:seo-metas-list"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo đường dẫn..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      xlsxExport={buildAdminTableXlsxExport("seo-metas", { pageCount: data.length, total })}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-seo-meta-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các SEO metadata đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} mục. Các mục sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-seo-meta-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các SEO metadata đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} mục. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
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
