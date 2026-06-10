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
import type { SpeakerRow } from "../types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import {
  createAdminTrashExportFetchPage,
  type AdminTrashExportParams,
} from "@/lib/admin/admin-trash-export"

export interface SpeakersTrashTableProps {
  data: SpeakerRow[]
  columns: ColumnDef<SpeakerRow>[]
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
  onBulkRestore: (rows: SpeakerRow[]) => Promise<void>
  onBulkPurge: (rows: SpeakerRow[]) => Promise<void>
  manualFiltering?: boolean
  trashExportParams?: AdminTrashExportParams
}

export function SpeakersTrashTable({
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
  manualFiltering: manualFilteringProp,
  trashExportParams,
}: SpeakersTrashTableProps) {
  return (
    <AdminDataTable<SpeakerRow>
      tableScope="speakers-trash"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Thùng rác trống."
      manualFiltering={manualFilteringProp}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm trong thùng rác..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("speakers-trash", {
        pageCount: data.length,
        total,
      })}
      exportFetchPage={
        trashExportParams
          ? createAdminTrashExportFetchPage<SpeakerRow>(
              (params) => api.speakers.list<SpeakerRow>(params),
              trashExportParams
            )
          : undefined
      }
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-speaker-restore",
          label: "Khôi phục đã chọn",
          variant: "default",
          confirm: {
            title: "Khôi phục các diễn giả đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} diễn giả. Các diễn giả sẽ được đưa trở lại danh sách đang hoạt động.`,
            confirmLabel: "Khôi phục",
          },
          onAction: onBulkRestore,
        },
        {
          id: "bulk-speaker-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các diễn giả đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} diễn giả. Hành động này không thể hoàn tác.`,
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
        emptySummary: "Không có diễn giả trong thùng rác",
        itemLabel: "diễn giả",
      }}
    />
  )
}
