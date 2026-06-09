"use client"

import { useEffect, useMemo, useState } from "react"
import { Boxes, Gift, Layers, Package, Sparkles } from "lucide-react"
import type { Product, ProductUnitType } from "@workspace/api-client"
import {
  getProductUnits,
  hasUnitWholesalePromo,
  productBaseStock,
  unitSellingAndListPrice,
  unitStock,
} from "@workspace/api-client"
import { ActiveStatusBadge } from "../badge-presets"
import { Badge } from "../badge"
import {
  FieldSectionBadge,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "../field"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "../admin/pages/admin-detail-layout"
import { ProductDetailPromoGiftsSection } from "./product-detail-promo-gifts-section"
import { ProductDetailGallery } from "./product-detail-gallery"
import { ProductDetailInfoHeader } from "./product-detail-info-header"
import { ProductDetailLayout } from "./product-detail-layout"
import { ProductDetailMetaGrid } from "./product-detail-meta-grid"
import { ProductDetailPricePanel } from "./product-detail-price-panel"
import { formatProductVnd } from "./product-money"
import { cn } from "../../lib/utils"

function unitImages(unit: ProductUnitType, product: Product) {
  const own = (unit.images ?? []).filter((url) => url.trim().length > 0)
  if (own.length > 0) return own
  return (product.images ?? []).filter((url) => url.trim().length > 0)
}

export type ProductAdminDetailProps = {
  product: Product
  categoryLabel?: string
  className?: string
}

export function ProductAdminDetail({
  product,
  categoryLabel,
  className,
}: ProductAdminDetailProps) {
  const units = useMemo(() => getProductUnits(product), [product])
  const [selectedType, setSelectedType] = useState(units[0]?.type ?? "")
  const selectedUnit =
    units.find((unit) => unit.type === selectedType) ?? units[0]!

  useEffect(() => {
    if (!units.some((unit) => unit.type === selectedType)) {
      setSelectedType(units[0]?.type ?? "")
    }
  }, [units, selectedType])

  const images = unitImages(selectedUnit, product)
  const previewQty = 1
  const { current: unitPrice, list: listPrice } = unitSellingAndListPrice(
    selectedUnit,
    previewQty
  )
  const stock = unitStock(selectedUnit, product)
  const gifts = selectedUnit.giftRules ?? []
  const tier = selectedUnit.priceTiers?.[0]
  const category =
    categoryLabel ??
    product.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <AdminDetailLayout className={className}>
      <AdminDetailMain>
        <FieldSet variant="section">
          <FieldSectionLegend
            icon={Package}
            title="Xem trước cửa hàng"
            description="Ảnh, giá và thông tin như khách thấy trên storefront."
            badge={
              units.length > 0 ? (
                <FieldSectionBadge>{units.length}</FieldSectionBadge>
              ) : undefined
            }
          />
          <FieldSetContent variant="section" className="pt-0">
            <ProductDetailLayout
              gallery={
                <ProductDetailGallery images={images} alt={product.name} />
              }
              details={
                <>
              <ProductDetailInfoHeader
            categoryLabel={category}
            title={product.name}
            description={product.description}
            subtitle={
              <span className="font-mono text-xs">
                SKU: {selectedUnit.sku || product.sku}
              </span>
            }
            couponBadges={product.coupons ?? []}
            extraBadges={<ActiveStatusBadge active={product.isActive} />}
          />

          <ProductDetailPricePanel
            unitPrice={unitPrice}
            listPrice={listPrice}
            unitLabel={selectedUnit.label}
            hasWholesale={hasUnitWholesalePromo(selectedUnit)}
            totalLabel={`Giá tham chiếu (1 ${selectedUnit.type})`}
            totalPrice={unitPrice}
            compact
          >
            {selectedUnit.minWholesaleQty > 1 ? (
              <p className="text-sm font-medium text-muted-foreground">
                Giá KM từ{" "}
                <span className="font-black text-primary">
                  {selectedUnit.minWholesaleQty} {selectedUnit.type}
                </span>
              </p>
            ) : null}
            {tier ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" aria-hidden />
                Bậc giá: {tier.label || `Từ ${tier.minQty} sp`} →{" "}
                {formatProductVnd(tier.unitPrice)}
              </p>
            ) : null}
            {hasUnitWholesalePromo(selectedUnit) || gifts.length > 0 ? (
              <div className="border-t border-outline-variant/30 pt-3">
                <ProductDetailPromoGiftsSection
                  unit={selectedUnit}
                  giftRules={gifts}
                  pricingQty={previewQty}
                  productSellQty={previewQty}
                />
              </div>
            ) : null}
          </ProductDetailPricePanel>

          <ProductDetailMetaGrid
            compact
            items={[
              { label: "Thương hiệu", value: product.brand ?? "—" },
              { label: "Xuất xứ", value: product.origin ?? "—" },
              {
                label: "SKU",
                value: selectedUnit.sku || product.sku,
              },
              {
                label: "Tồn",
                value: `${stock} ${selectedUnit.type}`,
              },
            ]}
          />

          {product.fulfillmentNote ? (
            <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
              <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Ghi chú kho / shipper
              </p>
              {product.fulfillmentNote}
            </div>
          ) : null}
                </>
              }
            />
          </FieldSetContent>
        </FieldSet>
      </AdminDetailMain>

      {units.length > 0 ? (
        <AdminDetailSidebar className="lg:sticky lg:top-18 lg:self-start">
          <ProductAdminUnitsSummary
            units={units}
            product={product}
            selectedType={selectedUnit.type}
            onSelect={setSelectedType}
          />
        </AdminDetailSidebar>
      ) : null}
    </AdminDetailLayout>
  )
}

function ProductAdminUnitsSummary({
  units,
  product,
  selectedType,
  onSelect,
}: {
  units: ProductUnitType[]
  product: Product
  selectedType: string
  onSelect: (type: string) => void
}) {
  const poolBase = productBaseStock(product)

  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        icon={Layers}
        title="Tổng hợp loại hàng"
        description="Chọn loại để xem trước storefront bên trái."
        badge={<FieldSectionBadge>{units.length}</FieldSectionBadge>}
      />
      <FieldSetContent variant="section" className="space-y-2.5 pt-0">
        {poolBase > 0 ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Boxes className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Pool tồn chung
              </p>
              <p className="text-base font-bold tabular-nums leading-tight text-primary">
                {poolBase.toLocaleString("vi-VN")}
                <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                  sp gốc
                </span>
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2" role="list">
          {units.map((unit) => {
            const active = unit.type === selectedType
            const giftCount = unit.giftRules?.length ?? 0
            const maxSell = unitStock(unit, product)
            const per = Math.max(1, Math.floor(unit.qtyPerUnit || 1))
            const hasWholesale = hasUnitWholesalePromo(unit)
            const tier = unit.priceTiers?.[0]

            return (
              <button
                key={unit.type}
                type="button"
                role="listitem"
                aria-pressed={active}
                onClick={() => onSelect(unit.type)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/15"
                    : "border-border/80 bg-muted/10 hover:border-primary/35 hover:bg-muted/25",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {unit.label}
                      </p>
                      {unit.isDefault ? (
                        <Badge variant="category" size="xs" className="shrink-0">
                          Mặc định
                        </Badge>
                      ) : null}
                    </div>
                    {!active ? (
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {formatProductVnd(unit.retailPrice)}
                        <span className="mx-1.5 text-border">·</span>
                        Tối đa {maxSell}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    variant={active ? "promo" : "muted"}
                    size="xs"
                    className="shrink-0"
                  >
                    {active ? "Đang xem" : "Chọn"}
                  </Badge>
                </div>

                <div
                  className={cn(
                    "grid grid-cols-2 gap-2 text-xs",
                    active ? "mt-2.5" : "mt-0 hidden",
                  )}
                >
                  <div className="rounded-md bg-background/70 px-2 py-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Giá lẻ
                    </p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {formatProductVnd(unit.retailPrice)}
                    </p>
                  </div>
                  <div className="rounded-md bg-background/70 px-2 py-1.5 text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Tối đa bán
                    </p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {maxSell}
                    </p>
                  </div>
                </div>

                {active ? (
                  <div className="mt-2.5 space-y-2 border-t border-border/50 pt-2.5 text-xs">
                    <p
                      className="truncate font-mono text-[11px] text-muted-foreground"
                      title={unit.sku || unit.type}
                    >
                      SKU: {unit.sku || unit.type}
                    </p>
                    {per > 1 ? (
                      <p className="text-muted-foreground">
                        Quy đổi:{" "}
                        <span className="font-medium text-foreground">
                          1 {unit.label} = {per} sp gốc
                        </span>
                      </p>
                    ) : null}
                    {hasWholesale ? (
                      <p className="text-muted-foreground">
                        Giá sỉ{" "}
                        <span className="font-medium text-primary">
                          {formatProductVnd(unit.wholesalePrice)}
                        </span>
                        {unit.minWholesaleQty > 0
                          ? ` · từ ${unit.minWholesaleQty} sp`
                          : null}
                      </p>
                    ) : null}
                    {tier ? (
                      <p className="inline-flex items-center gap-1 text-muted-foreground">
                        <Sparkles className="size-3 text-primary" aria-hidden />
                        {tier.label || `Từ ${tier.minQty} sp`} →{" "}
                        {formatProductVnd(tier.unitPrice)}
                      </p>
                    ) : null}
                    {giftCount > 0 ? (
                      <p className="inline-flex items-center gap-1 font-medium text-primary">
                        <Gift className="size-3" aria-hidden />
                        {giftCount} quà tặng
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </FieldSetContent>
    </FieldSet>
  )
}

