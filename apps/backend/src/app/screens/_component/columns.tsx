"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import { defineAdminCrudActionsColumn, defineAdminTrashActionsColumn } from "@ui/components/admin";
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import type { ScreenRow } from "./types";

function fmt(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN");
}

export function getScreenColumns({
  openDetail,
  openEdit,
  rowActions,
  canWrite,
}: {
  openDetail: (row: ScreenRow) => void;
  openEdit: (row: ScreenRow) => void;
  rowActions: AdminCrudRowHandlers<ScreenRow>;
  canWrite: boolean;
}): ColumnDef<ScreenRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên màn hình",
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
      accessorKey: "code",
      header: "Mã",
      cell: ({ getValue }) => (
        <span className="text-sm font-mono">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "cameraName",
      header: "Camera",
      enableColumnFilter: true,
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() ?? "—")}</span>,
    },
    {
      accessorKey: "templateName",
      header: "Template",
      enableColumnFilter: true,
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
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Khóa" }}
          className="text-[10px]"
        />
      ),
    },
    defineAdminCrudActionsColumn<ScreenRow>({
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
  rowActions: AdminCrudRowHandlers<ScreenRow>;
  canWrite: boolean;
}): ColumnDef<ScreenRow>[] {
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
    defineAdminTrashActionsColumn<ScreenRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}
