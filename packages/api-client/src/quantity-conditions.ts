import type { ProductUnitType, QuantityCondition } from './types';

/** SL dùng để kiểm tra điều kiện KM / quà — khớp logic `apps/api`. */
export function effectiveQuantityForCondition(
  sellQty: number,
  unit: Pick<ProductUnitType, 'qtyPerUnit'>,
  condition?: QuantityCondition,
): number {
  const q = Math.max(1, Math.floor(sellQty));
  const mode = condition?.countMode ?? 'sell_unit';
  if (mode === 'base_unit') {
    return q * Math.max(1, Math.floor(unit.qtyPerUnit || 1));
  }
  return q;
}

export function matchesQuantityCondition(
  effectiveQty: number,
  condition?: QuantityCondition,
): boolean {
  if (!condition) return false;
  const q = Math.max(0, Math.floor(effectiveQty));
  const minQty = Math.max(0, Math.floor(condition.minQty ?? 0));
  const maxQty =
    condition.maxQty !== undefined && condition.maxQty !== null
      ? Math.floor(condition.maxQty)
      : null;
  const exactQty =
    condition.exactQty !== undefined && condition.exactQty !== null
      ? Math.floor(condition.exactQty)
      : null;
  const stepQty =
    condition.stepQty !== undefined && condition.stepQty !== null
      ? Math.max(1, Math.floor(condition.stepQty))
      : null;

  if (exactQty !== null && q !== exactQty) return false;
  if (minQty > 0 && q < minQty) return false;
  if (maxQty !== null && q > maxQty) return false;
  if (stepQty !== null && q % stepQty !== 0) return false;
  if (exactQty === null && minQty <= 0 && maxQty === null && stepQty === null) {
    return false;
  }
  return true;
}
