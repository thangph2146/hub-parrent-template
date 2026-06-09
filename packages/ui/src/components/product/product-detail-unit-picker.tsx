"use client"

import { Tag } from "lucide-react"
import { Button } from "../button"
import { ProductDetailSectionLabel } from "./product-detail-section-label"
import { cn } from "../../lib/utils"

export type ProductDetailUnitOption = {
  type: string
  label: string
  currentPriceLabel: string
  listPriceLabel?: string | null
  hasPromo?: boolean
}

export type ProductDetailUnitPickerProps = {
  options: readonly ProductDetailUnitOption[]
  selectedType: string
  onSelect: (type: string) => void
  className?: string
  label?: string
}

export function ProductDetailUnitPicker({
  options,
  selectedType,
  onSelect,
  className,
  label = "Chọn loại đơn vị:",
}: ProductDetailUnitPickerProps) {
  if (options.length <= 1) return null

  return (
    <div className={cn("space-y-2.5", className)}>
      <ProductDetailSectionLabel>{label}</ProductDetailSectionLabel>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const active = selectedType === option.type
          const isPromo = option.hasPromo ?? false
          return (
            <Button
              key={option.type}
              type="button"
              onClick={() => onSelect(option.type)}
              className={cn(
                "h-auto min-w-[8.5rem] flex-col items-start gap-1 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all",
                active
                  ? isPromo
                    ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/15"
                    : "border-secondary bg-secondary text-secondary-foreground shadow-md ring-2 ring-secondary/15"
                  : "border-outline-variant/60 bg-background text-muted-foreground hover:border-primary/35 hover:bg-muted/60"
              )}
            >
              <span className="leading-tight">{option.label}</span>
              <span
                className={cn(
                  "flex flex-wrap items-baseline gap-1 text-xs font-semibold",
                  active ? "opacity-95" : "text-primary"
                )}
              >
                {option.listPriceLabel ? (
                  <span className="line-through opacity-65">
                    {option.listPriceLabel}
                  </span>
                ) : null}
                <span>{option.currentPriceLabel}</span>
                {isPromo ? (
                  <span className="ml-0.5 inline-flex items-center gap-0.5 opacity-80">
                    <Tag className="size-3" aria-hidden /> KM
                  </span>
                ) : null}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
