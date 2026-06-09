"use client"

import type { PromoCode } from "@workspace/api-client"
import {
  CalendarClock,
  Hash,
  Percent,
  ShoppingBag,
  Tag,
  Ticket,
  Users,
} from "lucide-react"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "../admin/pages/admin-detail-layout"
import { Badge } from "../badge"
import {
  FieldSectionField,
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "../field"
import { formatAdminDateTime } from "../../lib/format-admin-datetime"
import { cn } from "../../lib/utils"
import { formatProductVnd } from "./product-money"
import { PromoAdminHeroCard } from "./promo-admin-hero-card"
import {
  formatPromoDiscountValue,
  formatPromoUsageCount,
  formatPromoUsageLimit,
  PROMO_DISCOUNT_KIND_LABELS,
  promoUsagePercent,
} from "./promo-admin-format"

export type PromoAdminDetailProps = {
  promo: PromoCode
  className?: string
}

function UsageProgress({
  usageCount,
  usageLimit,
}: {
  usageCount: number
  usageLimit: number | null | undefined
}) {
  const percent = promoUsagePercent(usageCount, usageLimit)
  if (percent == null) {
    return (
      <span className="font-semibold tabular-nums">
        {usageCount.toLocaleString("vi-VN")} lượt
      </span>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold tabular-nums text-foreground">
          {formatPromoUsageCount(usageCount, usageLimit)}
        </span>
        <span className="text-xs text-muted-foreground">{percent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến độ sử dụng mã"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 90 ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function PromoAdminDetail({ promo, className }: PromoAdminDetailProps) {
  const hasValidity = promo.validFrom != null || promo.validUntil != null

  return (
    <AdminDetailLayout className={className}>
      <AdminDetailMain className="space-y-6">
        <FieldSet variant="section">
          <FieldSectionLegend
            icon={Ticket}
            title="Thông tin giảm giá"
            description="Cấu hình áp dụng tại checkout storefront."
          />
          <FieldSetContent
            variant="section"
            className="grid gap-4 sm:grid-cols-2"
          >
            <FieldSectionField
              label="Mã coupon"
              icon={Hash}
              copyable
              copyText={promo.code}
            >
              <Badge variant="coupon" className="font-mono" data-copy-text={promo.code}>
                {promo.code}
              </Badge>
            </FieldSectionField>
            <FieldSectionField label="Nhãn hiển thị" icon={Tag} copyable>
              {promo.label}
            </FieldSectionField>
            <FieldSectionField label="Kiểu giảm" icon={Percent} copyable={false}>
              <Badge variant={promo.discountKind === "percent" ? "promo" : "outline"}>
                {PROMO_DISCOUNT_KIND_LABELS[promo.discountKind]}
              </Badge>
            </FieldSectionField>
            <FieldSectionField label="Giá trị giảm" copyable={false}>
              <span className="text-base font-bold tabular-nums text-primary">
                {formatPromoDiscountValue(promo)}
              </span>
            </FieldSectionField>
            <FieldSectionField label="Đơn tối thiểu" icon={ShoppingBag} copyable={false}>
              <span className="font-semibold tabular-nums">
                {formatProductVnd(promo.minOrderSubtotal)}
              </span>
            </FieldSectionField>
            <FieldSectionField label="Giới hạn lượt dùng" icon={Users} copyable={false}>
              {formatPromoUsageLimit(promo.usageLimit)}
            </FieldSectionField>
          </FieldSetContent>
        </FieldSet>
      </AdminDetailMain>

      <AdminDetailSidebar className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <PromoAdminHeroCard promo={promo} />

        <FieldSet variant="section">
          <FieldSectionLegend title="Sử dụng" />
          <FieldSetContent variant="section" className="space-y-3 pt-0">
            <FieldSectionField label="Lượt đã dùng" copyable={false}>
              <UsageProgress
                usageCount={promo.usageCount}
                usageLimit={promo.usageLimit}
              />
            </FieldSectionField>
          </FieldSetContent>
        </FieldSet>

        <FieldSet variant="section">
          <FieldSectionLegend icon={CalendarClock} title="Thời gian" />
          <FieldSetContent variant="section" className="space-y-3 pt-0">
            {promo.validFrom ? (
              <FieldSectionField label="Hiệu lực từ" copyable={false}>
                {formatAdminDateTime(promo.validFrom)}
              </FieldSectionField>
            ) : null}
            {promo.validUntil ? (
              <FieldSectionField label="Hết hạn" copyable={false}>
                {formatAdminDateTime(promo.validUntil)}
              </FieldSectionField>
            ) : null}
            {!hasValidity ? (
              <p className="text-sm text-muted-foreground">
                Không giới hạn thời gian — mã áp dụng cho đến khi tắt thủ công.
              </p>
            ) : null}
            <FieldSectionField label="Tạo lúc" copyable={false}>
              {formatAdminDateTime(promo.createdAt)}
            </FieldSectionField>
            <FieldSectionField label="Cập nhật" copyable={false}>
              {formatAdminDateTime(promo.updatedAt)}
            </FieldSectionField>
          </FieldSetContent>
        </FieldSet>
      </AdminDetailSidebar>
    </AdminDetailLayout>
  )
}
