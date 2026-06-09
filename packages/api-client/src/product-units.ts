import type { Product, ProductUnitType } from './types';



function coerceUnitTypes(raw: Product['unitTypes']): ProductUnitType[] | null {

  if (raw == null) return null;

  if (Array.isArray(raw)) return raw.length > 0 ? raw : null;

  if (typeof raw === 'string') {

    try {

      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length > 0) {

        return parsed as ProductUnitType[];

      }

    } catch {

      return null;

    }

  }

  return null;

}



/** Danh sách loại hàng — fallback đơn vị gốc khi không có `unitTypes`. */

export function getProductUnits(product: Product): ProductUnitType[] {

  const units = coerceUnitTypes(product.unitTypes);

  if (units) return units;

  return [

    {

      type: product.unit,

      label: product.unit,

      wholesalePrice: product.wholesalePrice,

      retailPrice: product.retailPrice,

      minWholesaleQty: 0,

      qtyPerUnit: 1,

      stock: product.stock,

    },

  ];

}



/**

 * Tổng tồn theo đơn vị gốc (sp gốc) — cộng `stock × qtyPerUnit` của mọi loại hàng.

 * Các loại hàng dùng chung một pool kho, quy đổi ra sp gốc rồi cộng lại.

 */

export function productBaseStock(

  product: Pick<Product, 'stock' | 'unitTypes'>,

): number {

  const units = getProductUnits(product as Product);

  const withStock = units.filter(

    (u) => u.stock !== undefined && u.stock !== null,

  );

  if (withStock.length > 0) {

    const fromUnits = withStock.reduce((sum, u) => {

      const sell = Math.max(0, Math.floor(Number(u.stock) || 0));

      const per = Math.max(1, Math.floor(Number(u.qtyPerUnit) || 1));

      return sum + sell * per;

    }, 0);

    if (fromUnits > 0) return fromUnits;

  }

  return Math.max(0, Math.floor(Number(product.stock) || 0));

}



/** Sp gốc đã «giữ» trong giỏ (mọi loại hàng cùng sản phẩm). */

export function cartReservedBase(

  lines: Array<{

    productId: number;

    quantity: number;

    qtyPerUnit?: number;

  }>,

  productId: number,

): number {

  return lines

    .filter((l) => l.productId === productId)

    .reduce((sum, l) => {

      const q = Math.max(0, Math.floor(Number(l.quantity) || 0));

      const per = Math.max(1, Math.floor(Number(l.qtyPerUnit) || 1));

      return sum + q * per;

    }, 0);

}



/**

 * SL tối đa có thể mua của một loại hàng sau khi trừ phần đã giữ (sp gốc).

 * VD: pool 200 gói → tối đa 6 thùng (30 gói/thùng).

 */

export function maxPurchasableUnitQty(

  unit: Pick<ProductUnitType, 'qtyPerUnit'>,

  product: Pick<Product, 'stock' | 'unitTypes'>,

  reservedBase = 0,

): number {

  const base = productBaseStock(product);

  const reserved = Math.max(0, Math.floor(Number(reservedBase) || 0));

  const remaining = Math.max(0, base - reserved);

  const per = Math.max(1, Math.floor(Number(unit.qtyPerUnit) || 1));

  return Math.floor(remaining / per);

}



/** Tồn có thể bán của loại hàng (đơn vị bán), tính từ pool sp gốc. */

export function unitStock(

  unit: Pick<ProductUnitType, 'stock' | 'qtyPerUnit'>,

  product: Pick<Product, 'stock' | 'unitTypes'>,

): number {

  return maxPurchasableUnitQty(unit, product, 0);

}



/** SL còn có thể đặt thêm — `reservedBase` là sp gốc đã có trong giỏ (cùng SP). */

export function remainingUnitStock(

  unit: Pick<ProductUnitType, 'qtyPerUnit'>,

  product: Pick<Product, 'stock' | 'unitTypes'>,

  reservedBase = 0,

): number {

  return maxPurchasableUnitQty(unit, product, reservedBase);

}



/** Giới hạn SL đặt trong khoảng [minQty, maxQty]; maxQty ≤ 0 → không còn hàng để thêm. */

export function clampSellQty(

  value: number,

  minQty: number,

  maxQty: number,

): number {

  const min = Math.max(0, Math.floor(Number(minQty) || 0));

  const max = Math.max(0, Math.floor(Number(maxQty) || 0));

  const v = Math.floor(Number(value) || 0);

  if (max <= 0) return min > 0 ? min : 0;

  return Math.max(min, Math.min(v, max));

}



export function hasUnitWholesalePromo(

  unit: Pick<ProductUnitType, 'retailPrice' | 'wholesalePrice'>,

): boolean {

  const retail = Math.max(0, Math.floor(Number(unit.retailPrice) || 0));

  const raw = unit.wholesalePrice;

  if (raw === null || raw === undefined || !Number.isFinite(Number(raw))) {

    return false;

  }

  const wholesale = Math.floor(Number(raw));

  return wholesale > 0 && wholesale < retail;

}


