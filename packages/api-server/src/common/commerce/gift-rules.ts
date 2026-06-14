import type {
  OrderGiftSnapshot,
  ProductGiftRule,
  ProductUnitType,
} from './product-types';
import {
  effectiveQuantityForCondition,
  matchesQuantityCondition,
  resolveUnit,
  type ProductStockLike,
} from './product-units';

export type CheckoutLineContext = {
  productId: number;
  unitType: string;
  quantity: number;
};

export type GiftCatalogProduct = ProductStockLike & {
  id: number;
};

function giftQtyForRule(rule: ProductGiftRule, effectiveQty: number): number {
  const base = Math.max(1, Math.floor(rule.gift.qty || 1));
  const minQty = Math.max(1, Math.floor(rule.trigger.minQty ?? 1));
  const multiplier = rule.gift.qtyMultiplier ?? 'once';

  if (multiplier === 'once') return base;

  if (multiplier === 'per_step') {
    const step = Math.max(1, Math.floor(rule.trigger.stepQty ?? minQty));
    const times = Math.floor(effectiveQty / step);
    return base * Math.max(0, times);
  }

  const times = Math.floor(effectiveQty / minQty);
  return base * Math.max(0, times);
}

function collectRulesFromUnit(unit: ProductUnitType): ProductGiftRule[] {
  return (unit.giftRules ?? []).filter((r) => r?.id && r.gift?.name?.trim());
}

function buildGiftSnapshot(
  rule: ProductGiftRule,
  ctx: CheckoutLineContext,
  qty: number,
): OrderGiftSnapshot {
  return {
    ruleId: rule.id,
    label: rule.label,
    sku: rule.gift.sku,
    name: rule.gift.name,
    qty,
    image: rule.gift.image,
    productId: rule.gift.productId ?? ctx.productId,
    unitType: ctx.unitType,
  };
}

export function evaluateOrderGifts(
  mergedLines: CheckoutLineContext[],
  productsById: Map<number, GiftCatalogProduct>,
): OrderGiftSnapshot[] {
  const productSellTotals = new Map<number, number>();
  for (const line of mergedLines) {
    const prev = productSellTotals.get(line.productId) ?? 0;
    productSellTotals.set(line.productId, prev + line.quantity);
  }

  const gifts: OrderGiftSnapshot[] = [];
  const orderRuleApplied = new Set<string>();

  for (const line of mergedLines) {
    const product = productsById.get(line.productId);
    if (!product) continue;
    const unit = resolveUnit(product, line.unitType);
    const rules = collectRulesFromUnit(unit);

    for (const rule of rules) {
      const scope = rule.trigger.scope ?? 'line';
      const sellQty =
        scope === 'product'
          ? (productSellTotals.get(line.productId) ?? line.quantity)
          : line.quantity;
      const effectiveQty = effectiveQuantityForCondition(
        sellQty,
        unit,
        rule.trigger,
      );

      if (!matchesQuantityCondition(effectiveQty, rule.trigger)) continue;

      const applyPer =
        rule.applyPer ?? (scope === 'product' ? 'order' : 'line');
      const dedupeKey =
        scope === 'product'
          ? `product:${rule.id}:${line.productId}`
          : applyPer === 'order'
            ? `order:${rule.id}:${line.productId}:${line.unitType}`
            : `line:${rule.id}:${line.productId}:${line.unitType}`;
      if (
        (applyPer === 'order' || scope === 'product') &&
        orderRuleApplied.has(dedupeKey)
      ) {
        continue;
      }

      const qty = giftQtyForRule(rule, effectiveQty);
      if (qty <= 0) continue;

      gifts.push(buildGiftSnapshot(rule, line, qty));
      if (applyPer === 'order' || scope === 'product') {
        orderRuleApplied.add(dedupeKey);
      }
    }
  }

  return gifts;
}