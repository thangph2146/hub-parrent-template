"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  Gift,
  Percent,
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
  ProductDetailPurchaseCard,
  ProductDetailPurchaseCardSection,
  ProductDetailUnitPicker,
  formatProductVnd,
} from "@ui/components/product";
import type { Product, ProductUnitType } from "@/lib/api";
import { unitSellingAndListPrice } from "@/lib/product-price";
import { getProductUnits } from "@/lib/catalog-filters";
import { cartLineQuantity, useCart } from "@/hooks/use-cart";
import { getActiveGiftRuleForUnit } from "@/lib/gift-rules-from-fulfillment-note";

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

  const minPurchaseQty = 1;
  const minPromoQty =
    selectedUnit.minWholesaleQty > 0 ? selectedUnit.minWholesaleQty : 1;
  const maxQty = Math.max(
    1,
    Math.floor(product.stock / Math.max(selectedUnit.qtyPerUnit, 1)),
  );
  const [qty, setQty] = useState(1);

  const qtyInCart = cartLineQuantity(
    cart.lines,
    product.id,
    selectedUnit.type,
  );
  const pricingQty = qtyInCart + qty;
  const activeGiftRule = useMemo(
    () => getActiveGiftRuleForUnit(product.fulfillmentNote, selectedUnit.type),
    [product.fulfillmentNote, selectedUnit.type],
  );
  const isGiftUnlocked = activeGiftRule != null && pricingQty >= activeGiftRule.minQty;

  const isWholesale = selectedUnit.wholesalePrice !== null;
  const priceDiscountPercent = useMemo(() => {
    const wholesale = selectedUnit.wholesalePrice;
    if (wholesale == null) return 0;
    const retail = Math.max(0, Math.floor(selectedUnit.retailPrice || 0));
    const promo = Math.max(0, Math.floor(wholesale || 0));
    if (retail <= 0 || promo <= 0 || promo >= retail) return 0;
    return Math.round(((retail - promo) / retail) * 100);
  }, [selectedUnit.retailPrice, selectedUnit.wholesalePrice]);
  const { current: unitPrice, list: listPrice } = unitSellingAndListPrice(
    selectedUnit,
    pricingQty,
  );

  const totalUnits = qty * Math.max(selectedUnit.qtyPerUnit, 1);
  const totalPrice = unitPrice * qty;
  const stockWarning = totalUnits > product.stock * 0.8;
  const outOfStock = maxQty <= 0 || qty > maxQty;

  const clampQty = (value: number) =>
    Math.max(minPurchaseQty, Math.min(value, maxQty));

  const handleUnitChange = (type: string) => {
    const next = units.find((unit) => unit.type === type);
    if (!next) return;
    setSelectedUnit(next);
    setQty(1);
  };

  const handleAddToCart = () => {
    if (outOfStock) return;
    cart.add(product, selectedUnit, qty);
    toast.success(`Đã thêm ${qty} ${selectedUnit.label} vào giỏ hàng`, {
      description: `${product.name} · Tổng: ${formatProductVnd(totalPrice)}`,
    });
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
      hasPromo: unit.wholesalePrice !== null,
    };
  });

  return (
    <>
      <Link href={backHref}>
        <Button variant="outline" className="rounded-xl">
          <ArrowLeft className="mr-2 size-4" /> Quay lại danh mục
        </Button>
      </Link>

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
                  stockCount={product.stock}
                  stockStatus={
                    outOfStock ? "out" : stockWarning ? "low" : "ok"
                  }
                  footer={
                    qtyInCart > 0 ? (
                      <p className="text-[11px] text-muted-foreground">
                        Trong giỏ{" "}
                        <span className="font-semibold text-foreground">
                          {qtyInCart}
                        </span>
                        {" + đặt "}
                        <span className="font-semibold text-foreground">
                          {qty}
                        </span>
                        {" → áp giá "}
                        <span className="font-semibold text-primary">
                          {pricingQty}
                        </span>
                      </p>
                    ) : null
                  }
                />
              </ProductDetailPurchaseCardSection>

              {isWholesale && minPromoQty > 1 ? (
                <ProductDetailPurchaseCardSection variant="muted" className="space-y-2">
                  <ProductDetailCallout
                    tone={pricingQty >= minPromoQty ? "success" : "warning"}
                    icon={Percent}
                    title={
                      pricingQty >= minPromoQty
                        ? "Đã áp giá khuyến mãi"
                        : `Cần từ ${minPromoQty} ${selectedUnit.type} để giảm giá`
                    }
                  >
                    {priceDiscountPercent > 0 ? (
                      <>
                        Giảm{" "}
                        <span className="font-bold">{priceDiscountPercent}%</span>{" "}
                        khi đủ số lượng.
                      </>
                    ) : null}
                  </ProductDetailCallout>
                </ProductDetailPurchaseCardSection>
              ) : null}

              {activeGiftRule ? (
                <ProductDetailPurchaseCardSection variant="muted">
                  <ProductDetailCallout
                    tone={isGiftUnlocked ? "success" : "warning"}
                    icon={Gift}
                    title={
                      isGiftUnlocked
                        ? "Đủ điều kiện nhận quà"
                        : "Quà tặng kèm"
                    }
                  >
                    Từ {activeGiftRule.minQty} {selectedUnit.type}: tặng{" "}
                    <span className="font-bold">
                      {activeGiftRule.giftQty} {activeGiftRule.giftName}
                    </span>
                  </ProductDetailCallout>
                </ProductDetailPurchaseCardSection>
              ) : null}
            </ProductDetailPurchaseCard>

            {(stockWarning || outOfStock) ? (
              <ProductDetailCallout
                tone="warning"
                icon={AlertTriangle}
                title={
                  outOfStock
                    ? "Vượt tồn kho hiện tại"
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
    </>
  );
}
