"use client"
import { useAdminApi } from "@workspace/admin-app/runtime"
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
import type { CameraRow } from "../shared/types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import {
  createAdminTrashExportFetchPage,
  type AdminTrashExportParams,
} from "@workspace/admin-app/lib/admin-trash-export"

export function CamerasTrashTable({
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
}: {
  data: CameraRow[]
  columns: ColumnDef<CameraRow>[]
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
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  onClearFilters: () => void
  onBulkRestore: (rows: CameraRow[]) => Promise<void>
  onBulkPurge: (rows: CameraRow[]) => Promise<void>
  trashExportParams?: AdminTrashExportParams
}) {
  const api = useAdminApi()
  return (
    <AdminDataTable<CameraRow>
      tableScope="cameras-trash"
      data={data}
      getRowId={(r) => r.id}
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
      xlsxExport={buildAdminTableXlsxExport("cameras-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={
        trashExportParams
          ? createAdminTrashExportFetchPage<CameraRow>(
              (params) => api.cameras.list<CameraRow>(params),
              trashExportParams
            )
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-camera-restore",
          label: "Khôi phục",
          variant: "default",
          confirm: {
            title: "Khôi phục?",
            description: (_rows) => `${_rows.length} camera.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-camera-purge",
          label: "Xóa vĩnh viễn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn?",
            description: () => `Không thể hoàn tác.`,
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
        emptySummary: "Không có camera",
        itemLabel: "camera",
      }}
    />
  )
}
