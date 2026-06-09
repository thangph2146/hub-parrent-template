"use client"

import type { ReactNode } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "../button"
import { ProductDetailSectionLabel } from "./product-detail-section-label"
import { cn } from "../../lib/utils"

export type ProductDetailQtyStepperProps = {
  qty: number
  unitType: string
  onDecrease: () => void
  onIncrease: () => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  summary?: ReactNode
  className?: string
  label?: string
}

export function ProductDetailQtyStepper({
  qty,
  unitType,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
  summary,
  className,
  label = "Số lượng đặt:",
}: ProductDetailQtyStepperProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <ProductDetailSectionLabel>{label}</ProductDetailSectionLabel>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center overflow-hidden rounded-xl border border-outline-variant bg-background shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12 rounded-none border-r border-outline-variant"
            onClick={onDecrease}
            disabled={decreaseDisabled}
          >
            <Minus className="size-4" aria-hidden />
          </Button>
          <div className="min-w-16 px-2 text-center">
            <p className="text-xl font-black tabular-nums text-foreground">
              {qty}
            </p>
            <p className="text-[10px] leading-none text-muted-foreground">
              {unitType}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12 rounded-none border-l border-outline-variant"
            onClick={onIncrease}
            disabled={increaseDisabled}
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>
        {summary ? (
          <div className="space-y-0.5 text-sm text-muted-foreground">
            {summary}
          </div>
        ) : null}
      </div>
    </div>
  )
}
