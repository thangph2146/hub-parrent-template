"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
} from "@tanstack/react-table"
import { AdminDataTable } from "@ui/components/data-table"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import type { MyStudentRow } from "../types"
import { getMyStudentGlobalFilterText } from "../columns"

export interface MyStudentsTableProps {
  data: MyStudentRow[]
  columns: ColumnDef<MyStudentRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  onClearFilters: () => void
  filterToolbarExtra?: React.ReactNode
}

export function MyStudentsTable({
  data,
  columns,
  isLoading,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  onClearFilters,
  filterToolbarExtra,
}: MyStudentsTableProps) {
  return (
    <AdminDataTable<MyStudentRow>
      tableScope="my-students"
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Chưa có liên kết sinh viên nào."
      getGlobalFilterText={getMyStudentGlobalFilterText}
      globalFilterPlaceholder="Tìm mã sinh viên, họ tên, ghi chú…"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={filterToolbarExtra}
      tableColumnVisibilityKey="my-students-table-columns"
      xlsxExport={buildAdminTableXlsxExport("my-students", {
        pageCount: data.length,
        total: data.length,
      })}
      clientPagination={{
        initialPageSize: 15,
        itemLabel: "liên kết",
        emptySummary: "Chưa có liên kết",
        isLoading,
      }}
    />
  )
}
