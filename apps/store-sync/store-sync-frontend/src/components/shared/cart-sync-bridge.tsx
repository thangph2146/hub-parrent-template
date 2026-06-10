"use client";

import { useEffect, useMemo, useRef } from "react";
import { useCart, useCartStockSync } from "@/hooks/use-cart";
import { useCartStockProducts } from "@/hooks/queries";
import { useSession } from "@/hooks/use-session";
import {
  hydrateCartAfterLogin,
  resetCartHydration,
  schedulePushUserCart,
} from "@/lib/cart-sync";

/**
 * Đồng bộ giỏ:
 * - Tồn kho từ catalog (polling 10s)
 * - Giỏ server khi đã đăng nhập (hydrate + debounce push)
 */
export function CartSyncBridge(): null {
  const session = useSession();
  const { lines, appliedPromoCode } = useCart();
  const productIds = useMemo(
    () => [...new Set(lines.map((l) => l.productId))],
    [lines],
  );
  const { data: products } = useCartStockProducts(productIds);
  useCartStockSync(products);

  const userId = session?.id ?? null;
  const hydrating = useRef(false);

  useEffect(() => {
    if (!userId) {
      resetCartHydration();
      return;
    }
    let cancelled = false;
    void (async () => {
      if (hydrating.current) return;
      hydrating.current = true;
      try {
        await hydrateCartAfterLogin();
      } finally {
        if (!cancelled) hydrating.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    schedulePushUserCart(800);
  }, [userId, lines, appliedPromoCode]);

  return null;
}
