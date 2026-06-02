"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
  Row,
} from "@tanstack/react-table"
import { Button } from "@ui/components/button"
import { AdminDataTable } from "@ui/components/data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import { RefreshCw, FilterX } from "lucide-react"
import type { CategoryRow } from "../types"
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";

export interface CategoriesTableProps {
  data: CategoryRow[]
  columns: ColumnDef<CategoryRow>[]
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
  onBulkDelete: (rows: CategoryRow[]) => Promise<void>
  onBulkPurge: (rows: CategoryRow[]) => Promise<void>
  isFetching?: boolean
  canSelectRow?: (row: Row<CategoryRow>) => boolean
}

export function CategoriesTable({
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
  canSelectRow,
}: CategoriesTableProps) {
  return (
    <AdminDataTable<CategoryRow>
      data={data}
      getRowId={(row) => String(row.id)}
      getSubRows={(row) => (row as CategoryRow).subRows}
      defaultExpandedAll
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có danh mục — bấm "Thêm danh mục".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên, slug, mô tả..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      xlsxExport={buildAdminTableXlsxExport("categories", { pageCount: data.length, total })}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      canSelectRow={canSelectRow}
      bulkActions={[
        {
          id: "bulk-category-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các danh mục đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} danh mục. Các danh mục sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-category-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các danh mục đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} danh mục. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} danh mục`}
          </p>
        </div>
      }
    />
  )
}
