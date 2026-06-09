"use client"

import type { PromoDiscountKind } from "@workspace/api-client"
import { Banknote, Percent } from "lucide-react"
import { cn } from "../../lib/utils"
import { PROMO_DISCOUNT_KIND_LABELS } from "./promo-admin-format"

const KIND_OPTIONS: {
  value: PromoDiscountKind
  icon: typeof Percent
  hint: string
}[] = [
  {
    value: "percent",
    icon: Percent,
    hint: "Giảm theo % trên tổng đơn",
  },
  {
    value: "fixed",
    icon: Banknote,
    hint: "Trừ cố định số tiền VND",
  },
]

export type PromoAdminDiscountKindPickerProps = {
  value: PromoDiscountKind
  onChange: (kind: PromoDiscountKind) => void
  disabled?: boolean
  className?: string
}

export function PromoAdminDiscountKindPicker({
  value,
  onChange,
  disabled,
  className,
}: PromoAdminDiscountKindPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Kiểu giảm giá"
      className={cn("grid gap-2 sm:grid-cols-2", className)}
    >
      {KIND_OPTIONS.map((option) => {
        const selected = value === option.value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-[4.5rem] flex-col items-start gap-1.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-50",
              selected
                ? "border-primary bg-primary/8 shadow-sm ring-1 ring-primary/15"
                : "border-outline-variant/35 bg-background hover:border-primary/25 hover:bg-muted/30",
            )}
          >
            <span className="flex w-full items-center gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  selected
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {PROMO_DISCOUNT_KIND_LABELS[option.value]}
              </span>
            </span>
            <span className="text-xs leading-snug text-muted-foreground">
              {option.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}
