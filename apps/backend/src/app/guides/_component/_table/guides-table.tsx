"use client";

import { useState } from "react";
import type { ColumnDef, ColumnFiltersState, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { AdminDataTable } from "@ui/components/data-table"
import type { GuideGroup } from "../types";
import { buildAdminTableXlsxExport } from "@ui/components/admin";

export interface GuidesTableProps {
  data: GuideGroup[];
  columns: ColumnDef<GuideGroup>[];
  isLoading: boolean;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  globalFilter: string;
  onGlobalFilterChange: OnChangeFn<string>;
  total: number;
  onClearFilters: () => void;
  onBulkPurge: (rows: GuideGroup[]) => Promise<void>;
}

export function GuidesTable({
  data,
  columns,
  isLoading,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  total,
  onClearFilters,
  onBulkPurge,
}: GuidesTableProps) {
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});

  return (
    <AdminDataTable<GuideGroup>
      data={data}
      getRowId={(row) => String(row.id)}
      defaultExpandedAll={false}
      columns={columns}
      isLoading={isLoading}
      emptyLabel="Chưa có nhóm hướng dẫn nào."
      manualFiltering
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      globalFilterPlaceholder="Tìm theo section key, tiêu đề..."
      onClearFilters={onClearFilters}
      clearFiltersVariant="destructive"
      rowSelectionEnabled
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={setSelectedRowIds}
      bulkActions={[
        {
          id: "bulk-guide-purge",
          label: "Xóa vĩnh viễn đã chọn",
          variant: "destructive",
          onAction: async (rows) => {
            await onBulkPurge(rows);
          },
        },
      ]}
      xlsxExport={buildAdminTableXlsxExport("guides", { pageCount: data.length, total })}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `Tổng ${total} nhóm hướng dẫn`}
          </p>
        </div>
      }
    />
  );
}
