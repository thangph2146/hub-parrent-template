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
import type { ProductRow } from "../shared/types"

export function ProductsTable({
  data,
  columns,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  globalFilter,
  onGlobalFilterChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  onClearFilters,
  onBulkDelete,
  onRowPrefetch,
}: {
  data: ProductRow[]
  columns: ColumnDef<ProductRow>[]
  isLoading: boolean
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  onClearFilters: () => void
  onBulkDelete?: (rows: ProductRow[]) => Promise<void>
  onRowPrefetch?: (row: ProductRow) => void
}) {
  return (
    <AdminDataTable<ProductRow>
      tableScope="products"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có sản phẩm — bấm "Thêm sản phẩm".'
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      onClearFilters={onClearFilters}
      pagination={{
        mode: "server",
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
      }}
      onRowPointerEnter={
        onRowPrefetch ? (row) => onRowPrefetch(row.original) : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={
        onBulkDelete
          ? [
              {
                id: "bulk-product-delete",
                label: "Xóa tạm đã chọn",
                variant: "destructive" as const,
                confirm: {
                  title: "Đưa các sản phẩm đã chọn vào thùng rác?",
                  description: (rows: ProductRow[]) =>
                    `Bạn đã chọn ${rows.length} sản phẩm.`,
                  confirmLabel: "Xóa tạm",
                  destructive: true,
                },
                onAction: onBulkDelete,
              },
            ]
          : undefined
      }
    />
  )
}
