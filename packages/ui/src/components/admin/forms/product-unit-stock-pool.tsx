"use client"

import { Boxes, ShoppingBag } from "lucide-react"
import { cn } from "../../../lib/utils"
import { Badge } from "../../badge"

export type FormUnitStockRow = {
  label?: string
  type?: string
  qtyPerUnit?: string
}

export function parseFormBaseStock(baseStock?: string): number {
  const n = Math.floor(Number(baseStock) || 0)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function parseFormQtyPerUnit(qtyPerUnit?: string): number {
  const n = Math.floor(Number(qtyPerUnit) || 1)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

/** Pool sp gốc từ trường nhập duy nhất trên form. */
export function computeFormUnitStockPool(baseStock?: string): number {
  return parseFormBaseStock(baseStock)
}

/** SL tối đa khách có thể mua của một loại (chia từ pool chung). */
export function maxSellableFromPool(
  unit: Pick<FormUnitStockRow, "qtyPerUnit">,
  poolBase: number,
): number {
  const per = parseFormQtyPerUnit(unit.qtyPerUnit)
  const pool = Math.max(0, Math.floor(poolBase))
  return Math.floor(pool / per)
}

export type ProductUnitStockPoolBannerProps = {
  baseStock?: string
  units: FormUnitStockRow[]
  baseUnitLabel?: string
  className?: string
}

export function ProductUnitStockPoolBanner({
  baseStock,
  units,
  baseUnitLabel = "sp gốc",
  className,
}: ProductUnitStockPoolBannerProps) {
  const poolBase = computeFormUnitStockPool(baseStock)
  const rows = units.map((u, index) => {
    const label = u.label?.trim() || u.type?.trim() || `Loại #${index + 1}`
    const per = parseFormQtyPerUnit(u.qtyPerUnit)
    const maxSell = maxSellableFromPool(u, poolBase)
    return { label, per, maxSell }
  })

  if (units.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-background to-muted/20 p-3.5 sm:p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold leading-snug">
              Phân bổ tồn tự động
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Nhập tồn sp gốc một lần ở sidebar — mỗi loại hàng chỉ cần hệ số
              quy đổi; SL tối đa bán được tính tự động.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Pool
          </p>
          <p className="text-xl font-bold tabular-nums text-primary">
            {poolBase.toLocaleString("vi-VN")}
          </p>
          <p className="text-[11px] text-muted-foreground">{baseUnitLabel}</p>
        </div>
      </div>

      {poolBase > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex min-w-[9rem] flex-1 flex-col gap-0.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-2 text-xs"
            >
              <span className="truncate font-medium text-foreground">
                {row.label}
              </span>
              <span className="tabular-nums text-muted-foreground">
                Tối đa{" "}
                <span className="font-semibold text-foreground">
                  {row.maxSell}
                </span>{" "}
                · 1 = {row.per} {baseUnitLabel}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Nhập «Tồn sp gốc» ở panel bên phải để xem SL tối đa từng loại hàng.
        </p>
      )}
    </div>
  )
}

export type ProductUnitVariantCardHeaderProps = {
  index: number
  label?: string
  isDefault?: boolean
  retailPrice?: string
  qtyPerUnit?: string
  poolBase: number
  expanded?: boolean
  className?: string
}

export type ProductUnitStockPoolSidebarProps = {
  baseStock?: string
  units: FormUnitStockRow[]
  className?: string
}

/** Tóm tắt pool tồn cho sidebar form sản phẩm (sau ô nhập tồn gốc). */
export function ProductUnitStockPoolSidebar({
  baseStock,
  units,
  className,
}: ProductUnitStockPoolSidebarProps) {
  const poolBase = computeFormUnitStockPool(baseStock)
  if (units.length === 0) return null

  const topRows = units
    .map((u, index) => ({
      label: u.label?.trim() || u.type?.trim() || `#${index + 1}`,
      maxSell: maxSellableFromPool(u, poolBase),
    }))
    .filter((r) => r.maxSell > 0)
    .slice(0, 6)

  if (poolBase <= 0) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Chưa có tồn — nhập số sp gốc phía trên.
      </p>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        SL tối đa từng loại (tự tính)
      </p>
      {topRows.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {topRows.map((row) => (
            <li key={row.label} className="flex justify-between gap-2">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {row.maxSell}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Chưa có loại hàng hợp lệ.</p>
      )}
    </div>
  )
}

export function ProductUnitVariantCardHeader({
  index,
  label,
  isDefault,
  retailPrice,
  qtyPerUnit,
  poolBase,
  expanded,
  className,
}: ProductUnitVariantCardHeaderProps) {
  const displayLabel = label?.trim() || `Loại hàng #${index + 1}`
  const price = Number(retailPrice)
  const maxSell = maxSellableFromPool({ qtyPerUnit }, poolBase)

  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-2", className)}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {displayLabel}
          {isDefault ? (
            <Badge variant="category" className="ml-2 align-middle text-[10px]">
              Mặc định
            </Badge>
          ) : null}
        </p>
        {!expanded ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            {Number.isFinite(price) && price > 0 ? (
              <span className="tabular-nums">
                {price.toLocaleString("vi-VN")} ₫
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <ShoppingBag className="size-3" aria-hidden />
              Tối đa{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {maxSell}
              </span>
            </span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
