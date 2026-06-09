"use client"

import type { ReactNode } from "react"
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

export type ProductDetailUnitPickerLayout = "tabs" | "chips"

/** Lưới tab compact: 3 đơn vị → 1 hàng 3 cột; còn lại 2 cột. */
function compactTabsGridClass(optionCount: number): string {
  if (optionCount <= 1) return "grid-cols-1"
  if (optionCount === 3) return "grid-cols-3"
  return "grid-cols-2"
}

function UnitPromoBadge({
  visible,
  size = "xs",
  inverted = false,
}: {
  visible: boolean
  size?: "xs" | "sm"
  inverted?: boolean
}) {
  if (!visible) return null
  return (
    <Badge
      variant={inverted ? "overlay" : "promo"}
      size={size}
      shape="pill"
      className="shrink-0"
    >
      {size === "sm" ? (
        <>
          <Tag aria-hidden /> KM
        </>
      ) : (
        "KM"
      )}
    </Badge>
  )
}

type UnitChipPickerProps = {
  options: readonly ProductDetailUnitOption[]
  selectedType: string
  onSelect: (type: string) => void
  label: string | ReactNode
  showLabel: boolean
  className?: string
}

function ProductDetailUnitChipPicker({
  options,
  selectedType,
  onSelect,
  label,
  showLabel,
  className,
}: UnitChipPickerProps) {
  const ariaLabel = typeof label === "string" ? label : "Loại đơn vị"

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <ProductDetailSectionLabel variant="soft">{label}</ProductDetailSectionLabel>
      ) : null}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1.5"
      >
        {options.map((option) => {
          const selected = selectedType === option.type
          const isPromo = option.hasPromo ?? false

          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.type)}
              className={cn(
                "inline-flex min-h-8 max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-snug transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
                  : "border-outline-variant/40 bg-background/90 text-foreground/80 hover:border-primary/30 hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <span className="line-clamp-2 text-left">{option.label}</span>
              <UnitPromoBadge visible={isPromo} inverted={selected} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export type ProductDetailUnitPickerProps = {
  options: readonly ProductDetailUnitOption[]
  selectedType: string
  onSelect: (type: string) => void
  className?: string
  label?: string
  showPrice?: boolean
  /** @deprecated Dùng `layout="chips"`. */
  compact?: boolean
  /** @deprecated Dùng `layout="chips"`. */
  dense?: boolean
  showLabel?: boolean
  /** `chips` — pill (catalog, CTSP); `tabs` — thẻ có giá (admin preview). */
  layout?: ProductDetailUnitPickerLayout
}

function resolveLayout(
  layout: ProductDetailUnitPickerLayout | undefined,
  compact: boolean,
  dense: boolean,
): ProductDetailUnitPickerLayout {
  if (layout) return layout
  if (compact || dense) return "chips"
  return "tabs"
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
  layout: layoutProp,
}: ProductDetailUnitPickerProps) {
  if (options.length <= 1) return null

  const layout = resolveLayout(layoutProp, compact, dense)

  if (layout === "chips") {
    return (
      <ProductDetailUnitChipPicker
        options={options}
        selectedType={selectedType}
        onSelect={onSelect}
        label={label}
        showLabel={showLabel}
        className={className}
      />
    )
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {showLabel ? (
        <ProductDetailSectionLabel variant="default">{label}</ProductDetailSectionLabel>
      ) : null}

      <Tabs
        value={selectedType}
        onValueChange={onSelect}
        className="w-full gap-0"
      >
        <TabsList
          className="group-data-horizontal/tabs:h-auto h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0"
          aria-label={typeof label === "string" ? label : "Loại đơn vị"}
        >
          {options.map((option) => {
            const isPromo = option.hasPromo ?? false

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
                    : "border-outline-variant/50 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-muted/50",
                )}
              >
                <span className="leading-tight">{option.label}</span>
                {showPrice ? (
                  <span
                    className={cn(
                      "flex flex-wrap items-baseline gap-1 text-xs font-semibold",
                      selectedType === option.type ? "opacity-95" : "text-primary",
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

/** Tab dạng lưới — admin preview khi cần giá trên từng ô (không dùng cho catalog). */
export function ProductDetailUnitPickerCompactTabs({
  options,
  selectedType,
  onSelect,
  className,
  label = "Loại đơn vị",
  showLabel = true,
}: Pick<
  ProductDetailUnitPickerProps,
  "options" | "selectedType" | "onSelect" | "className" | "label" | "showLabel"
>) {
  if (options.length <= 1) return null

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <ProductDetailSectionLabel variant="soft">{label}</ProductDetailSectionLabel>
      ) : null}
      <Tabs
        value={selectedType}
        onValueChange={onSelect}
        className="w-full gap-0"
      >
        <TabsList
          className={cn(
            "grid h-auto min-h-12 w-full gap-1 rounded-lg p-1.5 group-data-horizontal/tabs:h-auto",
            compactTabsGridClass(options.length),
          )}
          aria-label={typeof label === "string" ? label : "Loại đơn vị"}
        >
          {options.map((option) => {
            const isPromo = option.hasPromo ?? false
            return (
              <TabsTrigger
                key={option.type}
                value={option.type}
                className="flex h-auto min-h-11 w-full min-w-0 flex-none flex-col items-center justify-center gap-1 whitespace-normal rounded-lg px-2 py-1.5 text-sm font-semibold leading-snug"
              >
                <span className="line-clamp-2 w-full text-center">
                  {option.label}
                </span>
                <UnitPromoBadge visible={isPromo} size="sm" />
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}
