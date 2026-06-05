"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UsageStatusFromValue } from "@ui/components/usage-status-badge";
import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin";
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers";
import type { PostListRow, TaxonomyOption, CategoryTreeOption } from "./types";
import { SummaryBadges } from "./summary-badges";

export function getPostColumns({
  navigateToEdit,
  navigateToView,
  rowActions,
  categoryTreeOptions,
  tagsOptions,
  formatDateTime,
  canUpdate,
  canDelete,
}: {
  navigateToEdit: (id: string) => void;
  navigateToView: (id: string) => void;
  rowActions: AdminCrudRowHandlers<PostListRow>;
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
      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.published}
          labels={{ active: "Đã xuất bản", locked: "Bản nháp" }}
          className="text-[10px]"
        />
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
    defineAdminCrudActionsColumn<PostListRow>({
      canWrite: canDelete || canUpdate,
      onView: (row) => navigateToView(row.id),
      onEdit: canUpdate ? (row) => navigateToEdit(row.id) : undefined,
      onSoftDelete: canDelete ? rowActions.onSoftDelete : undefined,
      onPurge: canDelete ? rowActions.onPurge : undefined,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}

export function getTrashColumns({
  rowActions,
  formatDateTime,
  categoryTreeOptions,
  tagsOptions,
  canRestore,
  canDelete,
}: {
  rowActions: AdminCrudRowHandlers<PostListRow>;
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
      cell: ({ row }) => (
        <UsageStatusFromValue
          value={row.original.published}
          labels={{ active: "Đã xuất bản", locked: "Bản nháp" }}
          className="text-[10px]"
        />
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
    defineAdminTrashActionsColumn<PostListRow>({
      canWrite: !!(canRestore || canDelete),
      onRestore: canRestore ? rowActions.onRestore : undefined,
      onPurge: canDelete ? rowActions.onPurge : undefined,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ];
}
