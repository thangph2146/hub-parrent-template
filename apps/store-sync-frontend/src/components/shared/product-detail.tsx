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
  ProductDetailCallout,
  ProductDetailGallery,
  ProductDetailInfoHeader,
  ProductDetailLayout,
  ProductDetailMetaGrid,
  ProductDetailPricePanel,
  ProductDetailQtyStepper,
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

  const handleQtyChange = (delta: number) => {
    setQty((prev) =>
      Math.max(minPurchaseQty, Math.min(prev + delta, maxQty)),
    );
  };

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

            <ProductDetailUnitPicker
              options={unitOptions}
              selectedType={selectedUnit.type}
              onSelect={handleUnitChange}
            />

            <ProductDetailPricePanel
              unitPrice={unitPrice}
              listPrice={listPrice}
              unitLabel={selectedUnit.label}
              hasWholesale={isWholesale}
              totalLabel={`Tổng cộng (${qty} ${selectedUnit.type}${
                selectedUnit.qtyPerUnit > 1
                  ? ` × ${selectedUnit.qtyPerUnit} ${product.unit}`
                  : ""
              })`}
              totalPrice={totalPrice}
            >
              {qtyInCart > 0 ? (
                <p className="text-xs font-medium text-muted-foreground">
                  Trong giỏ:{" "}
                  <span className="font-bold text-foreground">
                    {qtyInCart} {selectedUnit.type}
                  </span>
                  {" · "}
                  Đang thêm:{" "}
                  <span className="font-bold text-foreground">{qty}</span>
                  {" → "}
                  Tổng (áp giá):{" "}
                  <span className="font-bold text-primary">{pricingQty}</span>
                </p>
              ) : null}
              {isWholesale && minPromoQty > 1 ? (
                <p className="text-sm font-medium text-muted-foreground">
                  Từ{" "}
                  <span className="font-black text-primary">
                    {minPromoQty} {selectedUnit.type}
                  </span>{" "}
                  trở lên mới áp giá khuyến mãi; mua ít hơn vẫn được (giá ban đầu).
                </p>
              ) : null}
              {isWholesale && minPromoQty > 1 ? (
                <ProductDetailCallout
                  tone={pricingQty >= minPromoQty ? "success" : "warning"}
                  icon={Percent}
                  title={
                    pricingQty >= minPromoQty
                      ? "Đã chuyển sang giá khuyến mãi"
                      : "Chưa đủ điều kiện giá khuyến mãi"
                  }
                >
                  Điều kiện áp dụng: từ{" "}
                  <span className="font-bold">
                    {minPromoQty} {selectedUnit.type}
                  </span>
                  {priceDiscountPercent > 0 ? (
                    <>
                      {" "}
                      - giảm{" "}
                      <span className="font-bold">{priceDiscountPercent}%</span>.
                    </>
                  ) : (
                    "."
                  )}
                </ProductDetailCallout>
              ) : null}
              {activeGiftRule ? (
                <ProductDetailCallout
                  tone={isGiftUnlocked ? "success" : "warning"}
                  icon={Gift}
                  title={
                    isGiftUnlocked
                      ? "Đã đủ điều kiện nhận quà"
                      : "Ưu đãi quà tặng"
                  }
                >
                  Từ <span className="font-bold">{activeGiftRule.minQty}</span>{" "}
                  {selectedUnit.type}: tặng{" "}
                  <span className="font-bold">
                    {activeGiftRule.giftQty} {activeGiftRule.giftName}
                  </span>
                </ProductDetailCallout>
              ) : null}
            </ProductDetailPricePanel>

            <ProductDetailQtyStepper
              qty={qty}
              unitType={selectedUnit.type}
              onDecrease={() => handleQtyChange(-1)}
              onIncrease={() => handleQtyChange(1)}
              decreaseDisabled={qty <= minPurchaseQty}
              increaseDisabled={outOfStock}
              summary={
                <>
                  <p>
                    ={" "}
                    <span className="font-bold text-foreground">
                      {totalUnits.toLocaleString("vi-VN")}
                    </span>{" "}
                    {product.unit}
                  </p>
                  <p className="text-xs">
                    Tồn kho:{" "}
                    <span
                      className={`font-bold ${
                        outOfStock
                          ? "text-destructive"
                          : stockWarning
                            ? "text-warning"
                            : "text-success"
                      }`}
                    >
                      {product.stock} {product.unit}
                    </span>
                  </p>
                </>
              }
            />

            {stockWarning && !outOfStock ? (
              <ProductDetailCallout
                tone="warning"
                icon={AlertTriangle}
                title="Sắp hết hàng – chỉ còn ít trong kho"
              />
            ) : null}
            {outOfStock ? (
              <ProductDetailCallout
                tone="warning"
                icon={AlertTriangle}
                title="Số lượng vượt quá tồn kho hiện tại"
              />
            ) : null}

            <ProductDetailMetaGrid
              items={[
                { label: "Thương hiệu", value: product.brand ?? "—" },
                { label: "Xuất xứ", value: product.origin ?? "—" },
                { label: "Mã SKU", value: product.sku },
                {
                  label: "Tồn kho",
                  value: `${product.stock} ${product.unit}`,
                },
              ]}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                className="h-14 flex-1 rounded-xl px-8 text-base font-black"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                <ShoppingCart className="mr-2 size-5" />
                {outOfStock
                  ? "Hết hàng"
                  : `Thêm vào giỏ – ${formatProductVnd(totalPrice)}`}
              </Button>
              <Link href={supportHref}>
                <Button
                  variant="outline"
                  className="h-14 w-full rounded-xl px-6 font-bold sm:w-auto"
                >
                  <Truck className="mr-2 size-4" /> Tư vấn
                </Button>
              </Link>
            </div>

            {!outOfStock ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="size-4" /> Còn hàng – giao trong hôm
                nay hoặc ngày mai
              </div>
            ) : null}
          </>
        }
      />
    </>
  );
}
