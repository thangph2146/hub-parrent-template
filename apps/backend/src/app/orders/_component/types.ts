import type { Order, OrderStatus } from "@workspace/api-client"

export type OrderRow = Omit<Order, "id"> & { id: string }

export function mapOrderRow(order: Order): OrderRow {
  return { ...order, id: String(order.id) }
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}
