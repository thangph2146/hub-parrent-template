"use client";

import { useMemo } from "react";
import { useCart, useCartStockSync } from "@/hooks/use-cart";
import { useCartStockProducts } from "@/hooks/queries";

/**
 * Đồng bộ tồn kho giỏ với API theo từng SP trong giỏ (polling 10s).
 * Gắn ở root layout để mọi trang / drawer đều có tồn realtime.
 */
export function CartSyncBridge(): null {
  const { lines } = useCart();
  const productIds = useMemo(
    () => [...new Set(lines.map((l) => l.productId))],
    [lines],
  );
  const { data: products } = useCartStockProducts(productIds);
  useCartStockSync(products);
  return null;
}
