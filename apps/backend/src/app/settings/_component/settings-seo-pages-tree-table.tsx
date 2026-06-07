"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import { AdminDataTable, adminTableRowSelectionProps } from "@ui/components/data-table"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import type { SeoMetaTreeRow } from "./settings-seo-pages-tree"
import { isSeoMetaTreeDataRow } from "./settings-seo-pages-tree"

export interface SettingsSeoPagesTreeTableProps {
  data: SeoMetaTreeRow[]
  columns: ColumnDef<SeoMetaTreeRow>[]
  isLoading: boolean
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  selectedRowIds: RowSelectionState
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>
  leafTotal: number
  onClearFilters: () => void
  onBulkDelete?: (rows: SeoMetaTreeRow[]) => Promise<void>
  onBulkPurge?: (rows: SeoMetaTreeRow[]) => Promise<void>
  onRowPrefetch?: (row: SeoMetaTreeRow) => void
}

export function SettingsSeoPagesTreeTable({
  data,
  columns,
  isLoading,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  leafTotal,
  onClearFilters,
  onBulkDelete,
  onBulkPurge,
  onRowPrefetch,
}: SettingsSeoPagesTreeTableProps) {
  const bulkActions = [
    ...(onBulkDelete
      ? [
          {
            id: "bulk-seo-page-delete" as const,
            label: "Xóa tạm đã chọn",
            variant: "destructive" as const,
            confirm: {
              title: "Đưa các SEO trang đã chọn vào thùng rác?",
              description: (rows: SeoMetaTreeRow[]) =>
                `Bạn đã chọn ${rows.length} trang. Các mục sẽ được chuyển vào thùng rác và có thể khôi phục sau.`,
              confirmLabel: "Xóa tạm",
              destructive: true,
            },
            onAction: onBulkDelete,
          },
        ]
      : []),
    ...(onBulkPurge
      ? [
          {
            id: "bulk-seo-page-purge" as const,
            label: "Xóa vĩnh viễn đã chọn",
            variant: "destructive" as const,
            confirm: {
              title: "Xóa vĩnh viễn các SEO trang đã chọn?",
              description: (rows: SeoMetaTreeRow[]) =>
                `Bạn đã chọn ${rows.length} trang. Hành động này không thể hoàn tác!`,
              confirmLabel: "Xóa vĩnh viễn",
              destructive: true,
            },
            onAction: onBulkPurge,
          },
        ]
      : []),
  ]

  return (
    <AdminDataTable<SeoMetaTreeRow>
      tableScope="settings-seo-pages"
      data={data}
      getRowId={(row) => row.id}
      getSubRows={(row) => row.subRows}
      defaultExpandedAll
      filterFromLeafRows
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Chưa có SEO theo trang — dùng gắn nhanh hoặc thêm SEO trang."
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo nhóm, đường dẫn, title..."
      onClearFilters={onClearFilters}
      onRowPointerEnter={
        onRowPrefetch
          ? (row) => {
              if (isSeoMetaTreeDataRow(row.original)) {
                onRowPrefetch(row.original)
              }
            }
          : undefined
      }
      clearFiltersVariant="destructive"
      xlsxExport={buildAdminTableXlsxExport("seo-metas", {
        pageCount: leafTotal,
        total: leafTotal,
      })}
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      canSelectRow={(row) => isSeoMetaTreeDataRow(row.original)}
      bulkActions={bulkActions}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Đang tải..."
              : `${leafTotal} trang đã cấu hình · hiển thị dạng cây route`}
          </p>
        </div>
      }
    />
  )
}
