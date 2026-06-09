"use client"

import { useEffect, useMemo, useState } from "react"
import { Gift, Layers, Pencil, Sparkles, Tag } from "lucide-react"
import type {
  Product,
  ProductGiftRule,
  ProductUnitType,
  QuantityScope,
} from "@workspace/api-client"
import { unitSellingAndListPrice } from "@workspace/api-client"
import { Badge } from "../badge"
import { Button } from "../button"
import {
  FieldSectionBadge,
  FieldSectionField,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
  FieldSectionValue,
} from "../field"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "../admin/pages/admin-detail-layout"
import {
  formatGiftScopeLabel,
  ProductUnitPromoDivider,
} from "../admin/forms"
import { ProductDetailGallery } from "./product-detail-gallery"
import { ProductDetailInfoHeader } from "./product-detail-info-header"
import { ProductDetailLayout } from "./product-detail-layout"
import { ProductDetailMetaGrid } from "./product-detail-meta-grid"
import { ProductDetailPricePanel } from "./product-detail-price-panel"
import { ProductDetailUnitPicker } from "./product-detail-unit-picker"
import { formatProductVnd } from "./product-money"
import { resolveMediaUrl } from "../../lib/resolve-media-url"
import { cn } from "../../lib/utils"

function giftScopeFromRule(rule: ProductGiftRule): QuantityScope {
  return rule.trigger.scope ?? (rule.applyPer === "order" ? "product" : "line")
}

function resolveProductUnits(product: Product): ProductUnitType[] {
  if (product.unitTypes && product.unitTypes.length > 0) {
    return product.unitTypes
  }
  return [
    {
      type: product.unit,
      label: product.unit,
      sku: product.sku,
      wholesalePrice: product.wholesalePrice > 0 ? product.wholesalePrice : null,
      retailPrice: product.retailPrice,
      minWholesaleQty: 1,
      qtyPerUnit: 1,
      stock: product.stock,
      images: product.images ?? undefined,
      isDefault: true,
    },
  ]
}

function unitImages(unit: ProductUnitType, product: Product) {
  const own = (unit.images ?? []).filter((url) => url.trim().length > 0)
  if (own.length > 0) return own
  return (product.images ?? []).filter((url) => url.trim().length > 0)
}

function unitStock(unit: ProductUnitType, product: Product) {
  return unit.stock ?? product.stock
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
  const units = useMemo(() => resolveProductUnits(product), [product])
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

  const unitOptions = units.map((unit) => {
    const { current, list } = unitSellingAndListPrice(unit, previewQty)
    return {
      type: unit.type,
      label: unit.label,
      currentPriceLabel: formatProductVnd(current),
      listPriceLabel: list != null ? formatProductVnd(list) : null,
      hasPromo: unit.wholesalePrice !== null && unit.wholesalePrice > 0,
    }
  })

  return (
    <AdminDetailLayout className={className}>
      <AdminDetailMain>
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
            extraBadges={
              <Badge
                variant={product.isActive ? "success" : "muted"}
                size="sm"
              >
                {product.isActive ? "Đang bán" : "Ẩn"}
              </Badge>
            }
          />

          {units.length <= 1 ? (
            <ProductDetailUnitPicker
              options={unitOptions}
              selectedType={selectedUnit.type}
              onSelect={setSelectedType}
              compact
            />
          ) : null}

          <ProductDetailPricePanel
            unitPrice={unitPrice}
            listPrice={listPrice}
            unitLabel={selectedUnit.label}
            hasWholesale={
              selectedUnit.wholesalePrice !== null &&
              selectedUnit.wholesalePrice > 0
            }
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
            {gifts.length > 0 ? (
              <div className="space-y-2 border-t border-outline-variant/30 pt-3">
                <ProductUnitPromoDivider />
                {gifts.map((rule) => (
                  <AdminGiftRuleCard
                    key={rule.id}
                    rule={rule}
                    unitLabel={selectedUnit.label}
                  />
                ))}
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
      </AdminDetailMain>

      {units.length > 1 ? (
        <AdminDetailSidebar className="lg:sticky lg:top-6 lg:self-start">
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
  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        icon={Layers}
        title="Tổng hợp loại hàng"
        description="Bấm từng loại để xem giá, ảnh và quà tặng."
        badge={<FieldSectionBadge>{units.length}</FieldSectionBadge>}
      />
      <FieldSetContent variant="section" className="space-y-3 pt-0">
        {units.map((unit) => {
          const active = unit.type === selectedType
          const giftCount = unit.giftRules?.length ?? 0
          return (
            <button
              key={unit.type}
              type="button"
              onClick={() => onSelect(unit.type)}
              className="w-full text-left"
            >
              <FieldSectionValue
                className={cn(
                  "space-y-3 transition-colors",
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                    : "hover:border-primary/30 hover:bg-muted/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">
                    {unit.label}
                  </p>
                  <Badge
                    variant={active ? "promo" : "muted"}
                    size="xs"
                    className="shrink-0"
                  >
                    {active ? "Đang xem" : "Chọn"}
                  </Badge>
                </div>

                <FieldSectionField label="SKU">
                  <span className="font-mono text-xs">
                    {unit.sku || unit.type}
                  </span>
                </FieldSectionField>

                <FieldSectionField label="Giá lẻ">
                  {formatProductVnd(unit.retailPrice)}
                </FieldSectionField>

                {unit.wholesalePrice && unit.wholesalePrice > 0 ? (
                  <FieldSectionField label="Giá sỉ">
                    {formatProductVnd(unit.wholesalePrice)}
                    {unit.minWholesaleQty > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · từ {unit.minWholesaleQty} sp
                      </span>
                    ) : null}
                  </FieldSectionField>
                ) : null}

                <FieldSectionField label="Tồn kho">
                  {unitStock(unit, product)} {unit.type}
                </FieldSectionField>

                {giftCount > 0 ? (
                  <FieldSectionField label="Quà tặng">
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Tag className="size-3" aria-hidden />
                      {giftCount} quà
                    </span>
                  </FieldSectionField>
                ) : null}
              </FieldSectionValue>
            </button>
          )
        })}
      </FieldSetContent>
    </FieldSet>
  )
}

function AdminGiftRuleCard({
  rule,
  unitLabel,
}: {
  rule: ProductGiftRule
  unitLabel: string
}) {
  const scope = giftScopeFromRule(rule)
  const image = rule.gift.image

  return (
    <div className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {image ? (
          <img
            src={resolveMediaUrl(image, 112)}
            alt={rule.gift.name}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <Gift className="size-5" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-sm">
        <p className="font-semibold">{rule.gift.name}</p>
        {rule.label && rule.label !== rule.gift.name ? (
          <p className="text-xs text-muted-foreground">{rule.label}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Từ {rule.trigger.minQty ?? "—"} sp · Tặng {rule.gift.qty}
          {rule.gift.sku ? ` · ${rule.gift.sku}` : ""}
        </p>
        <p className="text-xs text-primary">
          {formatGiftScopeLabel(scope, unitLabel)}
        </p>
      </div>
    </div>
  )
}
