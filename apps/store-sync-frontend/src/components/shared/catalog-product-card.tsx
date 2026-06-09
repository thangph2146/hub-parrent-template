"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package2, ShoppingCart, Tag } from "lucide-react";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import {
  ProductDetailOrderRow,
  ProductDetailUnitPicker,
  formatProductVnd,
} from "@ui/components/product";
import type { Product, ProductUnitType } from "@/lib/api";
import { getProductUnits } from "@/lib/catalog-filters";
import { unitSellingAndListPrice } from "@/lib/product-price";
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
  const pricingQty = qtyInCart + quantity;

  const isWholesale = selectedUnit.wholesalePrice !== null;
  const { current: displayPrice, list: listPrice } = unitSellingAndListPrice(
    selectedUnit,
    pricingQty,
  );

  const maxQty = Math.max(
    1,
    Math.floor(p.stock / Math.max(selectedUnit.qtyPerUnit, 1)),
  );
  const minPurchaseQty = 1;
  const outOfStock = maxQty <= 0;
  const totalUnits = quantity * Math.max(selectedUnit.qtyPerUnit, 1);
  const stockWarning = totalUnits > p.stock * 0.8;
  const stockStatus = outOfStock ? "out" : stockWarning ? "low" : "ok";

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
          hasPromo: unit.wholesalePrice !== null,
        };
      }),
    [units, quantity, cart.lines, p.id],
  );

  const handleUnitChange = (type: string) => {
    const next = units.find((unit) => unit.type === type);
    if (!next) return;
    setSelectedUnit(next);
    setQuantity(1);
  };

  const clampQty = (value: number) =>
    Math.max(minPurchaseQty, Math.min(value, maxQty));

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
            className="aspect-[5/4] max-h-48 w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
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

        <div className="mt-auto space-y-3">
          {units.length > 1 ? (
            <ProductDetailUnitPicker
              options={unitOptions}
              selectedType={selectedUnit.type}
              onSelect={handleUnitChange}
              showPrice={false}
              dense
              showLabel={false}
            />
          ) : null}

          <ProductDetailOrderRow
            stacked
            unitPrice={displayPrice}
            listPrice={listPrice}
            unitLabel={selectedUnit.label}
            hasWholesale={isWholesale}
            qty={quantity}
            unitType={selectedUnit.type}
            onQtyChange={(next) => setQuantity(clampQty(next))}
            minQty={minPurchaseQty}
            maxQty={maxQty}
            stockCount={maxQty}
            stockStatus={stockStatus}
            footer={
              <>
                {promoHint}
                <Button
                  type="button"
                  className="h-10 w-full rounded-xl text-sm font-bold"
                  onClick={() => onAddToCart(p, selectedUnit, quantity)}
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
    </article>
  );
}
