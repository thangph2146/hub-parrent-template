"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DATA_TABLE_ACTIONS_COLUMN_ID } from "@ui/components/data-table"
import { StoreOrderStatusBadge } from "@ui/components/product"
import type { OrderStatus } from "@workspace/api-client"
import {
  defineAdminCreatedAtColumn,
  defineAdminNumberRangeColumn,
} from "@workspace/admin-app/lib/admin-table-columns"
import { OrderRowActions, orderActionsColumnMeta } from "./order-row-actions"
import { ORDER_STATUS_LABELS, type OrderRow } from "../shared/types"

const ORDER_STATUS_FILTER_OPTIONS = (
  Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]
).map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}))

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫"
}

export function getOrderColumns({
  openDetail = () => {},
  openEdit = () => {},
  canUpdate = false,
  canDelete = false,
  statusBusyId,
  onStatusChange,
  onDelete,
}: {
  openDetail?: (row: OrderRow) => void
  openEdit?: (row: OrderRow) => void
  canUpdate?: boolean
  canDelete?: boolean
  statusBusyId?: string | null
  onStatusChange?: (row: OrderRow, status: OrderStatus) => void | Promise<void>
  onDelete?: (row: OrderRow) => void | Promise<void>
}): ColumnDef<OrderRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Mã đơn",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row, getValue }) => (
        <button
          type="button"
          className="font-mono text-sm font-medium text-foreground hover:text-primary"
          onClick={() => openDetail(row.original)}
        >
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Khách hàng",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
    },
    {
      accessorKey: "customerEmail",
      header: "Email",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterVariant: "select",
        filterLabel: "Trạng thái",
        selectOptions: ORDER_STATUS_FILTER_OPTIONS,
      },
      filterFn: (row, id, value) => {
        if (value == null || value === "") return true
        return String(row.getValue(id)) === String(value)
      },
      cell: ({ getValue }) => (
        <StoreOrderStatusBadge status={getValue() as OrderStatus} />
      ),
    },
    {
      id: "itemsCount",
      header: "Dòng",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => row.original.items?.length ?? 0,
    },
    defineAdminNumberRangeColumn<OrderRow>({
      accessorKey: "totalAmount",
      header: "Tổng",
      filterLabel: "Tổng tiền",
      minPlaceholder: "Từ (₫)",
      maxPlaceholder: "Đến (₫)",
      cell: ({ getValue }) => formatVnd(Number(getValue()) || 0),
    }),
    defineAdminCreatedAtColumn<OrderRow>({
      header: "Ngày đặt",
      enableColumnFilter: true,
    }),
    {
      id: DATA_TABLE_ACTIONS_COLUMN_ID,
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: orderActionsColumnMeta,
      cell: ({ row }) => (
        <OrderRowActions
          order={row.original}
          canUpdate={canUpdate}
          canDelete={canDelete}
          busy={statusBusyId === row.original.id}
          onView={() => openDetail(row.original)}
          onEdit={canUpdate ? () => openEdit(row.original) : undefined}
          onDelete={
            canDelete && onDelete
              ? () => onDelete(row.original)
              : undefined
          }
          onStatusChange={(status) => onStatusChange?.(row.original, status)}
        />
      ),
    },
  ]
}
