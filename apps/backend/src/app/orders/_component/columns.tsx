"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { StoreOrderStatusBadge } from "@ui/components/product"
import type { OrderStatus } from "@workspace/api-client"
import { type OrderRow } from "./types"

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫"
}

export function getOrderColumns({
  openDetail = () => {},
}: {
  openDetail?: (row: OrderRow) => void
}): ColumnDef<OrderRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Mã đơn",
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
    },
    {
      accessorKey: "customerEmail",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ getValue }) => {
        const status = getValue() as OrderStatus
        return <StoreOrderStatusBadge status={status} />
      },
    },
    {
      id: "itemsCount",
      header: "Dòng",
      cell: ({ row }) => row.original.items?.length ?? 0,
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng",
      cell: ({ getValue }) => formatVnd(Number(getValue()) || 0),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày đặt",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "")
        const d = new Date(v)
        return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN")
      },
    },
  ]
}
