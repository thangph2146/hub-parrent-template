"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@ui/components/drawer";
import { Button } from "@ui/components/button";
import {
  ProductCartPriceBadge,
  ProductUnitLabelBadge,
} from "@ui/components/product";
import {
  Minus,
  Package2,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  Gift,
} from "lucide-react";
import {
  cartNeedsStockSync,
  cartStore,
  useCart,
  useCartStockSync,
} from "@/hooks/use-cart";
import { useCartStockProducts } from "@/hooks/queries";
import { formatVND } from "@/lib/format";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@ui/lib/utils";
import {
  giftRulesForCartLine,
  isCartGiftRuleUnlocked,
} from "@/lib/cart-gift-rules";
import { useGiftProductCatalogMap } from "@/hooks/use-gift-product-catalog";
import { CartGiftRuleText } from "@/components/shared/cart-gift-rule-text";

type CartDrawerContextValue = {
  openCart: () => void;
  closeCart: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useOpenCartDrawer(): () => void {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useOpenCartDrawer must be used within CartDrawerHost");
  }
  return ctx.openCart;
}

function CartDrawerPanel({
  onNavigate,
  drawerOpen,
}: {
  onNavigate: () => void;
  drawerOpen: boolean;
}) {
  const {
    lines,
    unitCount,
    subtotal,
    promoDiscount,
    grandTotal,
    setQuantity,
    remove,
    clear,
  } = useCart();
  const isEmpty = lines.length === 0;
  const productIds = useMemo(
    () => [...new Set(lines.map((l) => l.productId))],
    [lines],
  );
  const {
    data: stockProducts,
    refetch: refetchStock,
    isFetching: isRefreshingStock,
  } = useCartStockProducts(productIds);
  useCartStockSync(stockProducts);

  useEffect(() => {
    if (!drawerOpen || !productIds.length) return;
    void refetchStock();
  }, [drawerOpen, productIds, refetchStock]);

  const stockIssues = useMemo(
    () =>
      stockProducts?.length
        ? cartStore.validateStockAgainstProducts(stockProducts)
        : [],
    [stockProducts],
  );
  const stockPending = cartNeedsStockSync(lines) && isRefreshingStock;
  const canCheckout =
    !isEmpty &&
    !stockPending &&
    stockIssues.length === 0 &&
    lines.every((l) => l.quantity > 0 && l.stock > 0);

  const handleCheckoutClick = (
    event: { preventDefault: () => void },
  ): void => {
    if (canCheckout) return;
    event.preventDefault();
    if (stockPending) {
      toast.message("Đang kiểm tra tồn kho…");
      return;
    }
    toast.error(stockIssues[0] ?? "Giỏ hàng chưa hợp lệ — vui lòng điều chỉnh số lượng");
  };
  const productSellTotals = useMemo(() => {
    const map = new Map<number, number>();
    for (const line of lines) {
      map.set(
        line.productId,
        (map.get(line.productId) ?? 0) + line.quantity,
      );
    }
    return map;
  }, [lines]);

  const cartGiftRules = useMemo(
    () => lines.flatMap((line) => giftRulesForCartLine(line)),
    [lines],
  );
  const { data: giftCatalogMap } = useGiftProductCatalogMap(cartGiftRules);
  const giftHrefForRule = useCallback(
    (rule: { id: string }) => giftCatalogMap?.get(rule.id),
    [giftCatalogMap],
  );

  return (
    <DrawerContent className="flex h-full max-h-svh w-full max-w-md flex-col border-l border-outline-variant p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-md data-[vaul-drawer-direction=right]:sm:max-w-md">
      <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-outline-variant px-6 py-5">
        <div>
          <DrawerTitle className="flex items-center gap-2 text-xl font-extrabold">
            <ShoppingCart className="size-5 text-primary" aria-hidden />
            Giỏ hàng
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            {isEmpty
              ? "Chưa có sản phẩm nào"
              : `${lines.length} loại · ${unitCount} đơn vị`}
          </DrawerDescription>
        </div>
        {!isEmpty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            className="rounded-lg text-destructive hover:bg-destructive/10"
          >
            <X className="mr-1 size-4" aria-hidden />
            Xoá tất cả
          </Button>
        )}
      </DrawerHeader>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {!isEmpty && (stockPending || stockIssues.length > 0) && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
              stockIssues.length > 0
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : "border-outline-variant/40 bg-muted/30 text-muted-foreground",
            )}
          >
            {stockPending ? (
              <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <p>
              {stockPending
                ? "Đang đồng bộ tồn kho từ server…"
                : stockIssues[0]}
            </p>
          </div>
        )}

        {isEmpty && (
          <div className="space-y-3 py-16 text-center">
            <Package2 className="mx-auto size-16 text-outline-variant opacity-30" />
            <p className="text-base font-bold text-muted-foreground">
              Giỏ hàng trống
            </p>
            <p className="text-sm text-muted-foreground">
              Hãy chọn sản phẩm từ danh mục để bắt đầu mua sắm.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/catalog" onClick={onNavigate} />}
              className="mt-2 rounded-xl"
            >
              Xem danh mục
            </Button>
          </div>
        )}

        {lines.map((line) => {
          const maxQty =
            line.stock > 0 ? Math.max(0, Math.floor(line.stock)) : line.quantity;
          const listUnit = line.listUnitPrice ?? line.unitPrice;
          const unitNow = line.unitPrice;
          const showListStrike = listUnit > unitNow;
          const listLineTotal = listUnit * line.quantity;
          const saleLineTotal = unitNow * line.quantity;

          const retailUnit = Math.max(0, Math.floor(listUnit));
          const promoUnitRaw = line.promoUnitPrice;
          const promoUnitFloored =
            promoUnitRaw != null &&
            Number.isFinite(promoUnitRaw) &&
            Math.floor(promoUnitRaw) > 0
              ? Math.floor(promoUnitRaw)
              : null;
          const hasPromoTier =
            promoUnitFloored != null &&
            retailUnit > 0 &&
            promoUnitFloored < retailUnit;
          const discountPct =
            hasPromoTier && retailUnit > 0
              ? Math.round(
                  ((retailUnit - promoUnitFloored!) / retailUnit) * 100,
                )
              : 0;
          const minQ = Math.max(0, Math.floor(line.minPromoQty ?? 0));
          const needMoreForKm =
            minQ > 1 && line.quantity < minQ ? minQ - line.quantity : 0;

          const giftRules = giftRulesForCartLine(line);
          const productSellQty =
            productSellTotals.get(line.productId) ?? line.quantity;

          return (
            <div
              key={`${line.productId}:${line.unitType}`}
              className="flex gap-3 rounded-2xl border border-outline-variant bg-background p-3"
            >
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/40 bg-white">
                {line.image ? (
                  <img
                    src={line.image}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <Package2 className="size-7 text-outline-variant" />
                )}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="line-clamp-2 text-sm font-bold leading-snug">
                  {line.name}
                </p>
                <ProductUnitLabelBadge className="mt-1" variant="muted">
                  {line.unitLabel}
                </ProductUnitLabelBadge>

                <div className="mt-2 flex flex-wrap items-end gap-1.5 sm:gap-2">
                  {showListStrike && (
                    <p className="mb-0.5 text-sm font-semibold text-muted-foreground line-through">
                      {formatVND(listUnit)}
                    </p>
                  )}
                  <p className="text-lg font-black text-primary sm:text-xl">
                    {formatVND(unitNow)}
                  </p>
                  <p className="mb-0.5 text-xs text-muted-foreground sm:text-sm">
                    / {line.unitLabel}
                  </p>
                  {line.isWholesale ? (
                    <ProductCartPriceBadge
                      saleActive={showListStrike}
                      className="mb-0.5"
                    />
                  ) : null}
                </div>

                {hasPromoTier && (
                  <div
                    className={cn(
                      "mt-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug sm:text-xs",
                      minQ > 1
                        ? line.isWholesale
                          ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                          : "border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                        : "border-outline-variant/50 bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {minQ > 1 ? (
                      <>
                        <p className="font-medium text-foreground">
                          Điều kiện KM: từ{" "}
                          <span className="font-bold text-primary">
                            {minQ} {line.unitType}
                          </span>{" "}
                          trở lên
                          {discountPct > 0 ? (
                            <>
                              {" "}
                              — giảm ~{discountPct}% so với giá niêm yết
                            </>
                          ) : null}
                          .
                        </p>
                        <p
                          className={cn(
                            "mt-0.5",
                            line.isWholesale
                              ? "text-emerald-800 dark:text-emerald-300"
                              : "text-amber-900 dark:text-amber-200",
                          )}
                        >
                          {line.isWholesale
                            ? `Đang đủ: ${line.quantity} ${line.unitType} — áp giá KM (${formatVND(promoUnitFloored!)} / ${line.unitLabel}).`
                            : `Hiện ${line.quantity} ${line.unitType}; cần thêm ít nhất ${needMoreForKm} ${line.unitType} để áp giá KM (${formatVND(promoUnitFloored!)} / ${line.unitLabel}).`}
                        </p>
                      </>
                    ) : (
                      <p>
                        {discountPct > 0 ? (
                          <>
                            Giá KM áp dụng mọi số lượng (khoảng {discountPct}% so
                            với {formatVND(retailUnit)} / {line.unitLabel}).
                          </>
                        ) : (
                          <>
                            Giá KM áp dụng mọi số lượng —{" "}
                            {formatVND(promoUnitFloored!)} / {line.unitLabel}.
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {giftRules.length > 0 ? (
                  <div className="mt-1.5 space-y-1.5">
                    {giftRules.map((rule) => {
                      const giftUnlocked = isCartGiftRuleUnlocked(
                        rule,
                        line,
                        productSellQty,
                      );
                      const minQty = rule.trigger.minQty ?? 0;
                      return (
                        <div
                          key={rule.id}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug sm:text-xs",
                            giftUnlocked
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-warning/30 bg-warning/10 text-warning",
                          )}
                        >
                          <p className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Gift className="size-3.5 shrink-0" aria-hidden />
                            {giftUnlocked
                              ? "Đã đủ điều kiện nhận quà"
                              : "Ưu đãi quà tặng"}
                          </p>
                          <p className="mt-0.5 text-foreground">
                            <CartGiftRuleText
                              rule={rule}
                              giftHref={giftHrefForRule(rule)}
                            >
                              .
                            </CartGiftRuleText>
                          </p>
                          {!giftUnlocked && minQty > 0 ? (
                            <p className="mt-0.5 text-[10px] opacity-90 sm:text-xs">
                              Cần thêm{" "}
                              <span className="font-bold">
                                {Math.max(0, minQty - line.quantity)}
                              </span>{" "}
                              {line.unitType} trong giỏ để đủ điều kiện quà.
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {line.stock > 0 ? (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Tối đa{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {line.stock}
                    </span>{" "}
                    {line.unitType} trong kho
                  </p>
                ) : null}

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex h-8 items-center overflow-hidden rounded-lg border border-outline-variant bg-surface">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() =>
                        setQuantity(
                          line.productId,
                          line.unitType,
                          line.quantity - 1,
                        )
                      }
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-9 text-center text-sm font-bold">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      disabled={line.quantity >= maxQty}
                      onClick={() =>
                        setQuantity(
                          line.productId,
                          line.unitType,
                          line.quantity + 1,
                        )
                      }
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="shrink-0 text-right">
                    {showListStrike && (
                      <p className="text-xs text-muted-foreground line-through tabular-nums">
                        {formatVND(listLineTotal)}
                      </p>
                    )}
                    <p className="text-sm font-black tabular-nums text-primary">
                      {formatVND(saleLineTotal)}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-destructive hover:bg-destructive/10"
                onClick={() => remove(line.productId, line.unitType)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {!isEmpty && (
        <DrawerFooter className="flex-col gap-3 border-t border-outline-variant px-6 py-5 sm:flex-col">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatVND(subtotal)}
              </span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Mã khuyến mãi</span>
                <span className="font-semibold tabular-nums">
                  −{formatVND(promoDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-outline-variant/60 pt-2 text-base font-semibold">
              <span className="text-muted-foreground">Ước tính thanh toán</span>
              <span className="text-xl font-black tabular-nums text-primary">
                {formatVND(grandTotal)}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Thanh toán khi nhận hàng (COD). Phí vận chuyển sẽ được tính khi xác
            nhận đơn.
          </p>
          <Button
            nativeButton={false}
            disabled={!canCheckout}
            render={
              <Link
                href="/checkout"
                onClick={(e) => {
                  handleCheckoutClick(e);
                  if (canCheckout) onNavigate();
                }}
              />
            }
            className="h-12 w-full rounded-xl font-bold"
          >
            {stockPending
              ? "Đang kiểm tra tồn…"
              : !canCheckout
                ? "Không đủ tồn kho"
                : "Tiến hành đặt hàng"}
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/cart" onClick={onNavigate} />}
            className="w-full rounded-xl"
          >
            Mở trang giỏ đầy đủ
          </Button>
        </DrawerFooter>
      )}
    </DrawerContent>
  );
}

/** Bọc toàn bộ storefront cần nút mở giỏ (vd. quanh `<Header />`). */
export function CartDrawerHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ openCart, closeCart }),
    [openCart, closeCart],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      <Drawer
        direction="right"
        open={open}
        onOpenChange={setOpen}
        shouldScaleBackground={false}
      >
        {children}
        <CartDrawerPanel onNavigate={closeCart} drawerOpen={open} />
      </Drawer>
    </CartDrawerContext.Provider>
  );
}
