"use client"
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@ui/components/data-table"
import type { ScreenRow } from "../types"
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";
export function ScreensTrashTable({
  data,
  columns,
  isLoading,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
  onBulkRestore,
  onBulkPurge,
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
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  onClearFilters: () => void
  onBulkRestore: (rows: ScreenRow[]) => Promise<void>
  onBulkPurge: (rows: ScreenRow[]) => Promise<void>
}) {
  return (
    <AdminDataTable<ScreenRow>
      data={data}
      getRowId={(r) => r.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống."
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:screens-trash"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm trong thùng rác..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("screens-trash", { pageCount: data.length, total })}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-screen-restore",
          label: "Khôi phục",
          variant: "default",
          confirm: {
            title: "Khôi phục?",
            description: (_rows) => `${_rows.length} màn hình.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-screen-purge",
          label: "Xóa vĩnh viễn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn?",
            description: () => `Không thể hoàn tác.`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      pagination={{
        page,
        pageSize,
        total,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary: "Không có màn hình",
        itemLabel: "màn hình",
      }}
    />
  )
}
