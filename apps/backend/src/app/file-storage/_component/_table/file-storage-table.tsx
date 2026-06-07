"use client";

import type { ColumnDef, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
import {
  AdminDataTable,
  adminTableRowSelectionProps,
  type AdminDataTableBulkAction,
} from "@ui/components/data-table";
import type { FileStorageRow } from "../types";

export type FileStorageTableProps = {
  tableScope: string;
  data: FileStorageRow[];
  columns: ColumnDef<FileStorageRow>[];
  isLoading: boolean;
  emptyLabel: string;
  itemLabel: string;
  emptySummary: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectedRowIds: RowSelectionState;
  onSelectedRowIdsChange: OnChangeFn<RowSelectionState>;
  onBulkDelete: (rows: FileStorageRow[]) => Promise<void>;
  onBulkDownload: (rows: FileStorageRow[]) => Promise<void>;
  canDelete: boolean;
};

export function FileStorageTable({
  tableScope,
  data,
  columns,
  isLoading,
  emptyLabel,
  itemLabel,
  emptySummary,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  onBulkDelete,
  onBulkDownload,
  canDelete,
}: FileStorageTableProps) {
  const bulkActions: AdminDataTableBulkAction<FileStorageRow>[] = [
    {
      id: "download-selected",
      label: "Tải về",
      icon: <Download className="size-4" />,
      onAction: onBulkDownload,
    },
    ...(canDelete
      ? [
          {
            id: "delete-selected",
            label: "Xóa",
            icon: <Trash2 className="size-4" />,
            variant: "destructive" as const,
            confirm: {
              title: "Xóa các file đã chọn?",
              description: (rows: FileStorageRow[]) =>
                `Bạn đã chọn ${rows.length} file. Các file sẽ bị xóa vĩnh viễn khỏi kho lưu trữ.`,
              confirmLabel: "Xóa",
              destructive: true,
            },
            onAction: onBulkDelete,
          },
        ]
      : []),
  ];

  return (
    <AdminDataTable<FileStorageRow>
      tableScope={tableScope}
      data={data}
      getRowId={(row) => row.relativePath}
      columns={columns}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      manualFiltering
      showIndexColumn
      {...adminTableRowSelectionProps(selectedRowIds, onSelectedRowIdsChange)}
      bulkActions={bulkActions}
      showColumnFilters={false}
      showTableColumnPicker={false}
      pagination={{
        page,
        pageSize,
        total,
        isLoading,
        onPageChange,
        onPageSizeChange,
        emptySummary,
        itemLabel,
      }}
    />
  );
}
