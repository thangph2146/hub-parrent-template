import type { OrderItemSnapshot } from '../../commerce/product-types';
import { effectiveLineUnitPrice } from '../../commerce/unit-pricing';
import {
  resolveLineSku,
  resolveSellableUnitStock,
  resolveUnit,
  resolveUnitImage,
  type ProductStockLike,
} from '../../commerce/product-units';

export type CheckoutProduct = ProductStockLike & {
  id: number;
  name: string;
  sku: string;
  fulfillmentNote?: string | null;
};

export type CreateOrderLineInput = {
  productId: number;
  quantity: number;
  unitType: string;
};

export function mergeCreateOrderLines(
  lines: CreateOrderLineInput[],
): CreateOrderLineInput[] {
  const map = new Map<string, CreateOrderLineInput>();
  for (const line of lines) {
    const productId = Math.floor(Number(line.productId));
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 0));
    const unitType = String(line.unitType || '').trim();
    if (!productId || !unitType) continue;
    const key = `${productId}:${unitType}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      map.set(key, { productId, quantity, unitType });
    }
  }
  return [...map.values()];
}

export function buildOrderItemsFromProducts(
  mergedLines: CreateOrderLineInput[],
  productsById: Map<number, CheckoutProduct>,
): OrderItemSnapshot[] {
  const items: OrderItemSnapshot[] = [];
  const reservedBaseByProduct = new Map<number, number>();

  for (const line of mergedLines) {
    const product = productsById.get(line.productId);
    if (!product) {
      throw new Error(
        `Sản phẩm #${line.productId} không tồn tại hoặc ngừng bán`,
      );
    }
    const unit = resolveUnit(product, line.unitType);
    if (unit.isActive === false) {
      throw new Error(
        `Loại hàng "${unit.label}" của "${product.name}" không còn bán`,
      );
    }
    const reservedBase = reservedBaseByProduct.get(line.productId) ?? 0;
    const available = resolveSellableUnitStock(unit, product, reservedBase);
    if (line.quantity > available) {
      throw new Error(
        available <= 0
          ? `Loại "${unit.label}" của "${product.name}" đã hết hàng`
          : `Loại "${unit.label}" của "${product.name}" chỉ còn ${available} trong kho`,
      );
    }
    const pricing = effectiveLineUnitPrice(unit, line.quantity);
    const qtyPerUnit = Math.max(1, Math.floor(unit.qtyPerUnit || 1));
    const totalPrice = pricing.unitPrice * line.quantity;
    const variantSku = resolveLineSku(unit, product);
    const image = resolveUnitImage(unit, product);
    const giftNotes = [
      product.fulfillmentNote?.trim(),
      pricing.tierLabel ? `Bậc giá: ${pricing.tierLabel}` : null,
    ].filter(Boolean);

    items.push({
      productId: product.id,
      sku: product.sku,
      variantSku,
      name: product.name,
      quantity: line.quantity,
      unitType: unit.type,
      unitPrice: pricing.unitPrice,
      totalPrice,
      qtyPerUnit,
      image,
      giftNote: giftNotes.length ? giftNotes.join(' · ') : undefined,
      listUnitPrice: pricing.listUnitPrice,
      unitLabel: unit.label,
    });

    const lineBase = line.quantity * qtyPerUnit;
    reservedBaseByProduct.set(line.productId, reservedBase + lineBase);
  }
  if (!items.length) {
    throw new Error('Đơn hàng phải có ít nhất một sản phẩm hợp lệ');
  }
  return items;
}

export function buildOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `ORD-${y}${m}${d}-${rand}`;
}
