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
import type { LocationRow } from "../shared/types"
import { buildAdminTableXlsxExport } from "@ui/components/admin"

export interface LocationsTableProps {
  data: LocationRow[]
  columns: ColumnDef<LocationRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  total: number
  onClearFilters: () => void
  onBulkDelete: (rows: LocationRow[]) => Promise<void>
  onBulkPurge: (rows: LocationRow[]) => Promise<void>
  onRowPrefetch?: (row: LocationRow) => void
}

export function LocationsTable({
  data,
  columns,
  isLoading,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  total,
  onClearFilters,
  onBulkDelete,
  onBulkPurge,
  onRowPrefetch,
}: LocationsTableProps) {
  return (
    <AdminDataTable<LocationRow>
      tableScope="locations"
      data={data}
      getRowId={(row) => row.id}
      columns={columns}
      isLoading={isLoading}
      emptyLabel='Chưa có địa điểm — bấm "Thêm địa điểm".'
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo tên..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch ? (row) => onRowPrefetch(row.original) : undefined
      }
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("locations", {
        pageCount: data.length,
        total,
      })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={[
        {
          id: "bulk-location-delete",
          label: "Xóa tạm đã chọn",
          variant: "destructive",
          confirm: {
            title: "Đưa các địa điểm đã chọn vào thùng rác?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} địa điểm. Các địa điểm sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
            confirmLabel: "Xóa tạm",
            destructive: true,
          },
          onAction: onBulkDelete,
        },
        {
          id: "bulk-location-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          confirm: {
            title: "Xóa vĩnh viễn các địa điểm đã chọn?",
            description: (rows) =>
              `Bạn đã chọn ${rows.length} địa điểm. Hành động này không thể hoàn tác!`,
            confirmLabel: "Xóa vĩnh viễn",
            destructive: true,
          },
          onAction: onBulkPurge,
        },
      ]}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} địa điểm`}
          </p>
        </div>
      }
    />
  )
}
