"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable } from "@ui/components/data-table"
import { AdminTableToolbarActions } from "@/components/admin-table-toolbar-actions"
import { AdminTablePaginationFooter } from "@/components/admin-table-pagination-footer"
import { RefreshCw, FilterX } from "lucide-react"
import type { PostListRow } from "../types"
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";

export interface PostsTableProps {
  data: PostListRow[]
  columns: ColumnDef<PostListRow>[]
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
  onRefresh: () => void
  onClearFilters: () => void
  onBulkDelete: (rows: PostListRow[]) => Promise<void>
  onBulkPurge: (rows: PostListRow[]) => Promise<void>
  isFetching?: boolean
  canExport?: boolean
  canDelete?: boolean
}

export function PostsTable({
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
  onRefresh,
  onClearFilters,
  onBulkDelete,
  onBulkPurge,
  isFetching,
  canExport,
  canDelete,
}: PostsTableProps) {
  return (
    <AdminDataTable<PostListRow>
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có bài viết — bấm "Thêm bài viết".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tiêu đề, slug..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      filterToolbarExtra={
        <AdminTableToolbarActions
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      }
      xlsxExport={canExport ? buildAdminTableXlsxExport("posts", { pageCount: data.length, total }) : undefined}
      rowSelectionEnabled={!!canDelete}
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
      bulkActions={canDelete ? [
        {
          id: "bulk-post-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các bài viết đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} bài viết. Các bài viết sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-post-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các bài viết đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} bài viết. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ] : []}
      footer={
        <AdminTablePaginationFooter
          page={page}
          pageSize={pageSize}
          total={total}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          emptySummary="Không có bài viết"
          itemLabel="bài viết"
        />
      }
    />
  )
}
