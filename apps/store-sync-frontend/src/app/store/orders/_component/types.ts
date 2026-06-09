import type { Order, OrderStatus } from "@/lib/api";

type OrderLineItem = Order["items"][number];

/** Dòng sản phẩm trong bảng mini (expand row). */
export type StoreOrderItemRow = {
  id: string;
  productId: number;
  name: string;
  sku: string;
  quantity: number;
  unitLabel?: string | null;
  unitType: string;
  unitPrice: number;
  listUnitPrice?: number | null;
  totalPrice: number;
  image?: string | null;
};

export type StoreOrderRow = Omit<Order, "id"> & { id: string };

export function mapStoreOrderItemRows(
  orderId: number | string,
  items: OrderLineItem[] | undefined,
): StoreOrderItemRow[] {
  return (items ?? []).map((item, idx) => ({
    id: `${orderId}-line-${idx}`,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unitLabel: item.unitLabel,
    unitType: item.unitType,
    unitPrice: Number(item.unitPrice),
    listUnitPrice:
      item.listUnitPrice != null ? Number(item.listUnitPrice) : null,
    totalPrice: Number(item.totalPrice),
    image: item.image,
  }));
}

export function mapStoreOrderRow(order: Order): StoreOrderRow {
  return { ...order, id: String(order.id) };
}

export const STORE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const satisfies readonly OrderStatus[];
