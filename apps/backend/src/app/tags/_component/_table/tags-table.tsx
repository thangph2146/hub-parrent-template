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
import type { TagTreeRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"

export interface TagsTableProps {
  data: TagTreeRow[]
  columns: ColumnDef<TagTreeRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete: (rows: TagTreeRow[]) => Promise<void>
  onBulkPurge: (rows: TagTreeRow[]) => Promise<void>
  onRowPrefetch?: (row: TagTreeRow) => void
}

export function TagsTable({
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
}: TagsTableProps) {
  return (
    <AdminDataTable<TagTreeRow>
      tableScope="tags"
      data={data}
      getRowId={(row) => String(row.id)}
      getSubRows={(row) => row.subRows}
      defaultExpandedAll
      filterFromLeafRows
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có thẻ — bấm "Thêm thẻ".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên nhóm, tên thẻ hoặc slug..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch ? (row) => onRowPrefetch(row.original) : undefined
      }
      xlsxExport={buildAdminTableXlsxExport("tags", {
        pageCount: data.length,
        total,
      })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      canSelectRow={(row) => !row.original.isGroup}
      bulkActions={[
        {
          id: "bulk-tag-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các thẻ đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} thẻ. Các thẻ sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-tag-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các thẻ đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} thẻ. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} thẻ`}
          </p>
        </div>
      }
    />
  )
}
