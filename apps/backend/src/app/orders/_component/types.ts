import type { Order, OrderStatus } from "@workspace/api-client"

export { ORDER_STATUS_LABELS } from "@ui/components/product"

export type OrderRow = Omit<Order, "id"> & { id: string }

export function mapOrderRow(order: Order): OrderRow {
  return { ...order, id: String(order.id) }
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const satisfies readonly OrderStatus[]
