import {
  effectiveQuantityForCondition,
  matchesQuantityCondition,
  resolveGiftRulesForUnit,
  type ProductGiftRule,
} from "@workspace/api-client";
import type { CartLine } from "@/hooks/use-cart";

export function giftRulesForCartLine(line: CartLine): ProductGiftRule[] {
  if (line.giftRules && line.giftRules.length > 0) return line.giftRules;
  return resolveGiftRulesForUnit(
    { type: line.unitType, giftRules: [] },
    line.fulfillmentNote,
  );
}

export function isCartGiftRuleUnlocked(
  rule: ProductGiftRule,
  line: CartLine,
  productSellQty: number,
): boolean {
  const scope = rule.trigger.scope ?? (rule.applyPer === "order" ? "product" : "line");
  const sellQty = scope === "product" ? productSellQty : line.quantity;
  const effectiveQty = effectiveQuantityForCondition(sellQty, {
    qtyPerUnit: line.qtyPerUnit,
  }, rule.trigger);
  return matchesQuantityCondition(effectiveQty, rule.trigger);
}

export function describeCartGiftRuleParts(rule: ProductGiftRule): {
  conditionText: string;
  giftQty: number;
  giftName: string;
} {
  const minQty = rule.trigger.minQty;
  const conditionText =
    minQty != null && minQty > 0
      ? `từ ${minQty} ${rule.trigger.scope === "product" ? "sp (mọi loại)" : "sp"}`
      : "theo điều kiện";
  return {
    conditionText,
    giftQty: rule.gift.qty,
    giftName: rule.gift.name,
  };
}

export function summarizeCartGiftRule(rule: ProductGiftRule): string {
  const { conditionText, giftQty, giftName } = describeCartGiftRuleParts(rule);
  return `${conditionText} — tặng ${giftQty} ${giftName}`;
}
