"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableCrudRowActions,
  AdminTableTrashRowActions,
} from "@/components/admin-table-row-actions";
import type { CameraRow, CameraConfirmAction } from "./types";

function fmt(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN");
}

export function getCameraColumns({
  openDetail,
  openEdit,
  setConfirmAction,
  canWrite,
}: {
  openDetail: (row: CameraRow) => void;
  openEdit: (row: CameraRow) => void;
  setConfirmAction: (a: CameraConfirmAction) => void;
  canWrite: boolean;
}): ColumnDef<CameraRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên camera",
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
      accessorKey: "ipAddress",
      header: "IP",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="text-sm font-mono">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "port",
      header: "Cổng",
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() ?? "—")}</span>,
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
          { value: "0", label: "Khóa" },
        ],
      },
      cell: ({ getValue }) => {
        const s = getValue() as number;
        return s === 1 ? (
          <Badge variant="default" className="text-[10px]">
            Hoạt động
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            Khóa
          </Badge>
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
  setConfirmAction: (a: CameraConfirmAction) => void;
  canWrite: boolean;
}): ColumnDef<CameraRow>[] {
  return [
    { accessorKey: "name", header: "Tên", enableColumnFilter: false },
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
        <span className="text-xs text-muted-foreground">{fmt(getValue() as string)}</span>
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
