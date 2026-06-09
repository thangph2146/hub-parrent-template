"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../../lib/utils"
import type { AdminFormBadgeVariant } from "./admin-form-badge"
import {
  AdminGiftQtyOverlayBadge,
  AdminOptionalSectionOffBadge,
  AdminOptionalSectionSummaryBadge,
} from "./admin-form-badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible"
import { Label } from "../../label"
import { Switch } from "../../switch"
import { resolveMediaUrl } from "../../../lib/resolve-media-url"
import { Gift } from "lucide-react"

export function formatUnitVnd(
  value: string | number | undefined | null
): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return ""
  return `${n.toLocaleString("vi-VN")} ₫`
}

export function buildWholesaleSummary(
  wholesalePrice: string,
  minWholesaleQty: string
): string | null {
  const price = formatUnitVnd(wholesalePrice)
  const minQty = Number(minWholesaleQty)
  if (!price) return null
  if (Number.isFinite(minQty) && minQty > 0) {
    return `${price} · từ ${minQty} sp`
  }
  return price
}

export function buildTierSummary(
  tierMinQty: string,
  tierUnitPrice: string,
  tierLabel: string
): string | null {
  const price = formatUnitVnd(tierUnitPrice)
  const minQty = Number(tierMinQty)
  if (!price && !tierLabel.trim()) return null
  const qtyPart =
    tierLabel.trim() ||
    (Number.isFinite(minQty) && minQty > 0 ? `Từ ${minQty} sp` : "")
  if (qtyPart && price) return `${qtyPart} → ${price}`
  return qtyPart || price || null
}

export function formatGiftScopeLabel(
  scope: "line" | "product" | undefined,
  unitLabel?: string
): string {
  if (scope === "product") {
    return "Cộng mọi loại cùng SP"
  }
  const label = unitLabel?.trim() || "này"
  return `Chỉ loại «${label}»`
}

export function buildGiftSummary(
  giftLabel: string,
  giftMinQty: string,
  giftName: string,
  giftQty: string
): string | null {
  const label = giftLabel.trim() || giftName.trim()
  const minQty = Number(giftMinQty)
  const qty = Number(giftQty)
  if (!label) return null
  const qtyPart = Number.isFinite(qty) && qty > 1 ? ` ×${qty}` : ""
  const condPart =
    Number.isFinite(minQty) && minQty > 0 ? ` · từ ${minQty} sp` : ""
  return `${label}${qtyPart}${condPart}`
}

export type ProductUnitGiftSummaryInput = {
  label: string
  minQty: string
  name: string
  qty: string
}

export function buildGiftsSummary(
  gifts: readonly ProductUnitGiftSummaryInput[]
): string | null {
  const parts = gifts
    .map((g) => buildGiftSummary(g.label, g.minQty, g.name, g.qty))
    .filter((s): s is string => Boolean(s))
  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]!
  return `${parts[0]} +${parts.length - 1} quà`
}

export type ProductUnitOptionalSectionProps = {
  title: string
  description?: string
  icon: LucideIcon
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  summary?: string | null
  /** Variant badge tóm tắt — mặc định `promo`. */
  summaryVariant?: AdminFormBadgeVariant
  children: ReactNode
  className?: string
}

export function ProductUnitOptionalSection({
  title,
  description,
  icon: Icon,
  enabled,
  onEnabledChange,
  summary,
  summaryVariant = "promo",
  children,
  className,
}: ProductUnitOptionalSectionProps) {
  const [open, setOpen] = useState(enabled)
  const prevEnabledRef = useRef(enabled)

  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      setOpen(true)
    }
    prevEnabledRef.current = enabled
  }, [enabled])

  return (
    <Collapsible
      open={enabled && open}
      onOpenChange={setOpen}
      className={cn(className)}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl border transition-colors",
          enabled
            ? "border-primary/25 bg-primary/[0.04] shadow-sm"
            : "border-border/80 bg-muted/15"
        )}
      >
        <div className="flex items-start gap-3 p-3 sm:gap-3.5 sm:p-4">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              enabled
                ? "bg-primary/12 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm leading-snug font-semibold">{title}</p>
              {enabled && summary ? (
                <AdminOptionalSectionSummaryBadge variant={summaryVariant}>
                  {summary}
                </AdminOptionalSectionSummaryBadge>
              ) : null}
              {!enabled ? <AdminOptionalSectionOffBadge /> : null}
            </div>
            {description ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Label htmlFor={`${title}-switch`} className="sr-only">
              Bật {title}
            </Label>
            <Switch
              id={`${title}-switch`}
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
            {enabled ? (
              <CollapsibleTrigger
                type="button"
                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[min(var(--radius-md),12px)] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label={open ? "Thu gọn" : "Mở rộng"}
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
            ) : null}
          </div>
        </div>

        {enabled ? (
          <CollapsibleContent>
            <div className="space-y-3 border-t border-border/60 px-3 pt-3 pb-4 sm:px-4 sm:pt-4">
              {children}
            </div>
          </CollapsibleContent>
        ) : null}
      </div>
    </Collapsible>
  )
}

export type ProductUnitGiftPreviewProps = {
  giftLabel: string
  giftName: string
  giftMinQty: string
  giftQty: string
  giftImage: string
  giftScope: "line" | "product"
  unitLabel?: string
  className?: string
}

export function ProductUnitGiftPreview({
  giftLabel,
  giftName,
  giftMinQty,
  giftQty,
  giftImage,
  giftScope,
  unitLabel,
  className,
}: ProductUnitGiftPreviewProps) {
  const label = giftLabel.trim()
  const name = giftName.trim()
  const displayName = name || label || "Quà tặng"
  const minQty = Number(giftMinQty)
  const qty = Number(giftQty)
  const imageUrl = giftImage.trim()
  const hasMinQty = Number.isFinite(minQty) && minQty > 0
  const hasQty = Number.isFinite(qty) && qty > 0
  const hasContent = Boolean(name || label || imageUrl || hasMinQty)

  const promoSubtitle = label && name && label !== name ? label : null

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">
        Xem trước khách hàng
      </p>
      {!hasContent ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Nhập nhãn KM, chọn SP từ kho hoặc điền tên quà — xem trước cập nhật
          ngay khi bạn gõ.
        </p>
      ) : null}
      <div className="flex gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {imageUrl ? (
            <img
              src={resolveMediaUrl(imageUrl, 128)}
              alt=""
              className="size-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted/50">
              <Gift className="size-6 text-muted-foreground/50" aria-hidden />
            </div>
          )}
          {hasQty ? <AdminGiftQtyOverlayBadge qty={qty} /> : null}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-snug font-semibold">{displayName}</p>
          {promoSubtitle ? (
            <p className="text-xs text-muted-foreground">{promoSubtitle}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {hasMinQty ? `Khi mua từ ${minQty} sp` : "Chưa đặt SL tối thiểu"}
            {hasQty ? ` · Tặng ${qty} phần` : null}
            {" · "}
            {formatGiftScopeLabel(giftScope, unitLabel)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ProductUnitPromoDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-1", className)}>
      <div className="h-px min-w-0 flex-1 bg-border" />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        Ưu đãi & quà tặng
      </span>
      <div className="h-px min-w-0 flex-1 bg-border" />
    </div>
  )
}
