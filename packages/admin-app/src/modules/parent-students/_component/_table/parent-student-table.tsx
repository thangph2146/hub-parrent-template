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
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import { useAdminApi } from "@workspace/admin-app/runtime"

import type { ParentStudent } from "../shared/types"

export interface ParentStudentTableProps {
  data: ParentStudent[]
  columns: ColumnDef<ParentStudent>[]
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
  onBulkApprove: (rows: ParentStudent[]) => Promise<void>
  onBulkReject: (rows: ParentStudent[]) => Promise<void>
  onBulkPurge: (rows: ParentStudent[]) => Promise<void>
  canApprove: boolean
  listQuery: {
    search?: string
    status?: string
    createdAt?: string
  }
}

export function ParentStudentTable({
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
  onBulkApprove,
  onBulkReject,
  onBulkPurge,
  canApprove,
  listQuery,
}: ParentStudentTableProps) {
  const api = useAdminApi()
  const xlsxBase = buildAdminTableXlsxExport("parent-students", {
    pageCount: data.length,
    total,
  })

  return (
    <AdminDataTable<ParentStudent>
      tableScope="parent-students"
      data={data}
      getRowId={(row) => String(row.id)}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Không có yêu cầu nào."
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm mã sinh viên, họ tên, ID phụ huynh…"
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      xlsxExport={xlsxBase}
      exportFetchPage={async ({ page: exportPage, limit }) => {
        const result = await api.parentStudents.list({
          page: exportPage,
          limit,
          search: listQuery.search,
          status: listQuery.status,
          createdAt: listQuery.createdAt,
        })
        return { items: result.items, total: result.total }
      }}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        ...(canApprove
          ? [
              {
                id: "bulk-parent-student-approve" as const,
                label: "Duyệt đã chọn",
                variant: "default" as const,
                confirm: {
                  title: "Duyệt các yêu cầu đã chọn?",
                  description: (rows: ParentStudent[]) =>
                    `Bạn đã chọn ${rows.length} yêu cầu. Các yêu cầu sẽ được duyệt và phụ huynh sẽ được xem bảng điểm.`,
                  confirmLabel: "Duyệt",
                },
                onAction: onBulkApprove,
              },
              {
                id: "bulk-parent-student-reject" as const,
                label: "Từ chối đã chọn",
                variant: "destructive" as const,
                confirm: {
                  title: "Từ chối các yêu cầu đã chọn?",
                  description: (rows: ParentStudent[]) =>
                    `Bạn đã chọn ${rows.length} yêu cầu. Các yêu cầu sẽ bị từ chối và phụ huynh sẽ thấy thông báo.`,
                  confirmLabel: "Từ chối",
                  destructive: true,
                },
                onAction: onBulkReject,
              },
            ]
          : []),
        {
          id: "bulk-parent-student-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các yêu cầu đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} yêu cầu. Hành động này không thể hoàn tác!`,
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
        emptySummary: "Không có yêu cầu",
        itemLabel: "yêu cầu",
      }}
    />
  )
}
