import type { ProductUnitType, QuantityCondition } from './product-types';

/** Shape tối thiểu cho stock helpers (module-bases products). */
export type ProductStockLike = {
  name?: string;
  sku?: string;
  unit?: string;
  stock: number;
  unitTypes?: ProductUnitType[] | null;
  retailPrice?: number;
  wholesalePrice?: number;
  images?: string[] | null;
};

export function resolveUnit(
  product: ProductStockLike,
  unitType: string,
): ProductUnitType {
  const fromList = product.unitTypes?.find((u) => u.type === unitType);
  if (fromList) return fromList;
  return {
    type: product.unit || unitType,
    label: product.unit || unitType,
    retailPrice: product.retailPrice ?? 0,
    wholesalePrice: product.wholesalePrice ?? null,
    minWholesaleQty: 0,
    qtyPerUnit: 1,
  };
}

export function resolveUnitImage(
  unit: ProductUnitType,
  product: Pick<ProductStockLike, 'images'>,
): string | undefined {
  const unitImg = unit.images?.find((u) => String(u).trim());
  if (unitImg) return String(unitImg).trim();
  const productImg = product.images?.find((u) => String(u).trim());
  return productImg ? String(productImg).trim() : undefined;
}

export function resolveLineSku(
  unit: ProductUnitType,
  product: Pick<ProductStockLike, 'sku'>,
): string {
  return unit.sku?.trim() || product.sku || '';
}

/** SL dùng để kiểm tra điều kiện KM / quà. */
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

export function getUnitStock(unit: ProductUnitType): number | null {
  if (unit.stock !== undefined && unit.stock !== null) {
    return Math.max(0, Math.floor(Number(unit.stock)));
  }
  return null;
}

/** Có tồn bán rõ ràng trên từng loại hàng (legacy); pool-only chỉ dùng `product.stock`. */
export function hasExplicitSellableUnitStock(
  product: ProductStockLike,
): boolean {
  return (product.unitTypes ?? []).some((u) => {
    const sell = getUnitStock(u);
    return sell !== null && sell > 0;
  });
}

/** Đồng bộ `product.stock` từ tổng pool các loại hàng (khi có `unit.stock`). */
export function syncProductStockFromUnits(product: ProductStockLike): void {
  const units = product.unitTypes ?? [];
  const hasUnitStock = units.some(
    (u) => u.stock !== undefined && u.stock !== null,
  );
  if (hasUnitStock) {
    product.stock = sumUnitStocks(product);
  }
}

/**
 * Trừ tồn sp gốc khỏi sản phẩm (mutate entity).
 * Pool-only: chỉ giảm `product.stock`. Legacy: trừ trên `unit.stock` rồi sync.
 */
export function applyProductStockDeduction(
  product: ProductStockLike,
  deductBase: number,
  preferUnitType?: string,
): void {
  const base = productBaseStock(product);
  const deduct = Math.max(0, Math.floor(deductBase));
  if (deduct <= 0) return;
  if (base < deduct) {
    const label = preferUnitType?.trim() || product.unit;
    throw new Error(`Loại "${label}" của "${product.name}" không đủ tồn kho`);
  }

  if (hasExplicitSellableUnitStock(product) && product.unitTypes?.length) {
    deductBaseStockFromUnits(product, deduct, preferUnitType);
    syncProductStockFromUnits(product);
    const after = productBaseStock(product);
    if (after !== base - deduct) {
      throw new Error(
        `Loại "${preferUnitType ?? product.unit}" của "${product.name}" không đủ tồn kho`,
      );
    }
    return;
  }

  product.stock = base - deduct;
}

/** Tổng tồn sp gốc — cộng `stock × qtyPerUnit` mọi loại hàng. */
export function productBaseStock(product: ProductStockLike): number {
  const pool = Math.max(0, Math.floor(product.stock || 0));
  if (pool > 0) return pool;

  const units = product.unitTypes ?? [];
  const withStock = units.filter(
    (u) => u.stock !== undefined && u.stock !== null,
  );
  if (withStock.length === 0) return 0;

  return withStock.reduce((sum, u) => {
    const sell = Math.max(0, Math.floor(Number(u.stock) || 0));
    const per = Math.max(1, Math.floor(Number(u.qtyPerUnit) || 1));
    return sum + sell * per;
  }, 0);
}

/** SL tối đa loại hàng sau khi trừ sp gốc đã giữ (giỏ / dòng đơn trước). */
export function maxPurchasableUnitQty(
  unit: ProductUnitType,
  product: ProductStockLike,
  reservedBase = 0,
): number {
  const base = productBaseStock(product);
  const reserved = Math.max(0, Math.floor(Number(reservedBase) || 0));
  const remaining = Math.max(0, base - reserved);
  const per = Math.max(1, Math.floor(unit.qtyPerUnit || 1));
  return Math.floor(remaining / per);
}

/** Tồn có thể bán theo loại hàng — chia từ pool sp gốc. */
export function resolveSellableUnitStock(
  unit: ProductUnitType,
  product: ProductStockLike,
  reservedBase = 0,
): number {
  return maxPurchasableUnitQty(unit, product, reservedBase);
}

/** Đồng bộ `product.stock` = tổng sp gốc từ các loại hàng. */
export function sumUnitStocks(product: ProductStockLike): number {
  return productBaseStock(product);
}

/** Trừ tồn sp gốc khỏi các loại hàng (ưu tiên loại đang bán). */
export function deductBaseStockFromUnits(
  product: ProductStockLike,
  deductBase: number,
  preferUnitType?: string,
): void {
  let remaining = Math.max(0, Math.floor(deductBase));
  if (remaining <= 0 || !product.unitTypes?.length) return;

  const nextUnits = [...product.unitTypes];
  const order: number[] = [];
  const preferIdx = preferUnitType
    ? nextUnits.findIndex((u) => u.type === preferUnitType)
    : -1;
  if (preferIdx >= 0) order.push(preferIdx);
  for (let i = 0; i < nextUnits.length; i++) {
    if (i !== preferIdx) order.push(i);
  }

  for (const idx of order) {
    if (remaining <= 0) break;
    const unit = nextUnits[idx];
    if (!unit) continue;
    const unitSell = getUnitStock(unit);
    if (unitSell === null || unitSell <= 0) continue;
    const per = Math.max(1, Math.floor(unit.qtyPerUnit || 1));
    const sellRemove = Math.min(unitSell, Math.floor(remaining / per));
    if (sellRemove <= 0) continue;
    nextUnits[idx] = { ...unit, stock: unitSell - sellRemove };
    remaining -= sellRemove * per;
  }

  product.unitTypes = nextUnits;
}
