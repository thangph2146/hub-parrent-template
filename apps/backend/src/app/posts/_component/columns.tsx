"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableCrudRowActions,
  AdminTablePurgeButton,
  AdminTableRestoreButton,
  AdminTableRowActions,
} from "@/components/admin-table-row-actions";
import type { PostListRow, TaxonomyOption, CategoryTreeOption } from "./types";
import { SummaryBadges } from "./summary-badges";

export function getPostColumns({
  navigateToEdit,
  navigateToView,
  setConfirmAction,
  categoryTreeOptions,
  tagsOptions,
  formatDateTime,
  canUpdate,
  canDelete,
}: {
  navigateToEdit: (id: string) => void;
  navigateToView: (id: string) => void;
  setConfirmAction: (action: { kind: "delete" | "restore" | "purge"; row: PostListRow }) => void;
  categoryTreeOptions: CategoryTreeOption[];
  tagsOptions: TaxonomyOption[];
  formatDateTime: (date: string) => string;
  canUpdate: boolean;
  canDelete: boolean;
}): ColumnDef<PostListRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Tiêu đề",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "categories",
      id: "categoryId",
      header: "Danh mục",
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
      cell: ({ row }) => <SummaryBadges items={row.original.categories} />,
    },
    {
      accessorKey: "tags",
      id: "tagId",
      header: "Thẻ",
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: () => true,
      meta: {
        filterVariant: "select",
        selectOptions: tagsOptions.map((t) => ({ value: t.id, label: t.name })),
      },
      cell: ({ row }) => <SummaryBadges items={row.original.tags} />,
    },
    {
      accessorKey: "published",
      header: "Trạng thái",
      cell: ({ row }) =>
        row.original.published ? (
          <Badge className="text-xs">Đã xuất bản</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            Bản nháp
          </Badge>
        ),
      filterFn: () => true,
      meta: {
        filterVariant: "multi-select",
        selectOptions: [
          { value: "true", label: "Đã xuất bản" },
          { value: "false", label: "Bản nháp" },
        ],
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      enableColumnFilter: true,
      enableSorting: true,
      filterFn: () => true,
      meta: {
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
      },
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
        <AdminTableCrudRowActions
          canWrite={canDelete || canUpdate}
          onView={() => navigateToView(row.original.id)}
          onEdit={canUpdate ? () => navigateToEdit(row.original.id) : undefined}
          onSoftDelete={
            canDelete
              ? () => setConfirmAction({ kind: "delete", row: row.original })
              : undefined
          }
          onPurge={
            canDelete
              ? () => setConfirmAction({ kind: "purge", row: row.original })
              : undefined
          }
        />
      ),
    },
  ];
}

export function getTrashColumns({
  setConfirmAction,
  formatDateTime,
  categoryTreeOptions,
  tagsOptions,
  canRestore,
  canDelete,
}: {
  setConfirmAction: (action: { kind: "delete" | "restore" | "purge"; row: PostListRow }) => void;
  formatDateTime: (date: string) => string;
  categoryTreeOptions: CategoryTreeOption[];
  tagsOptions: TaxonomyOption[];
  canRestore: boolean;
  canDelete: boolean;
}): ColumnDef<PostListRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Tiêu đề",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "categories",
      id: "categoryId",
      header: "Danh mục",
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
      cell: ({ row }) => <SummaryBadges items={row.original.categories} />,
    },
    {
      accessorKey: "tags",
      id: "tagId",
      header: "Thẻ",
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: () => true,
      meta: {
        filterVariant: "select",
        selectOptions: tagsOptions.map((t) => ({ value: t.id, label: t.name })),
      },
      cell: ({ row }) => <SummaryBadges items={row.original.tags} />,
    },
    {
      accessorKey: "published",
      header: "Trạng thái",
      cell: ({ row }) =>
        row.original.published ? (
          <Badge className="text-xs">Đã xuất bản</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            Bản nháp
          </Badge>
        ),
      filterFn: () => true,
      meta: {
        filterVariant: "multi-select",
        selectOptions: [
          { value: "true", label: "Đã xuất bản" },
          { value: "false", label: "Bản nháp" },
        ],
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      enableColumnFilter: true,
      enableSorting: true,
      filterFn: () => true,
      meta: {
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
      },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "deletedAt",
      header: "Xóa lúc",
      enableColumnFilter: true,
      enableSorting: true,
      filterFn: () => true,
      meta: {
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
      },
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
        <AdminTableRowActions>
          {canRestore ? (
            <AdminTableRestoreButton
              onClick={() => setConfirmAction({ kind: "restore", row: row.original })}
            />
          ) : null}
          {canDelete ? (
            <AdminTablePurgeButton
              onClick={() => setConfirmAction({ kind: "purge", row: row.original })}
            />
          ) : null}
        </AdminTableRowActions>
      ),
    },
  ];
}
