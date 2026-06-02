"use client"
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@ui/components/data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import type { CameraRow } from "../types"
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";
export function CamerasTable({
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
  data: CameraRow[]
  columns: ColumnDef<CameraRow>[]
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
  onBulkDelete: (rows: CameraRow[]) => Promise<void>
  onBulkPurge: (rows: CameraRow[]) => Promise<void>
  isFetching?: boolean
}) {
  return (
    <AdminDataTable<CameraRow>
      data={data}
      getRowId={(r) => r.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có camera — bấm "Thêm camera".'
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:cameras-list"
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
      xlsxExport={buildAdminTableXlsxExport("cameras", { pageCount: data.length, total })}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-camera-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa camera?",
            description: (rows) => `${rows.length} camera sẽ vào thùng rác.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-camera-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các camera đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} camera. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Đang tải..." : `Tổng ${total} camera`}
        </p>
      }
    />
  )
}
