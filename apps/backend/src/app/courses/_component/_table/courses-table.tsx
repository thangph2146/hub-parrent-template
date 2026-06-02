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
import type { CourseRow } from "../types"

export interface CoursesTableProps {
  data: CourseRow[]
  columns: ColumnDef<CourseRow>[]
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
  onBulkDelete: (rows: CourseRow[]) => Promise<void>
  isFetching?: boolean
}

export function CoursesTable({
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
}: CoursesTableProps) {
  return (
    <AdminDataTable<CourseRow>
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có khóa học — bấm "Thêm khóa học".'
      manualFiltering
      filterColumnVisibilityKey="admin-table-filter-visibility:courses-list"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      csvExport={{ fileName: "khoa-hoc.csv" }}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={[
        {
          id: "bulk-course-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các khóa học đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} khóa học. Các khóa học sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} khóa học`}
          </p>
        </div>
      }
    />
  )
}
