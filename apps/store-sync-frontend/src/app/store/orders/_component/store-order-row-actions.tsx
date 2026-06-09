"use client";

import {
  Copy,
  ExternalLink,
  Headphones,
  Package,
  ShoppingCart,
  Eye,
} from "lucide-react";
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "@ui/components/data-table";
import {
  ORDER_STATUS_LABELS,
  StoreOrderStatusBadge,
} from "@ui/components/product";
import { catalogProductHref } from "@workspace/api-client";
import type { StoreOrderRow } from "./types";

export type StoreOrderRowActionHandlers = {
  onViewDetail: (order: StoreOrderRow) => void;
  onReorder: (order: StoreOrderRow) => void | Promise<void>;
  onCopyCode: (order: StoreOrderRow) => void | Promise<void>;
  onCopySummary: (order: StoreOrderRow) => void | Promise<void>;
  onContactSupport: (order: StoreOrderRow) => void;
  busyOrderId?: string | null;
};

export function StoreOrderRowActions({
  order,
  handlers,
}: {
  order: StoreOrderRow;
  handlers: StoreOrderRowActionHandlers;
}) {
  const firstItem = order.items?.[0];
  const canReorder = order.status !== "cancelled";

  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      hint: "Mở trang theo dõi đơn đầy đủ",
      onClick: () => handlers.onViewDetail(order),
      icon: <Eye />,
      group: "primary",
    },
    {
      key: "reorder",
      label: canReorder ? "Mua lại vào giỏ" : "Thử đặt lại",
      hint: canReorder
        ? "Thêm toàn bộ dòng hàng vào giỏ hiện tại"
        : "Đơn đã hủy — vẫn có thể thử thêm SP còn bán",
      onClick: () => handlers.onReorder(order),
      icon: <ShoppingCart />,
      group: "primary",
      disabled: !order.items?.length,
    },
    {
      key: "copy-code",
      label: "Sao chép mã đơn",
      hint: order.orderNumber,
      onClick: () => handlers.onCopyCode(order),
      icon: <Copy />,
      group: "status",
      confirm: false,
    },
    {
      key: "copy-summary",
      label: "Sao chép tóm tắt",
      hint: "Mã, trạng thái, tổng tiền và danh sách SP",
      onClick: () => handlers.onCopySummary(order),
      icon: <Copy />,
      group: "status",
      confirm: false,
    },
    {
      key: "support",
      label: "Liên hệ hỗ trợ",
      hint: "Mở trang hỗ trợ với mã đơn",
      onClick: () => handlers.onContactSupport(order),
      icon: <Headphones />,
      group: "status",
      confirm: false,
    },
  ];

  if (firstItem?.productId) {
    actions.push({
      key: "open-product",
      label: "Xem SP đầu tiên",
      hint: firstItem.name,
      onClick: () => {
        window.open(catalogProductHref(firstItem.productId), "_blank", "noopener");
      },
      icon: <Package />,
      group: "status",
      confirm: false,
    });
  }

  actions.push({
    key: "open-detail-tab",
    label: "Mở tab mới",
    hint: "Xem chi tiết ở tab riêng",
    onClick: () => {
      window.open(`/store/orders/${order.id}`, "_blank", "noopener");
    },
    icon: <ExternalLink />,
    group: "status",
    confirm: false,
  });

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={handlers.busyOrderId === order.id}
      autoConfirmDangerousActions={false}
      triggerLabel={`Thao tác đơn ${order.orderNumber}`}
      groups={{
        primary: { label: "Thao tác nhanh", sublabel: false },
        status: {
          label: "Tiện ích",
          sublabel: true,
          header: (
            <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
              <StoreOrderStatusBadge status={order.status} />
              <span className="font-mono text-[11px] text-muted-foreground">
                {order.orderNumber}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
          ),
        },
      }}
    />
  );
}

export const storeOrderActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10] bg-background/95 backdrop-blur-sm`,
};
