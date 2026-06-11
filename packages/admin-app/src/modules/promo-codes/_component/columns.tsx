"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ActiveStatusBadge } from "@ui/components/product"
import { defineAdminCrudActionsColumn } from "@ui/components/admin"
import { defineAdminNumberRangeColumn } from "@workspace/admin-app/lib/admin-table-columns"
import type { AdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import type { PromoRow } from "./types"

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫"
}

export function getPromoColumns({
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  onToggleActive,
  canWrite,
  canDelete,
}: {
  openDetail?: (row: PromoRow) => void
  openEdit?: (row: PromoRow) => void
  rowActions: AdminCrudRowHandlers<PromoRow>
  onToggleActive?: (row: PromoRow) => void | Promise<void>
  canWrite: boolean
  canDelete?: boolean
}): ColumnDef<PromoRow>[] {
  const dataColumns: ColumnDef<PromoRow>[] = [
    {
      accessorKey: "code",
      header: "Mã",
      enableColumnFilter: true,
      meta: { filterVariant: "text", filterPlaceholder: "Lọc mã…" },
      cell: ({ row, getValue }) => (
        <button
          type="button"
          className="font-mono font-medium hover:text-primary"
          onClick={() => openDetail(row.original)}
        >
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "label",
      header: "Mô tả",
      enableColumnFilter: true,
      meta: { filterVariant: "text", filterPlaceholder: "Lọc mô tả…" },
    },
    {
      accessorKey: "discountKind",
      header: "Kiểu",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterVariant: "select",
        filterLabel: "Kiểu giảm",
        selectOptions: [
          { value: "percent", label: "%" },
          { value: "fixed", label: "Cố định" },
        ],
      },
      filterFn: (row, id, value) => {
        if (value == null || value === "") return true
        return String(row.getValue(id)) === String(value)
      },
      cell: ({ getValue }) => (getValue() === "percent" ? "%" : "Cố định"),
    },
    {
      id: "value",
      header: "Giá trị",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) =>
        row.original.discountKind === "percent"
          ? `${row.original.discountPercent}%`
          : formatVnd(row.original.discountFixed),
    },
    defineAdminNumberRangeColumn<PromoRow>({
      accessorKey: "minOrderSubtotal",
      header: "Đơn tối thiểu",
      filterLabel: "Đơn tối thiểu",
      minPlaceholder: "Từ (₫)",
      maxPlaceholder: "Đến (₫)",
      cell: ({ getValue }) => formatVnd(Number(getValue()) || 0),
    }),
    defineAdminNumberRangeColumn<PromoRow>({
      accessorKey: "usageCount",
      header: "Đã dùng",
      filterLabel: "Lượt dùng",
      minPlaceholder: "Từ",
      maxPlaceholder: "Đến",
      cell: ({ row }) => {
        const limit = row.original.usageLimit
        const used = row.original.usageCount
        return limit ? `${used}/${limit}` : String(used)
      },
    }),
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterVariant: "select",
        filterLabel: "Trạng thái",
        selectOptions: [
          { value: "true", label: "Đang bật" },
          { value: "false", label: "Đã tắt" },
        ],
      },
      filterFn: (row, id, value) => {
        if (value == null || value === "") return true
        return String(row.getValue(id)) === value
      },
      cell: ({ getValue }) => (
        <ActiveStatusBadge
          active={Boolean(getValue())}
          activeLabel="Đang bật"
          inactiveLabel="Đã tắt"
        />
      ),
    },
  ]

  return [
    ...dataColumns,
    defineAdminCrudActionsColumn<PromoRow>({
      canWrite,
      canDelete,
      onView: openDetail,
      onEdit: canWrite ? openEdit : undefined,
      onSoftDelete: rowActions.onSoftDelete,
      onToggleActive: canWrite ? onToggleActive : undefined,
      getIsActive: (row) => row.isActive,
      getRecordLabel: rowActions.getRecordLabel,
      labels: {
        lock: "Tắt mã",
        activate: "Bật mã",
        softDelete: "Xóa mã",
      },
    }),
  ]
}
