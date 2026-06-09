"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@ui/components/button";
import { toast } from "sonner";
import {
  ProductDetailActions,
  ProductDetailCallout,
  ProductDetailGallery,
  ProductDetailInfoHeader,
  ProductDetailLayout,
  ProductDetailMetaGrid,
  ProductDetailOrderRow,
  ProductDetailPromoGiftsSection,
  hasUnitWholesalePromo,
  ProductDetailPurchaseCard,
  ProductDetailPurchaseCardSection,
  ProductDetailUnitPicker,
  formatProductVnd,
} from "@ui/components/product";
import type { Product, ProductUnitType } from "@/lib/api";
import { unitSellingAndListPrice } from "@/lib/product-price";
import { getProductUnits } from "@/lib/catalog-filters";
import {
  cartReservedBase,
  clampSellQty,
  productBaseStock,
  remainingUnitStock,
  unitStock,
} from "@workspace/api-client";
import { cartLineQuantity, useCart } from "@/hooks/use-cart";
import { resolveGiftRulesForUnit } from "@/lib/gift-rules-from-fulfillment-note";
import { ProductSuggestions } from "@/components/shared/product-suggestions";

type ProductDetailProps = {
  product: Product;
  backHref?: string;
  supportHref?: string;
};

function resolveDisplayImages(unit: ProductUnitType, product: Product) {
  const own = (unit.images ?? []).filter((url) => url.trim().length > 0);
  if (own.length > 0) return own;
  return (product.images ?? []).filter((url) => url.trim().length > 0);
}

export function ProductDetail({
  product,
  backHref = "/catalog",
  supportHref = "/support",
}: ProductDetailProps) {
  const categoryLabel =
    product.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    product.category;
  const cart = useCart();
  const fallbackUnit: ProductUnitType = useMemo(
    () => ({
      type: product.unit,
      label: product.unit,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      minWholesaleQty: 1,
      qtyPerUnit: 1,
      images: product.images ?? undefined,
    }),
    [product],
  );
  const units: ProductUnitType[] = (() => {
    const parsed = getProductUnits(product);
    return parsed.length > 0 ? parsed : [fallbackUnit];
  })();

  const [selectedUnit, setSelectedUnit] = useState<ProductUnitType>(units[0]!);
  const displayImages = useMemo(
    () => resolveDisplayImages(selectedUnit, product),
    [selectedUnit, product],
  );

  const baseStock = productBaseStock(product);
  const reservedBase = cartReservedBase(cart.lines, product.id);
  const unitStockCount = unitStock(selectedUnit, product);
  const qtyInCart = cartLineQuantity(
    cart.lines,
    product.id,
    selectedUnit.type,
  );
  const availableQty = remainingUnitStock(
    selectedUnit,
    product,
    reservedBase,
  );
  const maxQty = availableQty;
  const minPurchaseQty = availableQty > 0 ? 1 : 0;
  const [qty, setQty] = useState(availableQty > 0 ? 1 : 0);

  useEffect(() => {
    setQty((current) => {
      if (availableQty <= 0) return 0;
      return Math.max(1, Math.min(current || 1, availableQty));
    });
  }, [availableQty, selectedUnit.type]);
  const pricingQty = qtyInCart + qty;
  const productSellQty = useMemo(() => {
    const fromCart = cart.lines
      .filter((line) => line.productId === product.id)
      .reduce((sum, line) => sum + line.quantity, 0);
    return fromCart + qty;
  }, [cart.lines, product.id, qty]);
  const giftRules = useMemo(
    () => resolveGiftRulesForUnit(selectedUnit, product.fulfillmentNote),
    [selectedUnit, product.fulfillmentNote],
  );

  const isWholesale = hasUnitWholesalePromo(selectedUnit);
  const showPromoGiftsSection = isWholesale || giftRules.length > 0;
  const { current: unitPrice, list: listPrice } = unitSellingAndListPrice(
    selectedUnit,
    pricingQty,
  );

  const totalUnits = qty * Math.max(selectedUnit.qtyPerUnit, 1);
  const totalPrice = unitPrice * qty;
  const stockWarning = availableQty > 0 && qty > availableQty * 0.8;
  const outOfStock = availableQty <= 0;

  const clampQty = (value: number) =>
    clampSellQty(value, minPurchaseQty, availableQty);

  const handleUnitChange = (type: string) => {
    const next = units.find((unit) => unit.type === type);
    if (!next) return;
    setSelectedUnit(next);
    const nextReserved = cartReservedBase(cart.lines, product.id);
    const nextAvailable = remainingUnitStock(next, product, nextReserved);
    setQty(nextAvailable > 0 ? 1 : 0);
  };

  const handleAddToCart = () => {
    const safeQty = clampQty(qty);
    if (outOfStock || safeQty <= 0 || safeQty > availableQty) {
      if (!outOfStock && safeQty > availableQty) {
        toast.error(`Chỉ còn ${availableQty} ${selectedUnit.type} trong kho`);
        setQty(clampQty(safeQty));
      }
      return;
    }
    const result = cart.add(product, selectedUnit, safeQty);
    if (!result.ok) {
      toast.error(
        result.reason === "out_of_stock"
          ? `Chỉ còn ${availableQty} ${selectedUnit.type} trong kho`
          : "Số lượng không hợp lệ",
      );
      return;
    }
    toast.success(
      `Đã thêm ${result.added} ${selectedUnit.label} vào giỏ hàng`,
      {
        description: `${product.name} · Tổng: ${formatProductVnd(unitPrice * result.added)}`,
      },
    );
  };

  const unitOptions = units.map((unit) => {
    const inCartU = cartLineQuantity(cart.lines, product.id, unit.type);
    const previewQty = inCartU + qty;
    const { current, list } = unitSellingAndListPrice(unit, previewQty);
    return {
      type: unit.type,
      label: unit.label,
      currentPriceLabel: formatProductVnd(current),
      listPriceLabel: list != null ? formatProductVnd(list) : null,
      hasPromo: hasUnitWholesalePromo(unit),
    };
  });

  return (
    <>
      <Link href={backHref}>
        <Button variant="outline" className="rounded-xl">
          <ArrowLeft className="mr-2 size-4" /> Quay lại danh mục
        </Button>
      </Link>

      <div className="space-y-8">
      <ProductDetailLayout
        gallery={
          <ProductDetailGallery images={displayImages} alt={product.name} />
        }
        details={
          <>
            <ProductDetailInfoHeader
              categoryLabel={categoryLabel}
              title={product.name}
              description={product.description}
              couponBadges={product.coupons ?? []}
            />

            <ProductDetailPurchaseCard>
              {units.length > 1 ? (
                <ProductDetailPurchaseCardSection>
                  <ProductDetailUnitPicker
                    options={unitOptions}
                    selectedType={selectedUnit.type}
                    onSelect={handleUnitChange}
                    showPrice={false}
                    compact
                    showLabel={false}
                  />
                </ProductDetailPurchaseCardSection>
              ) : null}

              <ProductDetailPurchaseCardSection variant="order">
                <ProductDetailOrderRow
                  unitPrice={unitPrice}
                  listPrice={listPrice}
                  unitLabel={selectedUnit.label}
                  hasWholesale={isWholesale}
                  qty={qty}
                  unitType={selectedUnit.type}
                  onQtyChange={(next) => setQty(clampQty(next))}
                  minQty={minPurchaseQty}
                  maxQty={maxQty}
                  equivalentTotal={totalUnits}
                  equivalentUnit={product.unit}
                  stockCount={unitStockCount}
                  stockStatus={
                    outOfStock ? "out" : stockWarning ? "low" : "ok"
                  }
                  footer={
                    <p className="text-[11px] text-muted-foreground">
                      {qtyInCart > 0 ? (
                        <>
                          Trong giỏ{" "}
                          <span className="font-semibold text-foreground">
                            {qtyInCart}
                          </span>
                          {" / tồn "}
                          <span className="font-semibold text-foreground">
                            {unitStockCount}
                          </span>
                          {" · còn thêm "}
                          <span className="font-semibold text-primary">
                            {availableQty}
                          </span>
                          {" + đặt "}
                          <span className="font-semibold text-foreground">
                            {qty}
                          </span>
                          {" → áp giá "}
                          <span className="font-semibold text-primary">
                            {pricingQty}
                          </span>
                        </>
                      ) : (
                        <>
                          Tối đa{" "}
                          <span className="font-semibold text-foreground">
                            {availableQty}
                          </span>{" "}
                          {selectedUnit.type} (pool{" "}
                          <span className="font-semibold text-foreground tabular-nums">
                            {baseStock}
                          </span>{" "}
                          {product.unit})
                        </>
                      )}
                    </p>
                  }
                />
              </ProductDetailPurchaseCardSection>

              {showPromoGiftsSection ? (
                <ProductDetailPurchaseCardSection variant="muted">
                  <ProductDetailPromoGiftsSection
                    unit={selectedUnit}
                    giftRules={giftRules}
                    pricingQty={pricingQty}
                    productSellQty={productSellQty}
                  />
                </ProductDetailPurchaseCardSection>
              ) : null}
            </ProductDetailPurchaseCard>

            {(stockWarning || outOfStock) ? (
              <ProductDetailCallout
                tone="warning"
                icon={AlertTriangle}
                title={
                  outOfStock
                    ? qtyInCart > 0
                      ? "Đã đạt tồn kho trong giỏ"
                      : "Hết hàng"
                    : "Sắp hết hàng"
                }
              />
            ) : null}

            <ProductDetailMetaGrid
              compact
              items={[
                { label: "Thương hiệu", value: product.brand ?? "—" },
                { label: "Xuất xứ", value: product.origin ?? "—" },
                { label: "SKU", value: product.sku },
              ]}
            />

            <ProductDetailActions
              primary={
                <Button
                  className="h-11 w-full rounded-xl px-6 text-sm font-black shadow-sm"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                >
                  <ShoppingCart className="mr-2 size-4" />
                  {outOfStock
                    ? "Hết hàng"
                    : `Thêm vào giỏ – ${formatProductVnd(totalPrice)}`}
                </Button>
              }
              secondary={
                <Link href={supportHref} className="block h-full">
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl px-5 text-sm font-semibold sm:min-w-[7.5rem]"
                  >
                    <Truck className="mr-1.5 size-3.5" /> Tư vấn
                  </Button>
                </Link>
              }
              trust={
                !outOfStock ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    Còn hàng · Giao hôm nay hoặc ngày mai
                  </p>
                ) : null
              }
            />
          </>
        }
      />

      <ProductSuggestions productId={product.id} category={product.category} />
      </div>
    </>
  );
}
