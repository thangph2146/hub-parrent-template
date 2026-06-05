"use client";

import { defineAdminCrudActionsColumn, defineAdminTrashActionsColumn } from "@ui/components/admin";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import { Button } from "@ui/components/button";
import { Pencil, Trash2, ArchiveRestore, Eye, Calendar, MapPin, Star } from "lucide-react";
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import type { EventRow } from "./types";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
}

export function getEventColumns({
  openDetail, openEdit, rowActions, canWrite, onToggleFeatured, isTogglingFeaturedId,
}: {
  openDetail: (row: EventRow) => void;
  openEdit: (row: EventRow) => void;
  rowActions: AdminCrudRowHandlers<EventRow>;
  canWrite: boolean;
  onToggleFeatured?: (row: EventRow) => void;
  isTogglingFeaturedId?: string | null;
}): ColumnDef<EventRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Sự kiện",
      enableColumnFilter: false,
      cell: ({ row, getValue }) => (
        <button type="button" className="font-medium text-left text-foreground hover:text-primary transition-colors" onClick={() => openDetail(row.original)}>
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "organizer",
      header: "Đơn vị tổ chức",
      enableColumnFilter: false,
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() ?? "—")}</span>,
    },
    {
      accessorKey: "startDate",
      header: "Bắt đầu",
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
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3" />{formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "location",
      header: "Địa điểm",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />{String(getValue() ?? "—")}
        </span>
      ),
    },
    {
      accessorKey: "format",
      header: "Hình thức",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true;
        return String(row.getValue(columnId)) === String(filterValue);
      },
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "0", label: "Offline" },
          { value: "1", label: "Online" },
          { value: "2", label: "Hybrid" },
        ],
      },
      cell: ({ getValue }) => {
        const fmt = getValue() as number;
        return (
          <Badge variant={fmt === 1 ? "secondary" : fmt === 2 ? "outline" : "default"} className="text-[10px]">
            {fmt === 1 ? "Online" : fmt === 2 ? "Hybrid" : "Offline"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isFeatured",
      header: "Nổi bật",
      enableColumnFilter: false,
      cell: ({ row }) => {
        const featured = row.original.isFeatured;
        const busy = isTogglingFeaturedId === row.original.id;
        if (!canWrite || !onToggleFeatured) {
          return featured ? (
            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px]">Nổi bật</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        }
        return (
          <Button
            type="button"
            variant={featured ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1 rounded-md px-2"
            disabled={busy}
            onClick={() => onToggleFeatured(row.original)}
            title={featured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}
          >
            <Star className={featured ? "size-3.5 fill-current" : "size-3.5"} />
            {featured ? "Đang bật" : "Đánh dấu"}
          </Button>
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
    defineAdminCrudActionsColumn<EventRow>({
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
  rowActions: AdminCrudRowHandlers<EventRow>;
  canWrite: boolean;
}): ColumnDef<EventRow>[] {
  return [
    { accessorKey: "title", header: "Sự kiện", enableColumnFilter: false },
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
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{formatDateTime(getValue() as string)}</span>,
    },
    defineAdminTrashActionsColumn<EventRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}
