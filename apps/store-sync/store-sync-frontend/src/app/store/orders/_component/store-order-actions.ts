import { getProductUnits } from "@/lib/catalog-filters";
import { cartStore } from "@/hooks/use-cart";
import type { Product } from "@/lib/api";
import { formatVND } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@ui/components/product";
import type { StoreOrderItemRow, StoreOrderRow } from "./types";

export type ReorderToCartResult = {
  linesAdded: number;
  linesSkipped: number;
  ordersProcessed: number;
};

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !text.trim()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function buildOrderSummaryText(order: StoreOrderRow): string {
  const items =
    order.items
      ?.map(
        (item) =>
          `• ${item.name} (${item.sku}) × ${item.quantity} ${item.unitLabel ?? item.unitType}`,
      )
      .join("\n") ?? "—";

  return [
    `Mã đơn: ${order.orderNumber}`,
    `Trạng thái: ${ORDER_STATUS_LABELS[order.status]}`,
    `Tổng: ${formatVND(order.totalAmount)}`,
    `Ngày đặt: ${order.createdAt}`,
    order.shippingAddress ? `Địa chỉ: ${order.shippingAddress}` : null,
    "Sản phẩm:",
    items,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrdersSupportMessage(orders: StoreOrderRow[]): string {
  if (orders.length === 1) {
    const order = orders[0]!;
    return `Xin hỗ trợ đơn hàng ${order.orderNumber} (${ORDER_STATUS_LABELS[order.status]}, ${formatVND(order.totalAmount)}).`;
  }
  const codes = orders.map((o) => o.orderNumber).join(", ");
  return `Xin hỗ trợ ${orders.length} đơn hàng: ${codes}.`;
}

export function buildSupportPageHref(orders: StoreOrderRow[]): string {
  const codes = orders.map((o) => o.orderNumber).join(",");
  return `/support?orders=${encodeURIComponent(codes)}`;
}

export type ReorderLineToCartResult = "added" | "skipped";

export function reorderOrderLineToCart(
  item: Pick<StoreOrderItemRow, "productId" | "unitType" | "quantity">,
  products: Product[],
): ReorderLineToCartResult {
  const product = products.find((p) => p.id === item.productId);
  if (!product) return "skipped";
  const unit = getProductUnits(product).find(
    (u) => String(u.type).trim() === String(item.unitType).trim(),
  );
  if (!unit) return "skipped";
  const result = cartStore.add(product, unit, item.quantity);
  return result.ok && result.added > 0 ? "added" : "skipped";
}

export function reorderOrdersToCart(
  orders: StoreOrderRow[],
  products: Product[],
): ReorderToCartResult {
  const byId = new Map(products.map((product) => [product.id, product]));
  let linesAdded = 0;
  let linesSkipped = 0;

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const product = byId.get(item.productId);
      if (!product) {
        linesSkipped += 1;
        continue;
      }
      const unit = getProductUnits(product).find(
        (u) => String(u.type).trim() === String(item.unitType).trim(),
      );
      if (!unit) {
        linesSkipped += 1;
        continue;
      }
      const result = cartStore.add(product, unit, item.quantity);
      if (result.ok) {
        linesAdded += result.added > 0 ? 1 : 0;
      } else {
        linesSkipped += 1;
      }
    }
  }

  return {
    linesAdded,
    linesSkipped,
    ordersProcessed: orders.length,
  };
}
