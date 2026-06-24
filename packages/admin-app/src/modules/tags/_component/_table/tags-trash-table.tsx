"use client"
import { useAdminApi } from "@workspace/admin-app/runtime"
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
import type { TagRow } from "../shared/types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import {
  createAdminTrashExportFetchPage,
  type AdminTrashExportParams,
} from "@workspace/admin-app/lib/admin-trash-export"

export interface TagsTrashTableProps {
  data: TagRow[]
  columns: ColumnDef<TagRow>[]
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
  onClearFilters: () => void
  onBulkRestore: (rows: TagRow[]) => Promise<void>
  onBulkPurge: (rows: TagRow[]) => Promise<void>
  trashExportParams?: AdminTrashExportParams
}

export function TagsTrashTable({
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
  trashExportParams,
}: TagsTrashTableProps) {
  const api = useAdminApi()
  return (
    <AdminDataTable<TagRow>
      tableScope="tags-trash"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống."
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm trong thùng rác..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("tags-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={
        trashExportParams
          ? createAdminTrashExportFetchPage<TagRow>(
              (params) => api.tags.list<TagRow>(params),
              trashExportParams
            )
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-tag-restore",
          label: "Khôi phục đã chọn",
          variant: "default",
          confirm: {
            title: "Khôi phục các thẻ đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} thẻ. Các thẻ sẽ được đưa trở lại danh sách đang hoạt động.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-tag-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các thẻ đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} thẻ. Hành động này không thể hoàn tác.`,
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
        emptySummary: "Không có thẻ trong thùng rác",
        itemLabel: "thẻ",
      }}
    />
  )
}
