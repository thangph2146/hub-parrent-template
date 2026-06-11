"use client"

import { Trash2 } from "lucide-react"
import type { AdminDataTableBulkAction } from "@ui/components/data-table"
import type { OrderStatus } from "@workspace/api-client"
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type OrderRow } from "./types"

export function buildOrderBulkStatusActionMap({
  onBulkStatusChange,
}: {
  onBulkStatusChange: (rows: OrderRow[], status: OrderStatus) => Promise<void>
}): Record<OrderStatus, AdminDataTableBulkAction<OrderRow>> {
  const map = {} as Record<OrderStatus, AdminDataTableBulkAction<OrderRow>>
  for (const status of ORDER_STATUSES) {
    map[status] = {
      id: `bulk-order-status-${status}`,
      label: ORDER_STATUS_LABELS[status],
      onAction: (rows) => onBulkStatusChange(rows, status),
      confirm: {
        title: `Đặt trạng thái «${ORDER_STATUS_LABELS[status]}»?`,
        description: (rows) => (
          <span>
            Áp dụng cho <strong>{rows.length}</strong> đơn hàng đã chọn.
          </span>
        ),
        confirmLabel: "Cập nhật",
      },
    }
  }
  return map
}

export function buildOrderBulkDeleteAction({
  onBulkDelete,
}: {
  onBulkDelete: (rows: OrderRow[]) => Promise<void>
}): AdminDataTableBulkAction<OrderRow> {
  return {
    id: "bulk-order-delete",
    label: "Xóa đã chọn",
    variant: "destructive",
    icon: <Trash2 className="size-3.5" aria-hidden />,
    confirm: {
      title: "Xóa các đơn đã chọn?",
      description: (rows) => (
        <span>
          Bạn đã chọn <strong>{rows.length}</strong> đơn hàng. Không thể hoàn
          tác.
        </span>
      ),
      confirmLabel: "Xóa",
      destructive: true,
    },
    onAction: onBulkDelete,
  }
}

export function buildOrderBulkActions({
  canDelete,
  onBulkDelete,
}: {
  canDelete: boolean
  onBulkDelete: (rows: OrderRow[]) => Promise<void>
}): AdminDataTableBulkAction<OrderRow>[] {
  if (!canDelete) return []
  return [buildOrderBulkDeleteAction({ onBulkDelete })]
}
