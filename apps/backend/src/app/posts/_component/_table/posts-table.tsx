"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table"
import type { PostListRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin";
import { api } from "@/lib/api";

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
  onClearFilters: () => void
  onBulkDelete: (rows: PostListRow[]) => Promise<void>
  onBulkPurge: (rows: PostListRow[]) => Promise<void>
  canExport?: boolean
  canDelete?: boolean
  listQuery: {
    search?: string
    filters?: Record<string, unknown>
  }
  onRowPrefetch?: (row: PostListRow) => void
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
  onClearFilters,
  onBulkDelete,
  onBulkPurge,
  canExport,
  canDelete,
  listQuery,
  onRowPrefetch,
}: PostsTableProps) {
  return (
    <AdminDataTable<PostListRow>
      tableScope="posts"
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
      onRowPointerEnter={
        onRowPrefetch
          ? (row) => onRowPrefetch(row.original)
          : undefined
      }
      clearFiltersVariant="destructive"
      xlsxExport={canExport ? buildAdminTableXlsxExport("posts", { pageCount: data.length, total }) : undefined}
      exportFetchPage={
        canExport
          ? async ({ page: exportPage, limit }) => {
              const filterQuery = Object.fromEntries(
                Object.entries(listQuery.filters ?? {}).map(([key, value]) => [
                  `filter[${key}]`,
                  value as string | number | boolean | undefined | null,
                ]),
              );
              const result = await api.posts.list<PostListRow>({
                page: exportPage,
                limit,
                search: listQuery.search,
                status: "active",
                ...filterQuery,
              });
              return { items: result.items, total: result.total };
            }
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
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
      pagination={{
        page,
        pageSize,
        total,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary: "Không có bài viết",
        itemLabel: "bài viết",
      }}
    />
  )
}
