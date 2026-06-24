"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Package2 } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { defineDataTableActionsColumn } from "@ui/components/data-table"
import { resolveMediaUrl } from "@ui/lib/resolve-media-url"
import { formatVND } from "@workspace/admin-app/lib/format"
import {
  OrderItemRowActions,
  type OrderItemRowActionHandlers,
} from "./order-item-row-actions"
import type { OrderItemRow } from "../shared/types"

export function getOrderItemColumns({
  actionHandlers,
  getProductDetailHref,
}: {
  actionHandlers: OrderItemRowActionHandlers
  getProductDetailHref: (productId: string | number) => string
}): ColumnDef<OrderItemRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Sản phẩm",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const item = row.original
        const imageSrc = item.image
          ? resolveMediaUrl(item.image, 120)
          : null
        return (
          <Link
            href={getProductDetailHref(item.productId)}
            className="flex min-w-[10rem] items-center gap-3 rounded-lg transition-colors hover:bg-muted/40"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className="size-10 shrink-0 rounded-md border object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/40 text-muted-foreground">
                <Package2 className="size-4 opacity-60" aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">
                {item.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {item.sku}
              </p>
              {item.giftNote ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-primary">
                  {item.giftNote}
                </p>
              ) : null}
            </div>
          </Link>
        )
      },
    },
    {
      id: "quantity",
      header: "Số lượng",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const unit =
          row.original.unitLabel?.trim() || row.original.unitType
        return (
          <Badge variant="outline" className="font-normal tabular-nums">
            {row.original.quantity.toLocaleString("vi-VN")} × {unit}
          </Badge>
        )
      },
    },
    {
      accessorKey: "unitPrice",
      header: "Đơn giá",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const item = row.original
        const hasDiscount =
          item.listUnitPrice != null && item.listUnitPrice > item.unitPrice
        return (
          <div className="text-xs tabular-nums">
            {hasDiscount ? (
              <p className="text-muted-foreground line-through">
                {formatVND(item.listUnitPrice!)}
              </p>
            ) : null}
            <p className="font-semibold">{formatVND(item.unitPrice)}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "totalPrice",
      header: "Thành tiền",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => (
        <span className="font-bold tabular-nums text-primary">
          {formatVND(row.original.totalPrice)}
        </span>
      ),
    },
    defineDataTableActionsColumn<OrderItemRow>({
      cell: ({ row }) => (
        <OrderItemRowActions item={row.original} handlers={actionHandlers} />
      ),
    }),
  ]
}
