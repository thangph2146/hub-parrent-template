"use client";

import { defineAdminCrudActionsColumn, defineAdminTrashActionsColumn } from "@ui/components/admin";

import type { ColumnDef } from "@tanstack/react-table";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import { Button } from "@ui/components/button";
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import type { SeoMetaRow } from "./types";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

export function getSeoMetaColumns({
  openDetail,
  openEdit,
  rowActions,
  canWrite,
}: {
  openDetail: (row: SeoMetaRow) => void;
  openEdit: (row: SeoMetaRow) => void;
  rowActions: AdminCrudRowHandlers<SeoMetaRow>;
  canWrite: boolean;
}): ColumnDef<SeoMetaRow>[] {
  return [
    {
      accessorKey: "page",
      header: "Đường dẫn",
      enableColumnFilter: false,
      cell: ({ row, getValue }) => (
        <button
          type="button"
          className="font-medium text-left text-foreground hover:text-primary transition-colors"
          onClick={() => openDetail(row.original)}
        >
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "title",
      header: "Title SEO",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return (
          <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
            {val ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "keywords",
      header: "Từ khóa",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return (
          <span className="text-xs text-muted-foreground max-w-[150px] truncate block">
            {val ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true;
        return String(row.getValue(columnId)) === String(filterValue);
      },
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "1", label: "Hoạt động" },
          { value: "0", label: "Tắt" },
        ],
      },
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Tắt" }}
          className="text-[10px]"
        />
      ),
    },
    defineAdminCrudActionsColumn<SeoMetaRow>({
      canWrite,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}

export function getTrashColumns({
  rowActions,
  canWrite,
}: {
  rowActions: AdminCrudRowHandlers<SeoMetaRow>;
  canWrite: boolean;
}): ColumnDef<SeoMetaRow>[] {
  return [
    {
      accessorKey: "page",
      header: "Đường dẫn",
      enableColumnFilter: false,
    },
    {
      accessorKey: "title",
      header: "Title SEO",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return (
          <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
            {val ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "deletedAt",
      header: "Xóa lúc",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true;
        const rowVal = row.getValue(columnId) as string;
        if (!rowVal) return false;
        const [fromStr, toStr] = String(filterValue).split(",");
        const rowDate = rowVal.split("T")[0];
        if (fromStr && rowDate < fromStr) return false;
        if (toStr && rowDate > toStr) return false;
        return true;
      },
      meta: { filterVariant: "date-range" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(getValue() as string)}
        </span>
      ),
    },
    defineAdminTrashActionsColumn<SeoMetaRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}
