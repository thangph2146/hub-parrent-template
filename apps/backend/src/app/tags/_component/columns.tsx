"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import { ADMIN_TABLE_ACTIONS_COLUMN_META, AdminTableCrudRowActions, AdminTableTrashRowActions } from "@ui/components/admin";
import type { TagRow, TagTreeRow, TagConfirmAction } from "./types";
import { formatDateTime } from "./utils";

export function getTagColumns({
  openDetail,
  openEdit,
  setConfirmAction,
  canWrite,
}: {
  openDetail: (row: TagRow) => void;
  openEdit: (row: TagRow) => void;
  setConfirmAction: (action: TagConfirmAction) => void;
  canWrite: boolean;
}): ColumnDef<TagTreeRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên / nhóm",
      enableColumnFilter: false,
      meta: {
        exportValue: (row) =>
          row.isGroup ? `${row.name} (${row.itemCount ?? 0} thẻ)` : row.name,
      },
      cell: ({ row, getValue }) =>
        row.original.isGroup ? (
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{String(getValue())}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.original.itemCount} thẻ
            </Badge>
          </div>
        ) : (
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
      accessorKey: "slug",
      header: "Slug",
      enableColumnFilter: false,
      meta: {
        exportValue: (row) =>
          row.isGroup ? `nhom:${row.slug}` : row.slug,
      },
      cell: ({ row, getValue }) => (
        <span className="font-mono text-xs">
          {row.original.isGroup
            ? `nhom:${String(getValue())}`
            : String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật / quy mô",
      enableColumnFilter: true,
      meta: {
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
        exportValue: (row) =>
          row.isGroup ? "Nhóm theo tiền tố slug" : row.updatedAt ?? "",
      },
      filterFn: (row: Row<TagTreeRow>, columnId: string, filterValue: unknown) => {
        if (filterValue == null || filterValue === "") return true;
        if (row.original.isGroup) return true;
        const dates = String(filterValue).split(",").filter(Boolean);
        if (!dates.length) return true;
        const rowDate = new Date(row.getValue<string>(columnId));
        if (Number.isNaN(rowDate.getTime())) return true;
        if (dates.length === 1) return rowDate >= new Date(dates[0]);
        return rowDate >= new Date(dates[0]) && rowDate <= new Date(dates[1]);
      },
      cell: ({ row, getValue }) =>
        row.original.isGroup ? (
          <span className="text-xs text-muted-foreground">
            Nhóm theo tiền tố slug
          </span>
        ) : (
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
      cell: ({ row }) =>
        row.original.isGroup ? null : (
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
  setConfirmAction: (action: TagConfirmAction) => void;
  canWrite: boolean;
}): ColumnDef<TagRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên",
      enableColumnFilter: false,
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
      meta: { filterVariant: "date-range", filterPlaceholder: "Chọn khoảng ngày" },
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
