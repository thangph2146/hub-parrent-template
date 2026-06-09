/**
 * Re-export gift helpers từ `@workspace/api-client` — một nguồn cho CTSP, giỏ, checkout.
 */
export {
  resolveGiftRulesForUnit,
  parseGiftRulesFromFulfillmentNote,
  getLegacyGiftRuleForUnit,
  normalizeGiftRuleUnitType,
  type LegacyFulfillmentGiftRule as GiftRule,
} from "@workspace/api-client";

/** @deprecated Dùng `resolveGiftRulesForUnit` — giữ tương thích cart cũ. */
export { getLegacyGiftRuleForUnit as getActiveGiftRuleForUnit } from "@workspace/api-client";
