"use client"

import { Copy, ExternalLink, Eye } from "lucide-react"
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import type { OrderItemRow } from "../shared/types"

export type OrderItemRowActionHandlers = {
  onViewProduct: (item: OrderItemRow) => void
  onCopySku: (item: OrderItemRow) => void | Promise<void>
  busyItemId?: string | null
}

export function OrderItemRowActions({
  item,
  handlers,
}: {
  item: OrderItemRow
  handlers: OrderItemRowActionHandlers
}) {
  const unit = item.unitLabel?.trim() || item.unitType

  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: "Xem sản phẩm",
      hint: "Mở trang quản trị SP",
      onClick: () => handlers.onViewProduct(item),
      icon: <Eye />,
      group: "primary",
    },
    {
      key: "copy-sku",
      label: "Sao chép SKU",
      hint: item.sku,
      onClick: () => handlers.onCopySku(item),
      icon: <Copy />,
      group: "status",
      confirm: false,
    },
    {
      key: "open-tab",
      label: "Mở tab mới",
      hint: "Xem SP ở tab riêng",
      onClick: () => {
        window.open(`/products/${item.productId}`, "_blank", "noopener")
      },
      icon: <ExternalLink />,
      group: "status",
      confirm: false,
    },
  ]

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={handlers.busyItemId === item.id}
      autoConfirmDangerousActions={false}
      triggerLabel={`Thao tác ${item.sku}`}
      groups={{
        primary: { label: "Thao tác nhanh", sublabel: false },
        status: {
          label: "Tiện ích",
          sublabel: true,
          header: (
            <div className="min-w-0 px-1 pb-1">
              <p className="line-clamp-2 text-[11px] font-medium leading-snug">
                {item.name}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {item.sku}
                {unit ? ` · ${item.quantity.toLocaleString("vi-VN")} × ${unit}` : null}
              </p>
            </div>
          ),
        },
      }}
    />
  )
}

export const orderItemActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
}
