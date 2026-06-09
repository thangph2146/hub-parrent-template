"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package2, ShoppingCart, Tag } from "lucide-react";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import {
  ProductDetailOrderRow,
  ProductDetailUnitPicker,
  formatProductVnd,
  hasUnitWholesalePromo,
} from "@ui/components/product";
import {
  cartReservedBase,
  clampSellQty,
  remainingUnitStock,
  unitStock,
} from "@workspace/api-client";
import type { Product, ProductUnitType } from "@/lib/api";
import { getProductUnits } from "@/lib/catalog-filters";
import { unitSellingAndListPrice } from "@workspace/api-client";
import { cartLineQuantity, useCart } from "@/hooks/use-cart";

export type CatalogProductCardProps = {
  product: Product;
  categoryLabel: string;
  onAddToCart: (product: Product, unit: ProductUnitType, qty: number) => void;
};

export function CatalogProductCard({
  product: p,
  categoryLabel,
  onAddToCart,
}: CatalogProductCardProps) {
  const cart = useCart();
  const units = useMemo(() => getProductUnits(p), [p]);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnitType>(units[0]!);
  const [quantity, setQuantity] = useState(1);

  const qtyInCart = cartLineQuantity(cart.lines, p.id, selectedUnit.type);
  const reservedBase = cartReservedBase(cart.lines, p.id);
  const pricingQty = qtyInCart + quantity;

  const isWholesale = hasUnitWholesalePromo(selectedUnit);
  const unitStockCount = unitStock(selectedUnit, p);
  const availableQty = remainingUnitStock(selectedUnit, p, reservedBase);
  const { current: displayPrice, list: listPrice } = unitSellingAndListPrice(
    selectedUnit,
    pricingQty,
  );

  const maxQty = availableQty;
  const minPurchaseQty = availableQty > 0 ? 1 : 0;
  const outOfStock = availableQty <= 0;
  const stockWarning = availableQty > 0 && quantity > availableQty * 0.8;
  const stockStatus = outOfStock ? "out" : stockWarning ? "low" : "ok";

  useEffect(() => {
    setQuantity((current) => {
      if (availableQty <= 0) return 0;
      return Math.max(1, Math.min(current || 1, availableQty));
    });
  }, [availableQty, selectedUnit.type]);

  const primaryImage = p.images?.[0];
  const firstCoupon = p.coupons?.[0];
  const meta = [p.brand, p.origin].filter(Boolean).join(" · ");

  const unitOptions = useMemo(
    () =>
      units.map((unit) => {
        const inCartU = cartLineQuantity(cart.lines, p.id, unit.type);
        const previewQty = inCartU + quantity;
        const { current, list } = unitSellingAndListPrice(unit, previewQty);
        return {
          type: unit.type,
          label: unit.label,
          currentPriceLabel: formatProductVnd(current),
          listPriceLabel: list != null ? formatProductVnd(list) : null,
          hasPromo: hasUnitWholesalePromo(unit),
        };
      }),
    [units, quantity, cart.lines, p.id],
  );

  const handleUnitChange = (type: string) => {
    const next = units.find((unit) => unit.type === type);
    if (!next) return;
    setSelectedUnit(next);
    const nextReserved = cartReservedBase(cart.lines, p.id);
    const nextAvailable = remainingUnitStock(next, p, nextReserved);
    setQuantity(nextAvailable > 0 ? 1 : 0);
  };

  const clampQty = (value: number) =>
    clampSellQty(value, minPurchaseQty, availableQty);

  const promoHint =
    isWholesale &&
    selectedUnit.minWholesaleQty > 1 &&
    pricingQty < selectedUnit.minWholesaleQty ? (
      <p className="text-[11px] leading-snug text-muted-foreground">
        Giá KM từ {selectedUnit.minWholesaleQty} {selectedUnit.type}
        {qtyInCart > 0 ? (
          <>
            {" "}
            · Tổng xét giá{" "}
            <span className="font-semibold text-foreground">{pricingQty}</span>
          </>
        ) : null}
      </p>
    ) : null;

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-card shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:border-primary/20 hover:shadow-md dark:ring-white/[0.04]">
      <Link
        href={`/catalog/${p.id}`}
        className="relative block overflow-hidden bg-muted/15"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={p.name}
            className="aspect-[8/5] max-h-48 w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
          />
        ) : (
          <div className="flex aspect-[5/4] max-h-48 w-full items-center justify-center bg-muted/25">
            <Package2 className="size-10 text-outline-variant" aria-hidden />
          </div>
        )}

        {firstCoupon ? (
          <Badge
            variant="coupon"
            size="xs"
            shape="pill"
            className="absolute top-2.5 left-2.5 max-w-[70%] truncate shadow-sm"
          >
            <Tag aria-hidden />
            {firstCoupon}
          </Badge>
        ) : null}

        <span className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center opacity-0 transition-opacity group-hover/card:opacity-100">
          <Badge variant="overlay" size="sm" className="gap-1 shadow-md">
            Xem chi tiết
            <ArrowRight className="size-3.5" aria-hidden />
          </Badge>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <Badge variant="category" size="xs">
            {categoryLabel}
          </Badge>
          <Link href={`/catalog/${p.id}`}>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug transition-colors hover:text-primary">
              {p.name}
            </h3>
          </Link>
          {meta ? (
            <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>

        <div className="mt-auto">
          <div className="overflow-hidden bg-muted/15 space-y-2">
            {units.length > 1 ? (
              <div className="border border-outline-variant rounded-lg bg-background/40 p-2">
                <ProductDetailUnitPicker
                  options={unitOptions}
                  selectedType={selectedUnit.type}
                  onSelect={handleUnitChange}
                  showPrice={false}
                  layout="chips"
                  showLabel={false}
                />
              </div>
            ) : null}

            <ProductDetailOrderRow
              stacked
              className="rounded-none border-0 bg-transparent shadow-none"
              unitPrice={displayPrice}
              listPrice={listPrice}
              unitLabel={selectedUnit.label}
              hasWholesale={isWholesale}
              qty={quantity}
              unitType={selectedUnit.type}
              onQtyChange={(next) => setQuantity(clampQty(next))}
              minQty={minPurchaseQty}
              maxQty={maxQty}
              stockCount={unitStockCount}
              stockStatus={stockStatus}
              footer={
                <>
                  {promoHint}
                  <Button
                    type="button"
                    className="h-10 w-full rounded-xl text-sm font-bold"
                    onClick={() => {
                      if (outOfStock || quantity > availableQty) return;
                      onAddToCart(p, selectedUnit, quantity);
                    }}
                    disabled={outOfStock}
                  >
                    <ShoppingCart className="mr-1.5 size-4" />
                    {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                  </Button>
                </>
              }
            />
          </div>
        </div>
      </div>
    </article>
  );
}
