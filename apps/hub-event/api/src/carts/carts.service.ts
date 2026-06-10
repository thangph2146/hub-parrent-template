import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type {
  CustomerCartLine,
  CustomerCartPayload,
} from '../common/cart-types';
import { CustomerCart } from '../entities/customer-cart.entity';

const MAX_LINES = 50;

function isCartLine(value: unknown): value is CustomerCartLine {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  const productId = Number(o.productId);
  return (
    Number.isFinite(productId) &&
    productId > 0 &&
    typeof o.sku === 'string' &&
    typeof o.name === 'string' &&
    typeof o.category === 'string' &&
    typeof o.unitType === 'string' &&
    typeof o.unitLabel === 'string' &&
    typeof o.unitPrice === 'number' &&
    typeof o.qtyPerUnit === 'number' &&
    typeof o.quantity === 'number' &&
    typeof o.isWholesale === 'boolean'
  );
}

function sanitizePayload(raw: unknown): CustomerCartPayload {
  const body =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const linesIn = Array.isArray(body.lines) ? body.lines : [];
  const lines: CustomerCartLine[] = [];
  for (const item of linesIn) {
    if (!isCartLine(item)) continue;
    lines.push({
      productId: Math.floor(item.productId),
      sku: item.sku.trim(),
      name: item.name.trim(),
      image: typeof item.image === 'string' ? item.image : undefined,
      category: item.category.trim(),
      unitType: String(item.unitType).trim(),
      unitLabel: item.unitLabel.trim(),
      unitPrice: Math.max(0, Math.floor(item.unitPrice)),
      listUnitPrice: Math.max(
        0,
        Math.floor(Number(item.listUnitPrice) || item.unitPrice),
      ),
      promoUnitPrice:
        item.promoUnitPrice == null
          ? null
          : Math.max(0, Math.floor(Number(item.promoUnitPrice))),
      minPromoQty: Math.max(0, Math.floor(Number(item.minPromoQty) || 0)),
      qtyPerUnit: Math.max(1, Math.floor(Number(item.qtyPerUnit) || 1)),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      isWholesale: item.isWholesale === true,
      fulfillmentNote:
        typeof item.fulfillmentNote === 'string' ? item.fulfillmentNote : null,
      giftRules: Array.isArray(item.giftRules) ? item.giftRules : undefined,
    });
    if (lines.length >= MAX_LINES) break;
  }

  let appliedPromoCode: string | null = null;
  if (
    typeof body.appliedPromoCode === 'string' &&
    body.appliedPromoCode.trim()
  ) {
    appliedPromoCode = body.appliedPromoCode.trim().toUpperCase();
  }

  return { lines, appliedPromoCode };
}

export type CustomerCartDto = CustomerCartPayload & {
  updatedAt: string;
};

@Injectable()
export class CartsService {
  constructor(private readonly em: EntityManager) {}

  async getForCustomer(customerId: string): Promise<CustomerCartDto> {
    const row = await this.em.findOne(CustomerCart, { customerId });
    if (!row) {
      return {
        lines: [],
        appliedPromoCode: null,
        updatedAt: new Date(0).toISOString(),
      };
    }
    return {
      lines: row.lines ?? [],
      appliedPromoCode: row.appliedPromoCode ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async saveForCustomer(
    customerId: string,
    raw: unknown,
  ): Promise<CustomerCartDto> {
    const payload = sanitizePayload(raw);
    let row = await this.em.findOne(CustomerCart, { customerId });
    if (!row) {
      row = this.em.create(CustomerCart, {
        customerId,
        lines: payload.lines,
        appliedPromoCode: payload.appliedPromoCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.em.persist(row);
    } else {
      row.lines = payload.lines;
      row.appliedPromoCode = payload.appliedPromoCode;
      row.updatedAt = new Date();
    }
    await this.em.flush();
    return {
      lines: row.lines,
      appliedPromoCode: row.appliedPromoCode ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async clearForCustomer(customerId: string): Promise<void> {
    const row = await this.em.findOne(CustomerCart, { customerId });
    if (!row) return;
    await this.em.removeAndFlush(row);
  }
}
