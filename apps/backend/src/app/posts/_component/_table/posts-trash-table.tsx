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

export interface PostsTrashTableProps {
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
  onBulkRestore: (rows: PostListRow[]) => Promise<void>
  onBulkPurge: (rows: PostListRow[]) => Promise<void>
  canExport?: boolean
  canRestore?: boolean
  canDelete?: boolean
  listQuery: {
    search?: string
    filters?: Record<string, unknown>
  }
}

export function PostsTrashTable({
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
  canExport,
  canRestore,
  canDelete,
  listQuery,
}: PostsTrashTableProps) {
  return (
    <AdminDataTable<PostListRow>
      tableScope="posts-trash"
      data={data}
      getRowId={(row) => String(row.id)}
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
      xlsxExport={canExport ? buildAdminTableXlsxExport("posts-trash", { pageCount: data.length, total }) : undefined}
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
                status: "deleted",
                ...filterQuery,
              });
              return { items: result.items, total: result.total };
            }
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        ...(canRestore
          ? [
              {
                id: "bulk-post-restore" as const,
                label: "Khôi phục đã chọn",
                variant: "default" as const,
                confirm: {
                  title: "Khôi phục các bài viết đã chọn?",
                  description: (rows: PostListRow[]) =>
                    `Bạn đã chọn ${rows.length} bài viết. Các bài viết sẽ được khôi phục về danh sách đang hoạt động.`,
                  confirmLabel: "Khôi phục",
                  destructive: false,
                },
                onAction: onBulkRestore,
              },
            ]
          : []),
        ...(canDelete
          ? [
              {
                id: "bulk-post-purge" as const,
                label: "Xóa vĩnh viễn đã chọn",
                variant: "destructive" as const,
                confirm: {
                  title: "Xóa vĩnh viễn các bài viết đã chọn?",
                  description: (rows: PostListRow[]) =>
                    `Bạn đã chọn ${rows.length} bài viết. Hành động này không thể hoàn tác!`,
                  confirmLabel: "Xóa vĩnh viễn",
                  destructive: true,
                },
                onAction: onBulkPurge,
              },
            ]
          : []),
      ]}
      pagination={{
        page,
        pageSize,
        total,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary: "Không có bài viết trong thùng rác",
        itemLabel: "bài viết",
      }}
    />
  )
}
