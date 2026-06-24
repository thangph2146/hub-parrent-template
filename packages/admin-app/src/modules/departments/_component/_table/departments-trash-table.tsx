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
import type { DepartmentRow } from "../shared/types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import {
  createAdminTrashExportFetchPage,
  type AdminTrashExportParams,
} from "@workspace/admin-app/lib/admin-trash-export"

export interface DepartmentsTrashTableProps {
  data: DepartmentRow[]
  columns: ColumnDef<DepartmentRow>[]
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
  onBulkRestore: (rows: DepartmentRow[]) => Promise<void>
  onBulkPurge: (rows: DepartmentRow[]) => Promise<void>
  trashExportParams?: AdminTrashExportParams
}

export function DepartmentsTrashTable({
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
}: DepartmentsTrashTableProps) {
  const api = useAdminApi()
  return (
    <AdminDataTable<DepartmentRow>
      tableScope="departments-trash"
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
      xlsxExport={buildAdminTableXlsxExport("departments-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={
        trashExportParams
          ? createAdminTrashExportFetchPage<DepartmentRow>(
              (params) => api.departments.list<DepartmentRow>(params),
              trashExportParams
            )
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-department-restore",
          label: "Khôi phục đã chọn",
          variant: "default",
          confirm: {
            title: "Khôi phục các phòng khoa đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} phòng khoa. Các phòng khoa sẽ được đưa trở lại danh sách đang hoạt động.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-department-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các phòng khoa đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} phòng khoa. Hành động này không thể hoàn tác.`,
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
        emptySummary: "Không có phòng khoa trong thùng rác",
        itemLabel: "phòng khoa",
      }}
    />
  )
}
