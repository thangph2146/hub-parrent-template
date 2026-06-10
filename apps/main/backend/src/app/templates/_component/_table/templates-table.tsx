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
import type { TemplateRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
export function TemplatesTable({
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
}: {
  data: TemplateRow[]
  columns: ColumnDef<TemplateRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete: (rows: TemplateRow[]) => Promise<void>
  onBulkPurge: (rows: TemplateRow[]) => Promise<void>
  onRowPrefetch?: (row: TemplateRow) => void
}) {
  return (
    <AdminDataTable<TemplateRow>
      tableScope="templates"
      data={data}
      getRowId={(r) => r.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có mẫu — bấm "Thêm mẫu hiển thị".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch ? (row) => onRowPrefetch(row.original) : undefined
      }
      xlsxExport={buildAdminTableXlsxExport("templates", {
        pageCount: data.length,
        total,
      })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-template-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa mẫu?",
            description: (rows) => `${rows.length} mẫu sẽ vào thùng rác.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-template-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các mẫu đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} mẫu. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Đang tải..." : `Tổng ${total} mẫu hiển thị`}
        </p>
      }
    />
  )
}
