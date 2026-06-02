"use client"
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@ui/components/data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import type { ScreenRow } from "../types"
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";
export function ScreensTable({
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
}: {
  data: ScreenRow[]
  columns: ColumnDef<ScreenRow>[]
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
  onBulkDelete: (rows: ScreenRow[]) => Promise<void>
  onBulkPurge: (rows: ScreenRow[]) => Promise<void>
  isFetching?: boolean
}) {
  return (
    <AdminDataTable<ScreenRow>
      data={data}
      getRowId={(r) => r.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có màn hình — bấm "Thêm màn hình".'
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:screens-list"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      xlsxExport={buildAdminTableXlsxExport("screens", { pageCount: data.length, total })}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-screen-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa màn hình?",
            description: (rows) => `${rows.length} màn hình sẽ vào thùng rác.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-screen-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các màn hình đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} màn hình. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Đang tải..." : `Tổng ${total} màn hình`}
        </p>
      }
    />
  )
}
