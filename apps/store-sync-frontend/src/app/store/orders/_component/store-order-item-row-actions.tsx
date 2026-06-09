"use client";

import { Copy, ExternalLink, Eye, ShoppingCart } from "lucide-react";
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "@ui/components/data-table";
import { catalogProductHref } from "@workspace/api-client";
import type { StoreOrderItemRow } from "./types";

export type StoreOrderItemRowActionHandlers = {
  onViewProduct: (item: StoreOrderItemRow) => void;
  onReorderLine: (item: StoreOrderItemRow) => void | Promise<void>;
  onCopySku: (item: StoreOrderItemRow) => void | Promise<void>;
  busyItemId?: string | null;
};

export function StoreOrderItemRowActions({
  item,
  handlers,
}: {
  item: StoreOrderItemRow;
  handlers: StoreOrderItemRowActionHandlers;
}) {
  const unit = item.unitLabel?.trim() || item.unitType;

  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: "Xem sản phẩm",
      hint: "Mở trang catalog",
      onClick: () => handlers.onViewProduct(item),
      icon: <Eye />,
      group: "primary",
    },
    {
      key: "reorder",
      label: "Mua lại dòng này",
      hint: `Thêm ${item.quantity.toLocaleString("vi-VN")} × ${unit} vào giỏ`,
      onClick: () => handlers.onReorderLine(item),
      icon: <ShoppingCart />,
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
      hint: "Xem sản phẩm ở tab riêng",
      onClick: () => {
        window.open(catalogProductHref(item.productId), "_blank", "noopener");
      },
      icon: <ExternalLink />,
      group: "status",
      confirm: false,
    },
  ];

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
              </p>
            </div>
          ),
        },
      }}
    />
  );
}

export const storeOrderItemActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
};
