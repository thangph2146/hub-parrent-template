"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import { Eye, FolderTree, Folder } from "lucide-react";
import { defineAdminCrudActionsColumn, defineAdminTrashActionsColumn } from "@ui/components/admin";
import { resolveIcon } from "@ui/lib/icons";
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import type { CategoryRow, CategoryTreeOption } from "./types";

export function getCategoryColumns({
  openDetail,
  openEdit,
  rowActions,
  categoryTreeOptions,
  canWriteCategories,
}: {
  openDetail: (row: CategoryRow) => void;
  openEdit: (row: CategoryRow) => void;
  rowActions: AdminCrudRowHandlers<CategoryRow>;
  categoryTreeOptions: CategoryTreeOption[];
  canWriteCategories: boolean;
}): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên",
      enableColumnFilter: false,
      cell: ({ row, getValue }) => {
        const IconComp = row.original.icon
          ? resolveIcon(row.original.icon)
          : row.depth === 0
            ? FolderTree
            : Folder;
        return (
        <button
          type="button"
          className="flex min-w-0 cursor-pointer items-center gap-2 text-left hover:text-primary transition-colors"
          onClick={() => openDetail(row.original)}
        >
          <IconComp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium">{String(getValue())}</span>
        </button>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{String(getValue())}</span>
      ),
      meta: { filterPlaceholder: "Lọc slug" },
    },
    {
      id: "postCount",
      accessorFn: (row) => row.postCount ?? 0,
      header: "Bài viết",
      enableColumnFilter: false,
      cell: ({ row }) => {
        const count = row.original.postCount ?? 0;
        return (
          <Badge variant={count > 0 ? "secondary" : "outline"} className="font-mono tabular-nums">
            {count}
          </Badge>
        );
      },
    },
    {
      id: "parentId",
      accessorFn: (row) => row.parentName ?? "Gốc",
      header: "Danh mục cha",
      cell: ({ row }) =>
        row.original.parentName ? (
          row.original.parentName
        ) : (
          <span className="text-muted-foreground">Gốc</span>
        ),
      meta: {
        filterVariant: "tree-multi-select",
        treeOptions: categoryTreeOptions.map((c) => ({
          value: c.id,
          label: c.name,
          children: c.subRows?.map((s) => ({
            value: s.id,
            label: s.name,
            children: s.subRows?.map((ss) => ({ value: ss.id, label: ss.name })),
          })),
        })),
      },
    },
    defineAdminCrudActionsColumn<CategoryRow>({
      canWrite: canWriteCategories,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
      resolveRowProps: (c) => {
        const childCount = c._count?.children ?? 0;
        const linkedPosts = c.postCount ?? 0;
        const blocked = childCount > 0 || linkedPosts > 0;
        const blockReason =
          childCount > 0 && linkedPosts > 0
            ? "Không thể xóa danh mục còn danh mục con hoặc bài viết liên kết"
            : childCount > 0
              ? "Không thể xóa danh mục còn danh mục con"
              : linkedPosts > 0
                ? "Không thể xóa danh mục còn bài viết liên kết"
                : undefined;
        return {
          softDeleteDisabled: blocked,
          softDeleteTitle: blockReason,
          purgeDisabled: blocked,
          purgeTitle: blockReason,
        };
      },
    }),
  ];
}

export function getTrashColumns({
  rowActions,
  formatDateTime,
  categoryTreeOptions,
  canWrite,
}: {
  rowActions: AdminCrudRowHandlers<CategoryRow>;
  formatDateTime: (date: string) => string;
  categoryTreeOptions: CategoryTreeOption[];
  canWrite: boolean;
}): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên",
      enableColumnFilter: false,
      cell: ({ row, getValue }) => {
        const IconComp = row.original.icon
          ? resolveIcon(row.original.icon)
          : row.depth === 0
            ? FolderTree
            : Folder;
        return (
        <div className="flex items-center gap-2">
          <IconComp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="font-medium">{String(getValue())}</span>
        </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{String(getValue())}</span>
      ),
      meta: { filterPlaceholder: "Lọc slug" },
    },
    {
      id: "parentId",
      accessorFn: (row) => row.parentName ?? "Gốc",
      header: "Danh mục cha",
      cell: ({ row }) =>
        row.original.parentName ? (
          row.original.parentName
        ) : (
          <span className="text-muted-foreground">Gốc</span>
        ),
      meta: {
        filterVariant: "tree-multi-select",
        treeOptions: categoryTreeOptions.map((c) => ({
          value: c.id,
          label: c.name,
          children: c.subRows?.map((s) => ({
            value: s.id,
            label: s.name,
            children: s.subRows?.map((ss) => ({ value: ss.id, label: ss.name })),
          })),
        })),
      },
    },
    {
      accessorKey: "deletedAt",
      header: "Xóa lúc",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined;
        return (
          <span className="text-xs text-muted-foreground">
            {v ? formatDateTime(v) : "—"}
          </span>
        );
      },
    },
    defineAdminTrashActionsColumn<CategoryRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}
