"use client"

import {
  AdminDataTable,
  type AdminDataTableProps,
} from "@ui/components/data-table"

/** Bảng điểm nhúng trong dialog — chỉ hiển thị dữ liệu, không toolbar/lọc. */
export function MyStudentsScoreTable<TData>(
  props: AdminDataTableProps<TData>
) {
  const { ...rest } = props
  return (
    <AdminDataTable
      {...rest}
      showTableToolbar={false}
      showColumnFilters={false}
      showTableColumnPicker={false}
    />
  )
}
