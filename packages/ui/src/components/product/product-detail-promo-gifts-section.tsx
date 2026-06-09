"use client"

import { Gift, Percent } from "lucide-react"
import type {
  ProductGiftRule,
  ProductUnitType,
  QuantityScope,
} from "@workspace/api-client"
import {
  effectiveLineUnitPrice,
  effectiveQuantityForCondition,
  hasUnitWholesalePromo,
  matchesQuantityCondition,
} from "@workspace/api-client"
import { Badge } from "../badge"
import {
  formatGiftScopeLabel,
  ProductUnitPromoDivider,
} from "../admin/forms"
import { ProductDetailCallout } from "./product-detail-callout"
import { resolveMediaUrl } from "../../lib/resolve-media-url"
import { cn } from "../../lib/utils"

function giftScopeFromRule(rule: ProductGiftRule): QuantityScope {
  return rule.trigger.scope ?? (rule.applyPer === "order" ? "product" : "line")
}

export { hasUnitWholesalePromo } from "@workspace/api-client"

function wholesaleDiscountPercent(
  unit: Pick<ProductUnitType, "retailPrice" | "wholesalePrice">,
): number {
  const retail = Math.max(0, Math.floor(Number(unit.retailPrice) || 0))
  const raw = unit.wholesalePrice
  if (raw === null || raw === undefined || !Number.isFinite(Number(raw))) {
    return 0
  }
  const wholesale = Math.floor(Number(raw))
  if (retail <= 0 || wholesale <= 0 || wholesale >= retail) return 0
  return Math.round(((retail - wholesale) / retail) * 100)
}

export type ProductDetailPromoGiftsSectionProps = {
  unit: Pick<
    ProductUnitType,
    | "label"
    | "type"
    | "retailPrice"
    | "wholesalePrice"
    | "minWholesaleQty"
    | "qtyPerUnit"
  >
  giftRules: readonly ProductGiftRule[]
  /** SL dòng loại đang chọn (giỏ + đặt) — giá KM và rule scope `line`. */
  pricingQty: number
  /** Tổng SL sell_unit mọi loại cùng SP — rule scope `product`. */
  productSellQty: number
  /** Link catalog cho tên quà (storefront truyền vào). */
  giftHrefForRule?: (rule: ProductGiftRule) => string | undefined
  className?: string
}

export function ProductDetailPromoGiftsSection({
  unit,
  giftRules,
  pricingQty,
  productSellQty,
  giftHrefForRule,
  className,
}: ProductDetailPromoGiftsSectionProps) {
  const showPromo = hasUnitWholesalePromo(unit)
  const minPromoQty =
    unit.minWholesaleQty > 0 ? unit.minWholesaleQty : 1
  const { isSaleActive } = effectiveLineUnitPrice(unit, pricingQty)
  const discountPct = wholesaleDiscountPercent(unit)
  const validGifts = giftRules.filter(
    (rule) => rule?.id && rule.gift?.name?.trim(),
  )

  if (!showPromo && validGifts.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      <ProductUnitPromoDivider />
      {showPromo ? (
        <ProductDetailCallout
          tone={isSaleActive ? "success" : "warning"}
          icon={Percent}
          title={
            isSaleActive
              ? "Đã áp giá khuyến mãi"
              : minPromoQty > 1
                ? `Cần từ ${minPromoQty} ${unit.type} để giảm giá`
                : "Giá khuyến mãi có sẵn"
          }
        >
          {discountPct > 0 ? (
            <>
              Giảm <span className="font-bold">{discountPct}%</span> khi đủ
              số lượng.
            </>
          ) : null}
        </ProductDetailCallout>
      ) : null}
      {validGifts.map((rule) => (
        <ProductDetailGiftRuleCard
          key={rule.id}
          rule={rule}
          unit={unit}
          lineSellQty={pricingQty}
          productSellQty={productSellQty}
          giftHref={giftHrefForRule?.(rule)}
        />
      ))}
    </div>
  )
}

function ProductDetailGiftRuleCard({
  rule,
  unit,
  lineSellQty,
  productSellQty,
  giftHref,
}: {
  rule: ProductGiftRule
  unit: Pick<ProductUnitType, "label" | "qtyPerUnit">
  lineSellQty: number
  productSellQty: number
  giftHref?: string
}) {
  const scope = giftScopeFromRule(rule)
  const sellQty = scope === "product" ? productSellQty : lineSellQty
  const effectiveQty = effectiveQuantityForCondition(
    sellQty,
    unit,
    rule.trigger,
  )
  const unlocked = matchesQuantityCondition(effectiveQty, rule.trigger)
  const minQty = rule.trigger.minQty
  const image = rule.gift.image

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3.5 shadow-sm",
        unlocked
          ? "border-success/30 bg-success/5"
          : "border-outline-variant/30 bg-card"
      )}
    >
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
        {rule.gift.qty > 1 ? (
          <Badge
            variant="overlay"
            size="xs"
            className="absolute -top-1 -right-1 min-w-5 justify-center px-1 tabular-nums"
          >
            ×{rule.gift.qty}
          </Badge>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {giftHref ? (
            <a
              href={giftHref}
              className="font-semibold underline underline-offset-2 transition-colors hover:text-primary"
            >
              {rule.gift.name}
            </a>
          ) : (
            <p className="font-semibold">{rule.gift.name}</p>
          )}
          <Badge variant={unlocked ? "success" : "muted"} size="xs">
            {unlocked ? "Đủ điều kiện" : "Chưa đủ SL"}
          </Badge>
        </div>
        {rule.label && rule.label !== rule.gift.name ? (
          <p className="text-xs text-muted-foreground">{rule.label}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {minQty != null && minQty > 0
            ? `Khi mua từ ${minQty} sp`
            : "Theo điều kiện số lượng"}
          {rule.gift.qty > 0 ? ` · Tặng ${rule.gift.qty} phần` : null}
          {rule.gift.sku ? ` · ${rule.gift.sku}` : ""}
        </p>
        <p className="text-xs text-primary">
          {formatGiftScopeLabel(scope, unit.label)}
        </p>
      </div>
    </div>
  )
}
