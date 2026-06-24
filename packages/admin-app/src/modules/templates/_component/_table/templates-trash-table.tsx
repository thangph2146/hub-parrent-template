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
import type { TemplateRow } from "../shared/types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import {
  createAdminTrashExportFetchPage,
  type AdminTrashExportParams,
} from "@workspace/admin-app/lib/admin-trash-export"

export function TemplatesTrashTable({
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
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  onClearFilters: () => void
  onBulkRestore: (rows: TemplateRow[]) => Promise<void>
  onBulkPurge: (rows: TemplateRow[]) => Promise<void>
  trashExportParams?: AdminTrashExportParams
}) {
  const api = useAdminApi()
  return (
    <AdminDataTable<TemplateRow>
      tableScope="templates-trash"
      data={data}
      getRowId={(r) => r.id}
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
      xlsxExport={buildAdminTableXlsxExport("templates-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={
        trashExportParams
          ? createAdminTrashExportFetchPage<TemplateRow>(
              (params) => api.templates.list<TemplateRow>(params),
              trashExportParams
            )
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-template-restore",
          label: "Khôi phục",
          variant: "default",
          confirm: {
            title: "Khôi phục?",
            description: (_rows) => `${_rows.length} mẫu.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-template-purge",
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
        emptySummary: "Không có mẫu",
        itemLabel: "mẫu",
      }}
    />
  )
}
