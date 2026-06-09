import type { ProductGiftRule, ProductUnitType } from './types';

/** Chuẩn hoá để khớp `unitType` trong note với `ProductUnitType.type`. */
export function normalizeGiftRuleUnitType(raw: string): string {
  return raw.trim().toLocaleLowerCase('vi');
}

export type LegacyFulfillmentGiftRule = {
  minQty: number;
  unitType: string;
  giftQty: number;
  giftName: string;
  giftSku: string;
  giftUnitType: string;
};

/**
 * Parse quà từ `fulfillmentNote` (định dạng legacy).
 * `- Từ {n} {unitType}: tặng {qty} {tên quà} (SKU: …) - đơn vị quà: ….`
 */
export function parseGiftRulesFromFulfillmentNote(
  note: string | null | undefined,
): LegacyFulfillmentGiftRule[] {
  if (!note) return [];
  const out: LegacyFulfillmentGiftRule[] = [];
  for (const rawLine of note.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('- Từ ')) continue;
    const m = line.match(/^- Từ\s+(\d+)\s+(.+?):\s+tặng\s+(\d+)\s+(.+)\.$/);
    if (!m?.[1] || !m[2] || !m[3] || !m[4]) continue;

    const minQty = Math.max(1, Number(m[1]) || 1);
    const unitType = m[2].trim();
    const giftQty = Math.max(1, Number(m[3]) || 1);

    let giftPayload = m[4].trim();
    let giftUnitType = '';
    let giftSku = '';

    const unitMarker = ' - đơn vị quà: ';
    const unitAt = giftPayload.lastIndexOf(unitMarker);
    if (unitAt >= 0) {
      giftUnitType = giftPayload.slice(unitAt + unitMarker.length).trim();
      giftPayload = giftPayload.slice(0, unitAt).trim();
    }

    const skuMatch = giftPayload.match(/\(SKU:\s*([^)]+)\)\s*$/);
    if (skuMatch?.[1]) {
      giftSku = skuMatch[1].trim();
      giftPayload = giftPayload.slice(0, skuMatch.index).trim();
    }

    const giftName = giftPayload.trim();
    if (!giftName) continue;

    out.push({ minQty, unitType, giftQty, giftName, giftSku, giftUnitType });
  }
  return out;
}

function legacyGiftRulesAsProductGiftRules(
  fulfillmentNote: string | null | undefined,
  unitType: string,
): ProductGiftRule[] {
  const key = normalizeGiftRuleUnitType(unitType);
  return parseGiftRulesFromFulfillmentNote(fulfillmentNote)
    .filter((r) => normalizeGiftRuleUnitType(r.unitType) === key)
    .map((r, index) => ({
      id: `legacy-gift-${index}`,
      label: r.giftName,
      trigger: { scope: 'line' as const, minQty: r.minQty },
      gift: {
        name: r.giftName,
        sku: r.giftSku || undefined,
        qty: r.giftQty,
      },
    }));
}

/** Quà tặng theo loại hàng: ưu tiên `unit.giftRules`, fallback `fulfillmentNote`. */
export function resolveGiftRulesForUnit(
  unit: Pick<ProductUnitType, 'type' | 'giftRules'>,
  fulfillmentNote?: string | null,
): ProductGiftRule[] {
  const fromUnit = (unit.giftRules ?? []).filter(
    (rule) => rule?.id && rule.gift?.name?.trim(),
  );
  if (fromUnit.length > 0) return fromUnit;
  return legacyGiftRulesAsProductGiftRules(fulfillmentNote, unit.type);
}

/** Quà legacy đầu tiên khớp loại đơn vị — tương thích cart cũ. */
export function getLegacyGiftRuleForUnit(
  fulfillmentNote: string | null | undefined,
  unitType: string,
): LegacyFulfillmentGiftRule | null {
  const key = normalizeGiftRuleUnitType(unitType);
  return (
    parseGiftRulesFromFulfillmentNote(fulfillmentNote).find(
      (r) => normalizeGiftRuleUnitType(r.unitType) === key,
    ) ?? null
  );
}
