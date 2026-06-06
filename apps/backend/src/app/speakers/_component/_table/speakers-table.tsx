"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table"
import type { SpeakerRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin";

export interface SpeakersTableProps {
  data: SpeakerRow[]
  columns: ColumnDef<SpeakerRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete: (rows: SpeakerRow[]) => Promise<void>
  onBulkPurge: (rows: SpeakerRow[]) => Promise<void>
  manualFiltering?: boolean
  onRowPrefetch?: (row: SpeakerRow) => void
}

export function SpeakersTable({
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
  manualFiltering: manualFilteringProp,
  onRowPrefetch,
}: SpeakersTableProps) {
  return (
    <AdminDataTable<SpeakerRow>
      tableScope="speakers"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có diễn giả — bấm "Thêm diễn giả".'
      manualFiltering={manualFilteringProp}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch
          ? (row) => onRowPrefetch(row.original)
          : undefined
      }
      xlsxExport={buildAdminTableXlsxExport("speakers", { pageCount: data.length, total })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-speaker-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các diễn giả đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} diễn giả. Các diễn giả sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-speaker-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các diễn giả đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} diễn giả. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} diễn giả`}
          </p>
        </div>
      }
    />
  )
}
