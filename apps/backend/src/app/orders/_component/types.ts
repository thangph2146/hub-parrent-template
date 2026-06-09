import type { Order, OrderItem, OrderStatus } from "@workspace/api-client"

export { ORDER_STATUS_LABELS } from "@ui/components/product"

export type OrderRow = Omit<Order, "id"> & { id: string }

/** Dòng sản phẩm trong bảng mini (expand row). */
export type OrderItemRow = {
  id: string
  productId: number
  name: string
  sku: string
  quantity: number
  unitLabel?: string | null
  unitType: string
  unitPrice: number
  listUnitPrice?: number | null
  totalPrice: number
  image?: string | null
  giftNote?: string | null
}

export function mapOrderItemRows(
  orderId: number | string,
  items: OrderItem[] | undefined
): OrderItemRow[] {
  return (items ?? []).map((item, idx) => ({
    id: `${orderId}-line-${idx}`,
    productId: item.productId,
    name: item.name,
    sku: item.variantSku ?? item.sku,
    quantity: item.quantity,
    unitLabel: item.unitLabel,
    unitType: item.unitType,
    unitPrice: Number(item.unitPrice),
    listUnitPrice:
      item.listUnitPrice != null ? Number(item.listUnitPrice) : null,
    totalPrice: Number(item.totalPrice),
    image: item.image,
    giftNote: item.giftNote,
  }))
}

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
