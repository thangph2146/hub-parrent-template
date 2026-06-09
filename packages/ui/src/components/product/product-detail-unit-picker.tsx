"use client"

import { Tag } from "lucide-react"
import { Badge } from "../badge"
import { ProductDetailSectionLabel } from "./product-detail-section-label"
import { Tabs, TabsList, TabsTrigger } from "../tabs"
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
  showPrice?: boolean
  compact?: boolean
  showLabel?: boolean
}

export function ProductDetailUnitPicker({
  options,
  selectedType,
  onSelect,
  className,
  label = "Loại đơn vị",
  showPrice = true,
  compact = false,
  showLabel = true,
}: ProductDetailUnitPickerProps) {
  if (options.length <= 1) return null

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-2.5", className)}>
      {showLabel ? (
        <ProductDetailSectionLabel variant={compact ? "soft" : "default"}>
          {label}
        </ProductDetailSectionLabel>
      ) : null}

      <Tabs
        value={selectedType}
        onValueChange={onSelect}
        className="w-full gap-0"
      >
        <TabsList
          className={cn(
            compact
              ? "h-auto w-full rounded-xl p-1"
              : "h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0"
          )}
          aria-label={typeof label === "string" ? label : "Loại đơn vị"}
        >
          {options.map((option) => {
            const isPromo = option.hasPromo ?? false

            if (compact) {
              return (
                <TabsTrigger
                  key={option.type}
                  value={option.type}
                  className="min-w-0 flex-1 gap-1.5 px-3 py-2 text-xs font-semibold"
                >
                  <span className="truncate">{option.label}</span>
                  {isPromo ? (
                    <Badge variant="promo" size="xs" shape="pill">
                      <Tag aria-hidden /> KM
                    </Badge>
                  ) : null}
                </TabsTrigger>
              )
            }

            return (
              <TabsTrigger
                key={option.type}
                value={option.type}
                className={cn(
                  "h-auto min-w-[7.5rem] flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-sm font-bold",
                  selectedType === option.type
                    ? isPromo
                      ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
                      : "border-secondary bg-secondary text-secondary-foreground shadow-sm ring-1 ring-secondary/20"
                    : "border-outline-variant/50 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <span className="leading-tight">{option.label}</span>
                {showPrice ? (
                  <span
                    className={cn(
                      "flex flex-wrap items-baseline gap-1 text-xs font-semibold",
                      selectedType === option.type ? "opacity-95" : "text-primary"
                    )}
                  >
                    {option.listPriceLabel ? (
                      <span className="line-through opacity-60">
                        {option.listPriceLabel}
                      </span>
                    ) : null}
                    <span>{option.currentPriceLabel}</span>
                  {isPromo ? (
                    <Badge variant="promo" size="xs" shape="pill">
                      <Tag aria-hidden /> KM
                    </Badge>
                  ) : null}
                  </span>
                ) : null}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}
