export type PromoDiscountResult = {
  discountAmount: number;
  code: string;
  label: string;
};

export type RedeemablePromo = {
  id: number;
  code: string;
  label: string;
  discountKind: 'percent' | 'fixed';
  discountFixed: number;
  discountPercent: number;
  discountCapVnd?: number | null;
  minOrderSubtotal: number;
};

export function computePromoDiscount(
  subtotal: number,
  promo: Pick<
    RedeemablePromo,
    | 'code'
    | 'label'
    | 'discountKind'
    | 'discountFixed'
    | 'discountPercent'
    | 'minOrderSubtotal'
  > & { discountCapVnd?: number | null },
): PromoDiscountResult {
  const base = Math.max(0, Math.floor(subtotal));
  const minSub = Math.max(0, Math.floor(promo.minOrderSubtotal || 0));
  if (base < minSub) {
    return { discountAmount: 0, code: promo.code, label: promo.label };
  }

  let discount = 0;
  if (promo.discountKind === 'percent') {
    const pct = Math.max(
      0,
      Math.min(100, Math.floor(promo.discountPercent || 0)),
    );
    discount = Math.floor((base * pct) / 100);
    const cap =
      promo.discountCapVnd !== undefined && promo.discountCapVnd !== null
        ? Math.max(0, Math.floor(promo.discountCapVnd))
        : null;
    if (cap !== null) discount = Math.min(discount, cap);
  } else {
    discount = Math.max(0, Math.floor(promo.discountFixed || 0));
  }

  return {
    discountAmount: Math.min(discount, base),
    code: promo.code,
    label: promo.label,
  };
}
