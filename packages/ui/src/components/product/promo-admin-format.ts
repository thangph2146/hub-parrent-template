import type { PromoCode, PromoDiscountKind } from "@workspace/api-client"
import type { PromoAdminFormFields } from "./promo-admin-form-types"
import { formatProductVnd } from "./product-money"

export const PROMO_DISCOUNT_KIND_LABELS: Record<PromoDiscountKind, string> = {
  percent: "Phần trăm",
  fixed: "Cố định",
}

export function formatPromoDiscountValue(promo: Pick<
  PromoCode,
  "discountKind" | "discountPercent" | "discountFixed" | "discountCapVnd"
>): string {
  if (promo.discountKind === "percent") {
    const cap =
      promo.discountCapVnd != null && promo.discountCapVnd > 0
        ? ` (tối đa ${formatProductVnd(promo.discountCapVnd)})`
        : ""
    return `${promo.discountPercent}%${cap}`
  }
  return formatProductVnd(promo.discountFixed)
}

export function formatPromoUsageLimit(
  usageLimit: number | null | undefined,
): string {
  if (usageLimit == null || usageLimit <= 0) return "Không giới hạn"
  return usageLimit.toLocaleString("vi-VN")
}

export function formatPromoUsageCount(
  usageCount: number,
  usageLimit: number | null | undefined,
): string {
  if (usageLimit != null && usageLimit > 0) {
    return `${usageCount.toLocaleString("vi-VN")} / ${usageLimit.toLocaleString("vi-VN")}`
  }
  return usageCount.toLocaleString("vi-VN")
}

export function promoUsagePercent(
  usageCount: number,
  usageLimit: number | null | undefined,
): number | null {
  if (usageLimit == null || usageLimit <= 0) return null
  return Math.min(100, Math.round((usageCount / usageLimit) * 100))
}

/** Xem trước hero card từ giá trị form đang nhập. */
export function previewPromoFromFormFields(
  fields: PromoAdminFormFields,
): Pick<
  PromoCode,
  | "code"
  | "label"
  | "discountKind"
  | "discountPercent"
  | "discountFixed"
  | "discountCapVnd"
  | "minOrderSubtotal"
  | "isActive"
> {
  const cap = fields.discountCapVnd.trim()
  return {
    code: fields.code.trim() || "MA-KM",
    label: fields.label.trim() || "Nhãn hiển thị",
    discountKind: fields.discountKind,
    discountFixed: Math.max(0, Math.floor(Number(fields.discountFixed) || 0)),
    discountPercent: Math.max(
      0,
      Math.min(100, Math.floor(Number(fields.discountPercent) || 0)),
    ),
    discountCapVnd: cap ? Math.max(0, Math.floor(Number(cap))) : null,
    minOrderSubtotal: Math.max(
      0,
      Math.floor(Number(fields.minOrderSubtotal) || 0),
    ),
    isActive: fields.isActive,
  }
}
