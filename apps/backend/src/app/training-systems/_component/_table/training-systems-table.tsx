"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table"
import type { TrainingSystemRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin";

export interface TrainingSystemsTableProps {
  data: TrainingSystemRow[]
  columns: ColumnDef<TrainingSystemRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete: (rows: TrainingSystemRow[]) => Promise<void>
  onBulkPurge: (rows: TrainingSystemRow[]) => Promise<void>
  onRowPrefetch?: (row: TrainingSystemRow) => void
}

export function TrainingSystemsTable({
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
}: TrainingSystemsTableProps) {
  return (
    <AdminDataTable<TrainingSystemRow>
      tableScope="training-systems"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có hệ đào tạo — bấm "Thêm hệ đào tạo".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên hoặc mã..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch
          ? (row) => onRowPrefetch(row.original)
          : undefined
      }
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("training-systems", { pageCount: data.length, total })}      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-training-system-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các hệ đào tạo đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} hệ đào tạo. Các hệ đào tạo sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-training-system-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các hệ đào tạo đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} hệ đào tạo. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} hệ đào tạo`}
          </p>
        </div>
      }
    />
  )
}
