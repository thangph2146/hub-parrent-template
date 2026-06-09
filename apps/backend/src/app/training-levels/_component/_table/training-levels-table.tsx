"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
} from "@ui/components/data-table"
import type { TrainingLevelRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"

export interface TrainingLevelsTableProps {
  data: TrainingLevelRow[]
  columns: ColumnDef<TrainingLevelRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete: (rows: TrainingLevelRow[]) => Promise<void>
  onBulkPurge: (rows: TrainingLevelRow[]) => Promise<void>
  onRowPrefetch?: (row: TrainingLevelRow) => void
}

export function TrainingLevelsTable({
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
  onBulkPurge,
  onRowPrefetch,
}: TrainingLevelsTableProps) {
  return (
    <AdminDataTable<TrainingLevelRow>
      tableScope="training-levels"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có bậc học — bấm "Thêm bậc học".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên hoặc mã..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch ? (row) => onRowPrefetch(row.original) : undefined
      }
      xlsxExport={buildAdminTableXlsxExport("training-levels", {
        pageCount: data.length,
        total,
      })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-training-level-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các bậc học đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} bậc học. Các bậc học sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-training-level-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các bậc học đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} bậc học. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} bậc học`}
          </p>
        </div>
      }
    />
  )
}
