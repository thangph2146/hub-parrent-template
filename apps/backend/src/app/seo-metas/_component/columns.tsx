"use client";

import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableCrudRowActions,
  AdminTableTrashRowActions,
} from "@/components/admin-table-row-actions"

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import type { SeoMetaRow, SeoMetaConfirmAction } from "./types";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

export function getSeoMetaColumns({
  openDetail,
  openEdit,
  setConfirmAction,
  canWrite,
}: {
  openDetail: (row: SeoMetaRow) => void;
  openEdit: (row: SeoMetaRow) => void;
  setConfirmAction: (action: SeoMetaConfirmAction) => void;
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
      cell: ({ getValue }) => {
        const status = getValue() as number;
        return status === 1 ? (
          <Badge variant="default" className="text-[10px]">Hoạt động</Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">Tắt</Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => (
        <AdminTableCrudRowActions
          canWrite={canWrite}
          onView={() => openDetail(row.original)}
          onEdit={() => openEdit(row.original)}
          onSoftDelete={() => setConfirmAction({ kind: "delete", row: row.original })}
          onPurge={() => setConfirmAction({ kind: "purge", row: row.original })}
        />
      ),
    },
  ];
}

export function getTrashColumns({
  setConfirmAction,
  canWrite,
}: {
  setConfirmAction: (action: SeoMetaConfirmAction) => void;
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
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => (
        <AdminTableTrashRowActions
          canWrite={canWrite}
          onRestore={() => setConfirmAction({ kind: "restore", row: row.original })}
          onPurge={() => setConfirmAction({ kind: "purge", row: row.original })}
        />
      ),
    },
  ];
}
