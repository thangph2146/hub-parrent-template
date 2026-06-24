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
import type { CourseRow } from "../shared/types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"

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
  onClearFilters: () => void
  onBulkDelete: (rows: CourseRow[]) => Promise<void>
  onBulkPurge: (rows: CourseRow[]) => Promise<void>
  onRowPrefetch?: (row: CourseRow) => void
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
  onClearFilters,
  onBulkDelete,
  onBulkPurge,
  onRowPrefetch,
}: CoursesTableProps) {
  return (
    <AdminDataTable<CourseRow>
      tableScope="courses"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có khóa học — bấm "Thêm khóa học".'
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
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("courses", {
        pageCount: data.length,
        total,
      })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
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
        {
          id: "bulk-course-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các khóa học đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} khóa học. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
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
