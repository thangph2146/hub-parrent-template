import type { PromoDiscountKind } from "@workspace/api-client"

/** Giá trị form admin mã KM — string cho input số, boolean cho trạng thái. */
export type PromoAdminFormFields = {
  code: string
  label: string
  discountKind: PromoDiscountKind
  discountFixed: string
  discountPercent: string
  discountCapVnd: string
  minOrderSubtotal: string
  usageLimit: string
  isActive: boolean
}
