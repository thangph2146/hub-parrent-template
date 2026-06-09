"use client"

import type { PromoCode } from "@workspace/api-client"
import { Ticket } from "lucide-react"
import { Badge } from "../badge"
import { ActiveStatusBadge } from "../badge-presets"
import { cn } from "../../lib/utils"
import { formatProductVnd } from "./product-money"
import { formatPromoDiscountValue } from "./promo-admin-format"

export type PromoAdminHeroCardProps = {
  promo: Pick<
    PromoCode,
    | "code"
    | "label"
    | "discountKind"
    | "discountPercent"
    | "discountFixed"
    | "discountCapVnd"
    | "minOrderSubtotal"
    | "isActive"
  >
  className?: string
}

export function PromoAdminHeroCard({ promo, className }: PromoAdminHeroCardProps) {
  const discountText = formatPromoDiscountValue(promo)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-dashed border-primary/35 bg-gradient-to-br from-primary/8 via-background to-primary/5 p-5 shadow-sm",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 size-20 rounded-full bg-primary/5"
        aria-hidden
      />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Ticket className="size-5" aria-hidden />
          </span>
          <ActiveStatusBadge
            active={promo.isActive}
            activeLabel="Đang bật"
            inactiveLabel="Đã tắt"
          />
        </div>

        <div className="space-y-1">
          <Badge
            variant="coupon"
            size="default"
            className="font-mono text-sm tracking-wide"
            data-copy-text={promo.code}
          >
            {promo.code}
          </Badge>
          <p className="text-xs leading-snug text-muted-foreground">{promo.label}</p>
        </div>

        <div className="space-y-0.5 border-t border-dashed border-primary/20 pt-3">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Giá trị giảm
          </p>
          <p className="text-2xl font-black tracking-tight text-primary tabular-nums">
            {discountText}
          </p>
          <p className="text-xs text-muted-foreground">
            Đơn tối thiểu{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatProductVnd(promo.minOrderSubtotal)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
