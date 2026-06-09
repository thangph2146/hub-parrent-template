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
  /** Thẻ catalog hẹp — tab xuống dòng, không truncate. */
  dense?: boolean
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
  dense = false,
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
            dense
              ? "grid h-auto w-full grid-cols-2 items-stretch gap-1 rounded-lg p-1 group-data-horizontal/tabs:h-auto"
              : compact
                ? "group-data-horizontal/tabs:h-auto h-auto min-h-12 w-full rounded-lg p-1.5"
                : "group-data-horizontal/tabs:h-auto h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0"
          )}
          aria-label={typeof label === "string" ? label : "Loại đơn vị"}
        >
          {options.map((option, index) => {
            const isPromo = option.hasPromo ?? false
            const isLastOdd =
              dense &&
              options.length % 2 === 1 &&
              index === options.length - 1

            if (dense) {
              return (
                <TabsTrigger
                  key={option.type}
                  value={option.type}
                  className={cn(
                    "h-10 min-h-10 w-full max-w-full flex-none gap-1 whitespace-normal rounded-md px-2 py-0 text-[11px] font-semibold leading-tight",
                    isLastOdd && "col-span-2"
                  )}
                >
                  <span className="line-clamp-2 min-w-0 flex-1 text-center leading-tight">
                    {option.label}
                  </span>
                  {isPromo ? (
                    <Badge
                      variant="promo"
                      size="xs"
                      shape="pill"
                      className="shrink-0 px-1.5"
                    >
                      KM
                    </Badge>
                  ) : (
                    <span
                      className="invisible min-h-4 shrink-0 px-1.5 text-[10px]"
                      aria-hidden
                    >
                      KM
                    </span>
                  )}
                </TabsTrigger>
              )
            }

            if (compact) {
              return (
                <TabsTrigger
                  key={option.type}
                  value={option.type}
                  className="h-10 min-h-10 min-w-0 flex-1 gap-2 rounded-lg px-3 py-0 text-sm font-semibold"
                >
                  <span className="truncate">{option.label}</span>
                  {isPromo ? (
                    <Badge variant="promo" size="sm" shape="pill">
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
