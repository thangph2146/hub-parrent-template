"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Minus, Plus } from "lucide-react"
import { Badge } from "../badge"
import { Button } from "../button"
import { ProductDetailSectionLabel } from "./product-detail-section-label"
import { cn } from "../../lib/utils"

export type ProductDetailQtyStockStatus = "ok" | "low" | "out"

export type ProductDetailQtyStepperProps = {
  qty: number
  unitType: string
  onDecrease?: () => void
  onIncrease?: () => void
  /** Nhập trực tiếp hoặc dùng cho nút ± khi không truyền onDecrease/onIncrease. */
  onQtyChange?: (qty: number) => void
  minQty?: number
  maxQty?: number
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  summary?: ReactNode
  className?: string
  label?: string
  compact?: boolean
  showLabel?: boolean
  equivalentTotal?: number
  equivalentUnit?: string
  stockCount?: number
  stockStatus?: ProductDetailQtyStockStatus
  /** `stacked` | `embedded` — bố cục cạnh khối giá. */
  layout?: "row" | "stacked" | "embedded"
  /** Đơn vị cùng dòng với số (thanh stepper ngang). */
  unitInline?: boolean
}

const stockBadgeVariant: Record<
  ProductDetailQtyStockStatus,
  "success" | "warning" | "destructive"
> = {
  ok: "success",
  low: "warning",
  out: "destructive",
}

function StockQtyBadge({
  count,
  status,
}: {
  count: number
  status: ProductDetailQtyStockStatus
}) {
  return (
    <Badge
      variant={stockBadgeVariant[status]}
      size="xs"
      shape="pill"
      className="tabular-nums"
    >
      Tồn{" "}
      <span className="font-bold">{count.toLocaleString("vi-VN")}</span>
    </Badge>
  )
}

const stepperBtnClass =
  "size-8 shrink-0 rounded-full border-0 bg-background shadow-sm ring-1 ring-outline-variant/30 transition-all hover:bg-primary hover:text-primary-foreground hover:ring-primary/30 disabled:bg-muted/40 disabled:text-muted-foreground disabled:shadow-none disabled:ring-transparent disabled:hover:bg-muted/40 disabled:hover:text-muted-foreground"

function clampQty(value: number, minQty: number, maxQty?: number) {
  const upper = maxQty != null ? Math.min(value, maxQty) : value
  return Math.max(minQty, upper)
}

function parseQtyInput(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return null
  const parsed = Number.parseInt(digits, 10)
  return Number.isFinite(parsed) ? parsed : null
}

type QtyStepperControlProps = {
  qty: number
  unitType: string
  onDecrease: () => void
  onIncrease: () => void
  onQtyChange?: (qty: number) => void
  minQty: number
  maxQty?: number
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  size?: "sm" | "md"
  unitInline?: boolean
}

function QtyStepperControl({
  qty,
  unitType,
  onDecrease,
  onIncrease,
  onQtyChange,
  minQty,
  maxQty,
  decreaseDisabled,
  increaseDisabled,
  size = "sm",
  unitInline = false,
}: QtyStepperControlProps) {
  const btnClass = unitInline
    ? "h-full w-10 shrink-0 rounded-lg hover:bg-primary hover:text-primary-foreground disabled:hover:bg-transparent"
    : size === "sm"
      ? stepperBtnClass
      : cn(stepperBtnClass, "size-10")
  const qtyClass = unitInline ? "text-lg" : size === "sm" ? "text-xl" : "text-2xl"
  const widthClass = unitInline
    ? "min-w-[5rem] flex-1"
    : size === "sm"
      ? "w-[4.5rem]"
      : "w-[5.5rem]"
  const editable = onQtyChange != null

  const [draft, setDraft] = useState(String(qty))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setDraft(String(qty))
  }, [qty, focused])

  const commitDraft = () => {
    if (!editable) return
    const parsed = parseQtyInput(draft)
    if (parsed == null) {
      setDraft(String(qty))
      setFocused(false)
      return
    }
    const next = clampQty(parsed, minQty, maxQty)
    onQtyChange(next)
    setDraft(String(next))
    setFocused(false)
  }

  const qtyField = editable ? (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={focused ? draft : String(qty)}
      onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
      onFocus={() => {
        setFocused(true)
        setDraft(String(qty))
      }}
      onBlur={commitDraft}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur()
        }
      }}
      className={cn(
        "border-0 bg-transparent p-0 font-bold leading-none tracking-tight text-foreground tabular-nums outline-none transition-colors focus:ring-0",
        unitInline ? "w-9 text-center focus:bg-primary/5" : "w-full rounded-md text-center focus:bg-primary/5",
        qtyClass
      )}
      aria-label={`Số lượng ${unitType}`}
      min={minQty}
      max={maxQty}
    />
  ) : (
    <span
      className={cn(
        "font-bold leading-none tracking-tight text-foreground tabular-nums",
        qtyClass
      )}
    >
      {qty}
    </span>
  )

  return (
    <div
      className={cn(
        "inline-flex items-stretch",
        unitInline
          ? cn(
              "w-full overflow-hidden rounded-lg border border-outline-variant/30 bg-muted/20",
              size === "sm" ? "h-10" : "h-11"
            )
          : "items-center gap-1 rounded-xl bg-background/80 p-1 ring-1 ring-outline-variant/30"
      )}
      role="group"
      aria-label="Điều chỉnh số lượng"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={btnClass}
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label="Giảm số lượng"
      >
        <Minus className="size-3.5 stroke-[2.5]" aria-hidden />
      </Button>

      <div
        className={cn(
          unitInline
            ? "flex items-center justify-center gap-1.5 border-x border-outline-variant/30 bg-background px-2"
            : "flex flex-col items-center justify-center px-1 py-0.5 text-center",
          widthClass
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {qtyField}
        {!unitInline ? (
          <span className="mt-1 max-w-full truncate text-[10px] leading-none font-medium text-muted-foreground">
            {unitType}
          </span>
        ) : (
          <span className="truncate text-xs font-medium text-muted-foreground">
            {unitType}
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={btnClass}
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label="Tăng số lượng"
      >
        <Plus className="size-3.5 stroke-[2.5]" aria-hidden />
      </Button>
    </div>
  )
}

function QtyStepperMeta({
  showEquivalent,
  equivalentTotal,
  equivalentUnit,
  stockCount,
  stockStatus,
  summary,
}: {
  showEquivalent: boolean
  equivalentTotal?: number
  equivalentUnit?: string
  stockCount?: number
  stockStatus: ProductDetailQtyStockStatus
  summary?: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      {showEquivalent ? (
        <Badge variant="muted" size="xs" shape="pill" className="tabular-nums">
          =
          <span className="font-semibold text-foreground">
            {equivalentTotal!.toLocaleString("vi-VN")}
          </span>
          {equivalentUnit}
        </Badge>
      ) : null}

      {stockCount != null ? (
        <StockQtyBadge count={stockCount} status={stockStatus} />
      ) : null}

      {summary}
    </div>
  )
}

export function ProductDetailQtyStepper({
  qty,
  unitType,
  onDecrease,
  onIncrease,
  onQtyChange,
  minQty = 1,
  maxQty,
  decreaseDisabled,
  increaseDisabled,
  summary,
  className,
  label = "Số lượng",
  compact = false,
  showLabel = true,
  equivalentTotal,
  equivalentUnit,
  stockCount,
  stockStatus = "ok",
  layout = "row",
  unitInline = false,
}: ProductDetailQtyStepperProps) {
  const showEquivalent =
    equivalentTotal != null &&
    equivalentUnit != null &&
    (equivalentTotal !== qty || equivalentUnit !== unitType)

  const hasMeta = showEquivalent || stockCount != null || summary != null

  const handleDecrease = () => {
    if (onDecrease) {
      onDecrease()
      return
    }
    if (onQtyChange) onQtyChange(clampQty(qty - 1, minQty, maxQty))
  }

  const handleIncrease = () => {
    if (onIncrease) {
      onIncrease()
      return
    }
    if (onQtyChange) onQtyChange(clampQty(qty + 1, minQty, maxQty))
  }

  const atMin = qty <= minQty
  const atMax = maxQty != null && qty >= maxQty

  const control = (
    <QtyStepperControl
      qty={qty}
      unitType={unitType}
      onDecrease={handleDecrease}
      onIncrease={handleIncrease}
      onQtyChange={onQtyChange}
      minQty={minQty}
      maxQty={maxQty}
      decreaseDisabled={decreaseDisabled ?? atMin}
      increaseDisabled={increaseDisabled ?? atMax}
      size={compact ? "sm" : "md"}
      unitInline={unitInline}
    />
  )

  if (layout === "embedded") {
    const showHeader = showLabel || stockCount != null
    return (
      <div className={cn("w-full space-y-2", className)}>
        {showHeader ? (
          <div className="flex items-center justify-between gap-2">
            {showLabel ? (
              <p className="text-xs font-medium text-muted-foreground">
                Số lượng
              </p>
            ) : (
              <span className="sr-only">Số lượng</span>
            )}
            {stockCount != null ? (
              <StockQtyBadge count={stockCount} status={stockStatus} />
            ) : null}
          </div>
        ) : null}
        {control}
      </div>
    )
  }

  if (layout === "stacked") {
    return (
      <div className={cn("min-w-0 space-y-2", className)}>
        <div className="flex items-center justify-between gap-2">
          {showLabel ? (
            <ProductDetailSectionLabel variant="soft">
              {label}
            </ProductDetailSectionLabel>
          ) : (
            <ProductDetailSectionLabel variant="soft">
              Số lượng
            </ProductDetailSectionLabel>
          )}
          {stockCount != null ? (
            <StockQtyBadge count={stockCount} status={stockStatus} />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {control}
          {showEquivalent ? (
            <span className="text-[11px] text-muted-foreground">
              =
              <span className="ml-0.5 font-semibold text-foreground tabular-nums">
                {equivalentTotal!.toLocaleString("vi-VN")}
              </span>{" "}
              {equivalentUnit}
            </span>
          ) : null}
        </div>

        {summary ? (
          <div className="text-xs text-muted-foreground">{summary}</div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn(compact ? "space-y-1.5" : "space-y-2.5", className)}>
      {showLabel ? (
        <ProductDetailSectionLabel variant={compact ? "soft" : "default"}>
          {label}
        </ProductDetailSectionLabel>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap items-center",
          compact ? "gap-2" : "gap-3"
        )}
      >
        {control}

        {hasMeta ? (
          <QtyStepperMeta
            showEquivalent={showEquivalent}
            equivalentTotal={equivalentTotal}
            equivalentUnit={equivalentUnit}
            stockCount={stockCount}
            stockStatus={stockStatus}
            summary={summary}
          />
        ) : summary ? (
          <div className="text-xs text-muted-foreground">{summary}</div>
        ) : null}
      </div>
    </div>
  )
}
