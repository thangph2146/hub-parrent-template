"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@/components/admin-data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import { RefreshCw, FilterX } from "lucide-react"
import type { DepartmentRow } from "../types"

export interface DepartmentsTableProps {
  data: DepartmentRow[]
  columns: ColumnDef<DepartmentRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onRefresh: () => void
  onClearFilters: () => void
  onBulkDelete: (rows: DepartmentRow[]) => Promise<void>
  isFetching?: boolean
}

export function DepartmentsTable({
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
  onRefresh,
  onClearFilters,
  onBulkDelete,
  isFetching,
}: DepartmentsTableProps) {
  return (
    <AdminDataTable<DepartmentRow>
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có phòng khoa — bấm "Thêm phòng khoa".'
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:departments-list"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên hoặc mã..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      csvExport={{ fileName: "phong-khoa.csv" }}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-department-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các phòng khoa đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} phòng khoa. Các phòng khoa sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} phòng khoa`}
          </p>
        </div>
      }
    />
  )
}
