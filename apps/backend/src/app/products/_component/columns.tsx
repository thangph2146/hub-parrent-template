"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  buildAdminTableColumns,
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
  type AdminTableView,
} from "@/lib/admin-table-columns"
import type { ProductRow } from "./types"

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫"
}

export function getProductColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
  canDelete,
  canRestore,
  canHardDelete,
}: {
  view?: AdminTableView
  openDetail?: (row: ProductRow) => void
  openEdit?: (row: ProductRow) => void
  rowActions: AdminCrudRowHandlers<ProductRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<ProductRow>[] {
  const dataColumns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      meta: { filterPlaceholder: "Lọc SKU…" },
    },
    {
      accessorKey: "name",
      header: "Tên",
      meta: { filterPlaceholder: "Lọc tên…" },
      cell: ({ row, getValue }) => (
        <button
          type="button"
          className="text-left font-medium text-foreground transition-colors hover:text-primary"
          onClick={() => openDetail(row.original)}
        >
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "category",
      header: "Danh mục",
    },
    {
      accessorKey: "retailPrice",
      header: "Giá bán",
      cell: ({ getValue }) => formatVnd(Number(getValue()) || 0),
    },
    {
      accessorKey: "stock",
      header: "Tồn",
      cell: ({ getValue }) => {
        const n = Number(getValue()) || 0
        return (
          <Badge
            variant={n <= 0 ? "destructive" : n < 10 ? "secondary" : "outline"}
          >
            {n}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Bán",
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"}>
          {getValue() ? "Đang bán" : "Ẩn"}
        </Badge>
      ),
    },
    defineAdminCreatedAtColumn<ProductRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<ProductRow>({ header: "Cập nhật" }),
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<ProductRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: canWrite ? openEdit : undefined,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<ProductRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
