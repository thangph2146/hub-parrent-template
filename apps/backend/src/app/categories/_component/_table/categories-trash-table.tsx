"use client";

import type { ColumnDef, ColumnFiltersState, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import { AdminDataTable } from "@ui/components/data-table"
import { AdminTablePaginationFooter } from "@/components/admin-table-pagination-footer";
import type { CategoryRow } from "../types";
import { buildAdminTableXlsxExport } from "@/lib/admin-table-xlsx-export";

export interface CategoriesTrashTableProps {
  data: CategoryRow[];
  columns: ColumnDef<CategoryRow>[];
  isLoading: boolean;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  globalFilter: string;
  onGlobalFilterChange: OnChangeFn<string>;
  selectedRowIds: RowSelectionState;
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onClearFilters: () => void;
  onBulkRestore: (rows: CategoryRow[]) => Promise<void>;
  onBulkPurge: (rows: CategoryRow[]) => Promise<void>;
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
}: CategoriesTrashTableProps) {
  return (
    <AdminDataTable<CategoryRow>
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
      xlsxExport={buildAdminTableXlsxExport("categories-trash", { pageCount: data.length, total })}
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={onSelectedRowIdsChange}
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
      footer={
        <AdminTablePaginationFooter
          page={page}
          pageSize={pageSize}
          total={total}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          emptySummary="Không có danh mục trong thùng rác"
          itemLabel="danh mục"
        />
      }
    />
  );
}
