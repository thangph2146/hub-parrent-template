/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { ProductPriceTier, ProductUnitType } from './product-types';

export type LinePricingResult = {
  unitPrice: number;

  listUnitPrice: number;

  isSaleActive: boolean;

  tierLabel?: string;
};

function pickBestTier(
  tiers: ProductPriceTier[] | undefined,

  quantity: number,
): ProductPriceTier | null {
  if (!tiers?.length) return null;

  const q = Math.max(1, Math.floor(quantity));

  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);

  return sorted.find((t) => q >= Math.max(1, Math.floor(t.minQty))) ?? null;
}

/** Giá một dòng theo đơn vị — bậc giá, rồi wholesale, rồi retail. */

export function effectiveLineUnitPrice(
  unit: Pick<
    ProductUnitType,
    'retailPrice' | 'wholesalePrice' | 'minWholesaleQty' | 'priceTiers'
  >,

  quantity: number,
): LinePricingResult {
  const retail = Math.max(0, Math.floor(Number(unit.retailPrice) || 0));

  const q = Math.max(1, Math.floor(quantity));

  const tier = pickBestTier(unit.priceTiers, q);

  if (tier) {
    const tierPrice = Math.max(0, Math.floor(Number(tier.unitPrice) || 0));

    return {
      unitPrice: tierPrice,

      listUnitPrice: retail,

      isSaleActive: tierPrice < retail,

      tierLabel: tier.label,
    };
  }

  const rawW = unit.wholesalePrice;

  const wholesaleNum =
    rawW === null || rawW === undefined || !Number.isFinite(Number(rawW))
      ? null
      : Math.floor(Number(rawW));

  const minQ = Math.max(0, Math.floor(Number(unit.minWholesaleQty) || 0));

  if (wholesaleNum === null || wholesaleNum <= 0 || wholesaleNum >= retail) {
    return { unitPrice: retail, listUnitPrice: retail, isSaleActive: false };
  }

  const eligible = minQ <= 0 ? true : q >= minQ;

  return {
    unitPrice: eligible ? wholesaleNum : retail,

    listUnitPrice: retail,

    isSaleActive: eligible,
  };
}
