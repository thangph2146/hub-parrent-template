"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@/components/admin-data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import { AdminTablePaginationFooter } from "@/components/admin-table-pagination-footer"
import { FilterX, RefreshCw } from "lucide-react"
import type { TrainingLevelRow } from "../types"

export interface TrainingLevelsTrashTableProps {
  data: TrainingLevelRow[]
  columns: ColumnDef<TrainingLevelRow>[]
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
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onRefresh: () => void
  onClearFilters: () => void
  onBulkRestore: (rows: TrainingLevelRow[]) => Promise<void>
  onBulkPurge: (rows: TrainingLevelRow[]) => Promise<void>
  isFetching?: boolean
}

export function TrainingLevelsTrashTable({
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
  onRefresh,
  onClearFilters,
  onBulkRestore,
  onBulkPurge,
  isFetching,
}: TrainingLevelsTrashTableProps) {
  return (
    <AdminDataTable<TrainingLevelRow>
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống."
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:training-levels-trash"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm trong thùng rác..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      csvExport={{ fileName: "bac-hoc-thung-rac.csv" }}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-training-level-restore",
          label: "Khôi phục đã chọn",
          variant: "default",
          confirm: {
            title: "Khôi phục các bậc học đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} bậc học. Các bậc học sẽ được đưa trở lại danh sách đang hoạt động.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-training-level-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các bậc học đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} bậc học. Hành động này không thể hoàn tác.`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <AdminTablePaginationFooter
          page={page}
          pageSize={pageSize}
          total={total}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          emptySummary="Không có bậc học trong thùng rác"
          itemLabel="bậc học"
        />
      }
    />
  )
}
