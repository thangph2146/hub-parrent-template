/**
 * Quy tắc mã khuyến mãi — dùng chung storefront + API khi tạo đơn.
 */

function formatMoneyVi(n: number): string {
  return `${n.toLocaleString("vi-VN")}đ`;
}

export type PromoResult =
  | {
      ok: true;
      discount: number;
      normalizedCode: string;
      label: string;
    }
  | { ok: false; message: string };

export type PromoCartLine = {
  unitType: string;
  quantity: number;
};

export type ApplyPromoOptions = {
  cartLines?: PromoCartLine[] | null;
  preAppliedDiscount?: number;
};

function discountBasis(
  subtotal: number,
  preAppliedDiscount: number | undefined,
): number {
  return Math.max(0, Math.floor(subtotal - Math.max(0, preAppliedDiscount ?? 0)));
}

export type PromoDiscountKind = "fixed" | "percent";

export type PromoRulePublic = {
  code: string;
  label: string;
  discountKind: PromoDiscountKind;
  discountFixed: number;
  discountPercent: number;
  discountCapVnd: number | null;
  minOrderSubtotal: number;
};

export const BUILTIN_PROMO_RULES: readonly PromoRulePublic[] = [
  {
    code: "GIAM50K",
    label: "Giảm 50.000đ (GIAM50K)",
    discountKind: "fixed",
    discountFixed: 50_000,
    discountPercent: 0,
    discountCapVnd: null,
    minOrderSubtotal: 200_000,
  },
  {
    code: "SYNC10",
    label: "Giảm 10% (tối đa 200.000đ) — SYNC10",
    discountKind: "percent",
    discountFixed: 0,
    discountPercent: 10,
    discountCapVnd: 200_000,
    minOrderSubtotal: 0,
  },
] as const;

export const PROMO_CODE_EXAMPLES = BUILTIN_PROMO_RULES.map((r) => r.code);

export function mergePromoRulesPreferDb(
  dbRules: readonly PromoRulePublic[],
): PromoRulePublic[] {
  const m = new Map<string, PromoRulePublic>();
  for (const r of BUILTIN_PROMO_RULES) {
    m.set(r.code.trim().toUpperCase(), { ...r });
  }
  for (const r of dbRules) {
    m.set(r.code.trim().toUpperCase(), { ...r });
  }
  return [...m.values()];
}

function computeDiscountForRule(
  rule: PromoRulePublic,
  subtotal: number,
  basis: number,
): { discount: number } | { error: string } {
  const minOrder = Math.max(0, Math.floor(rule.minOrderSubtotal ?? 0));
  if (subtotal < minOrder) {
    return {
      error: `Mã ${rule.code} áp dụng cho đơn từ ${formatMoneyVi(minOrder)}.`,
    };
  }

  if (basis <= 0) {
    return { error: "Không còn phần tạm tính để áp mã." };
  }

  if (rule.discountKind === "fixed") {
    const fixed = Math.max(0, Math.floor(rule.discountFixed ?? 0));
    const discount = Math.min(fixed, basis);
    if (discount <= 0) {
      return { error: "Không còn phần tạm tính để áp mã." };
    }
    return { discount };
  }

  const pct = Math.max(0, Math.min(100, Math.floor(rule.discountPercent ?? 0)));
  if (pct <= 0) {
    return { error: "Cấu hình mã % không hợp lệ." };
  }
  const raw = Math.floor((basis * pct) / 100);
  const cap =
    rule.discountCapVnd != null && Number.isFinite(rule.discountCapVnd)
      ? Math.max(0, Math.floor(rule.discountCapVnd))
      : Number.POSITIVE_INFINITY;
  const discount = Math.min(raw, cap, basis);
  if (discount <= 0) {
    return { error: "Không còn phần tạm tính để áp mã." };
  }
  return { discount };
}

export function applyPromoCodeWithRules(
  subtotal: number,
  rawCode: string | null | undefined,
  rules: readonly PromoRulePublic[],
  options?: ApplyPromoOptions,
): PromoResult {
  const code = rawCode?.trim().toUpperCase();
  if (!code) {
    return { ok: false, message: "Vui lòng nhập mã khuyến mãi." };
  }
  if (subtotal <= 0) {
    return { ok: false, message: "Chưa có tạm tính để áp dụng mã." };
  }

  const pre = Math.max(0, Math.floor(options?.preAppliedDiscount ?? 0));
  const basis = discountBasis(subtotal, pre);

  const rule = rules.find((r) => r.code.trim().toUpperCase() === code);
  if (!rule) {
    return {
      ok: false,
      message: "Mã không hợp lệ hoặc đã ngừng áp dụng.",
    };
  }

  const out = computeDiscountForRule(rule, subtotal, basis);
  if ("error" in out) {
    return { ok: false, message: out.error };
  }

  return {
    ok: true,
    discount: out.discount,
    normalizedCode: code,
    label: rule.label || `Giảm ${formatMoneyVi(out.discount)} (${code})`,
  };
}

export function applyPromoCode(
  subtotal: number,
  rawCode: string | null | undefined,
  options?: ApplyPromoOptions,
): PromoResult {
  return applyPromoCodeWithRules(subtotal, rawCode, BUILTIN_PROMO_RULES, options);
}
