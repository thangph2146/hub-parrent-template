"use client"

import { Eye, Pencil, Trash2 } from "lucide-react"
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionConfirm,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import { StoreOrderStatusBadge } from "@ui/components/product"
import type { OrderStatus } from "@workspace/api-client"
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type OrderRow } from "../shared/types"
import { ORDER_STATUS_VISUAL } from "./order-status-visual"

export type OrderRowActionsProps = {
  order: OrderRow
  canUpdate: boolean
  canDelete: boolean
  busy?: boolean
  onView: () => void
  onEdit?: () => void
  onDelete?: () => void
  onStatusChange: (status: OrderStatus) => void | Promise<void>
}

function orderDeleteConfirm(order: OrderRow): DataTableRowActionConfirm {
  return {
    title: "Xóa đơn hàng?",
    description: (
      <>
        Đơn <strong>{order.orderNumber}</strong> của {order.customerName} sẽ bị
        xóa khỏi hệ thống. Không thể hoàn tác.
      </>
    ),
    confirmLabel: "Xóa",
    destructive: true,
  }
}

export function OrderRowActions({
  order,
  canUpdate,
  canDelete,
  busy,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: OrderRowActionsProps) {
  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      hint: "Mở trang thông tin đầy đủ",
      onClick: onView,
      icon: <Eye />,
      group: "primary",
    },
  ]

  if (canUpdate && onEdit) {
    actions.push({
      key: "edit",
      label: "Cập nhật trạng thái",
      hint: "Mở form chỉnh sửa trạng thái đơn",
      onClick: onEdit,
      icon: <Pencil />,
      group: "primary",
    })

    for (const status of ORDER_STATUSES) {
      if (status === order.status) continue
      const visual = ORDER_STATUS_VISUAL[status]
      const StatusIcon = visual.icon
      actions.push({
        key: `status-${status}`,
        label: ORDER_STATUS_LABELS[status],
        hint: `Chuyển sang «${ORDER_STATUS_LABELS[status]}»`,
        onClick: () => onStatusChange(status),
        icon: <StatusIcon />,
        iconBgClassName: visual.iconBgClassName,
        iconClassName: visual.iconClassName,
        group: "status",
      })
    }
  }

  if (canDelete && onDelete) {
    actions.push({
      key: "delete",
      label: "Xóa đơn",
      hint: "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
      onClick: onDelete,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      confirm: orderDeleteConfirm(order),
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={busy}
      autoConfirmDangerousActions={false}
      triggerLabel="Thao tác đơn hàng"
      groups={{
        primary: { label: "Thao tác", sublabel: false },
        status: {
          label: "Đổi trạng thái",
          sublabel: true,
          header: (
            <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
              <StoreOrderStatusBadge status={order.status} />
              <span className="text-[11px] text-muted-foreground">
                {order.orderNumber}
              </span>
            </div>
          ),
        },
        danger: { label: "Xóa", sublabel: true },
      }}
    />
  )
}

export const orderActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
}
