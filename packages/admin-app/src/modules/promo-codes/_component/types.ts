import type { PromoCode } from "@workspace/api-client"

export type PromoRow = Omit<PromoCode, "id"> & { id: string }

export function mapPromoRow(promo: PromoCode): PromoRow {
  return { ...promo, id: String(promo.id) }
}
