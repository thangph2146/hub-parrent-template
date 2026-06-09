"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Package2 } from "lucide-react";
import { Badge } from "@ui/components/badge";
import { defineDataTableActionsColumn } from "@ui/components/data-table";
import { formatVND } from "@/lib/format";
import {
  StoreOrderItemRowActions,
  type StoreOrderItemRowActionHandlers,
} from "./store-order-item-row-actions";
import type { StoreOrderItemRow } from "./types";

export function getStoreOrderItemColumns({
  actionHandlers,
}: {
  actionHandlers: StoreOrderItemRowActionHandlers;
}): ColumnDef<StoreOrderItemRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Sản phẩm",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Link
            href={`/catalog/${item.productId}`}
            className="flex min-w-[10rem] items-center gap-3 rounded-lg transition-colors hover:bg-muted/40"
          >
            {item.image ? (
              <img
                src={item.image}
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
            </div>
          </Link>
        );
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
          row.original.unitLabel?.trim() || row.original.unitType;
        return (
          <Badge variant="outline" className="font-normal tabular-nums">
            {row.original.quantity.toLocaleString("vi-VN")} × {unit}
          </Badge>
        );
      },
    },
    {
      accessorKey: "unitPrice",
      header: "Đơn giá",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => {
        const item = row.original;
        const hasDiscount =
          item.listUnitPrice != null && item.listUnitPrice > item.unitPrice;
        return (
          <div className="text-xs tabular-nums">
            {hasDiscount ? (
              <p className="text-muted-foreground line-through">
                {formatVND(item.listUnitPrice!)}
              </p>
            ) : null}
            <p className="font-semibold">{formatVND(item.unitPrice)}</p>
          </div>
        );
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
    defineDataTableActionsColumn<StoreOrderItemRow>({
      cell: ({ row }) => (
        <StoreOrderItemRowActions
          item={row.original}
          handlers={actionHandlers}
        />
      ),
    }),
  ];
}
