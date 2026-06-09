"use client"

import type { ReactNode } from "react"
import { ArrowDown, Calculator, Package, Scale } from "lucide-react"
import { cn } from "../../../lib/utils"
import { formatUnitVnd } from "./product-unit-promo-section"

export type ProductUnitStockBlockProps = {
  qtyPerUnitInput: ReactNode
  unitLabel?: string
  qtyPerUnit?: string
  /** Tổng pool sp gốc (nhập một lần trên form). */
  poolBaseStock?: number
  /** SL tối đa khách mua loại này — tự tính từ pool ÷ quy đổi. */
  maxSellableFromPool?: number
  className?: string
}

export function ProductUnitStockBlock({
  qtyPerUnitInput,
  unitLabel,
  qtyPerUnit,
  poolBaseStock,
  maxSellableFromPool,
  className,
}: ProductUnitStockBlockProps) {
  const qtyNum = Number(qtyPerUnit)
  const label = unitLabel?.trim() || "…"
  const hasConversion =
    unitLabel?.trim() &&
    Number.isFinite(qtyNum) &&
    qtyNum > 0
  const poolBase =
    poolBaseStock !== undefined && Number.isFinite(poolBaseStock)
      ? Math.max(0, Math.floor(poolBaseStock))
      : null
  const maxSell =
    maxSellableFromPool !== undefined && Number.isFinite(maxSellableFromPool)
      ? Math.max(0, Math.floor(maxSellableFromPool))
      : null

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/10 p-3 sm:p-4",
        className
      )}
    >
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
          <Package className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm leading-snug font-semibold">
            Quy đổi & tồn tự động
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Chỉ nhập hệ số quy đổi — tồn có thể bán của loại này được hệ thống
            tính từ pool sp gốc (sidebar).
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tồn có thể bán</p>
          <div
            className="flex h-8 items-center rounded-lg border border-dashed border-border/80 bg-background/60 px-2.5 text-sm tabular-nums"
            aria-live="polite"
          >
            {maxSell !== null && poolBase !== null && poolBase > 0 ? (
              <span className="font-semibold text-foreground">{maxSell}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Tự tính: pool ÷ quy đổi — không cần nhập tay.
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Quy đổi ra đơn vị gốc</p>
          {qtyPerUnitInput}
          <p className="text-xs text-muted-foreground">
            1 {label} = bao nhiêu sp gốc. VD: 1 thùng = 30 gói → nhập{" "}
            <span className="font-medium text-foreground">30</span>.
          </p>
        </div>
      </div>

      {hasConversion ? (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <Scale className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="font-medium text-foreground">1 {label}</span>
              {" = "}
              <span className="font-medium text-foreground tabular-nums">
                {qtyNum}
              </span>
              {" sp gốc"}
              {poolBase !== null && poolBase > 0 && maxSell !== null ? (
                <>
                  {" · "}
                  <span className="font-medium text-foreground tabular-nums">
                    {maxSell}
                  </span>{" "}
                  {label} có thể bán
                </>
              ) : null}
            </span>
          </div>
          {maxSell !== null && poolBase !== null && poolBase > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <Calculator className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">
                  {poolBase.toLocaleString("vi-VN")}
                </span>{" "}
                sp gốc ÷{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {qtyNum}
                </span>{" "}
                ={" "}
                <span className="font-medium text-foreground tabular-nums">
                  {maxSell}
                </span>{" "}
                {label}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export type ProductUnitQtyRuleFlowProps = {
  condition: ReactNode
  result: ReactNode
  className?: string
}

export function ProductUnitQtyRuleFlow({
  condition,
  result,
  className,
}: ProductUnitQtyRuleFlowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm",
        className
      )}
    >
      <div className="space-y-0 p-3 sm:p-4">
        <div className="rounded-md bg-muted/30 px-3 py-2.5">{condition}</div>
        <div className="flex justify-center py-1.5" aria-hidden>
          <ArrowDown className="size-4 text-primary/50" />
        </div>
        <div className="rounded-md bg-primary/[0.06] px-3 py-2.5">{result}</div>
      </div>
    </div>
  )
}

export type ProductUnitQtyInlineProps = {
  prefix?: string
  suffix?: string
  input: ReactNode
  className?: string
}

export function ProductUnitQtyInline({
  prefix,
  suffix,
  input,
  className,
}: ProductUnitQtyInlineProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1.5", className)}
    >
      {prefix ? (
        <span className="text-sm text-muted-foreground">{prefix}</span>
      ) : null}
      <div className="w-[5.5rem] shrink-0">{input}</div>
      {suffix ? (
        <span className="text-sm text-muted-foreground">{suffix}</span>
      ) : null}
    </div>
  )
}

export function ProductUnitFormSubsection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function buildWholesaleRuleText(
  minWholesaleQty: string,
  wholesalePrice: string
): string | null {
  const minQty = Number(minWholesaleQty)
  const price = formatUnitVnd(wholesalePrice)
  if (!Number.isFinite(minQty) || minQty <= 0 || !price) return null
  return `Mua từ ${minQty} sp → ${price}/sp`
}

export function buildTierRuleText(
  tierMinQty: string,
  tierUnitPrice: string,
  tierLabel: string
): string | null {
  const minQty = Number(tierMinQty)
  const price = formatUnitVnd(tierUnitPrice)
  const label = tierLabel.trim()
  if (!price) return null
  const cond =
    label ||
    (Number.isFinite(minQty) && minQty > 0 ? `Mua từ ${minQty} sp` : "")
  if (!cond) return null
  return `${cond} → ${price}/sp`
}

export function ProductUnitQuantityGuide({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/80 bg-muted/10 px-3 py-2.5 text-xs text-muted-foreground",
        className
      )}
    >
      <p className="mb-1.5 font-medium text-foreground">
        Phân biệt các loại số lượng
      </p>
      <ul className="grid gap-1 sm:grid-cols-2">
        <li>
          <span className="font-medium text-foreground">Tồn sp gốc</span> —
          nhập một lần; pool dùng chung mọi loại hàng.
        </li>
        <li>
          <span className="font-medium text-foreground">Tối đa bán</span> —
          tự tính: floor(pool ÷ quy đổi).
        </li>
        <li>
          <span className="font-medium text-foreground">Quy đổi</span> — 1 loại
          = bao nhiêu sp gốc (lon, chai…).
        </li>
        <li>
          <span className="font-medium text-foreground">SL KM / sỉ</span> —
          ngưỡng mua tối thiểu để được giá ưu đãi cố định.
        </li>
        <li>
          <span className="font-medium text-foreground">Bậc giá</span> — ngưỡng
          SL để giảm đơn giá (có nhãn hiển thị).
        </li>
        <li className="sm:col-span-2">
          <span className="font-medium text-foreground">SL quà tặng</span> —
          ngưỡng mua để nhận quà; có thể đếm riêng từng loại hoặc cộng mọi loại
          cùng SP.
        </li>
      </ul>
    </div>
  )
}
