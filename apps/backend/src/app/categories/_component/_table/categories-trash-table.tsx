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
import type { CategoryRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import { api } from "@/lib/api"
import { type AdminTrashExportParams } from "@/lib/admin-trash-export"

export interface CategoriesTrashTableProps {
  data: CategoryRow[]
  columns: ColumnDef<CategoryRow>[]
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
  onBulkRestore: (rows: CategoryRow[]) => Promise<void>
  onBulkPurge: (rows: CategoryRow[]) => Promise<void>
  trashExportParams?: AdminTrashExportParams
}

export function CategoriesTrashTable({
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
}: CategoriesTrashTableProps) {
  return (
    <AdminDataTable<CategoryRow>
      tableScope="categories-trash"
      data={data}
      getRowId={(row) => String(row.id)}
      getSubRows={(row) => (row as CategoryRow).subRows}
      defaultExpandedAll
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống hoặc không khớp tìm kiếm."
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên, slug..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("categories-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={
        trashExportParams
          ? async ({ page, limit }) => {
              const result = await api.categories.rawList<CategoryRow>({
                page,
                limit,
                q: trashExportParams.search,
                status: "deleted",
                filters: trashExportParams.filters,
              })
              return { items: result.items, total: result.total }
            }
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-category-restore",
          label: "Khôi phục đã chọn",
          variant: "default",
          confirm: {
            title: "Khôi phục các danh mục đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} danh mục. Các danh mục sẽ được khôi phục về danh sách đang hoạt động.`,
            confirmLabel: "Khôi phục",
            destructive: false,
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-category-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các danh mục đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} danh mục. Hành động này không thể hoàn tác!`,
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
        emptySummary: "Không có danh mục trong thùng rác",
        itemLabel: "danh mục",
      }}
    />
  )
}
