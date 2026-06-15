import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

export interface CartLineItem {
  productId: number;
  sku: string;
  name: string;
  image?: string;
  category: string;
  unitType: string;
  unitLabel: string;
  unitPrice: number;
  listUnitPrice: number;
  promoUnitPrice: number | null;
  minPromoQty: number;
  qtyPerUnit: number;
  quantity: number;
  isWholesale: boolean;
  fulfillmentNote: string | null;
  giftRules?: unknown[];
}

export interface CartPayload {
  lines: CartLineItem[];
  appliedPromoCode: string | null;
}

export interface CartDto extends CartPayload {
  updatedAt: string;
}

@Injectable()
export abstract class BaseCartsService {
  protected readonly logger = new Logger(BaseCartsService.name);

  protected abstract getEm(): EntityManager;

  async getForCustomer(customerId: string): Promise<CartDto> {
    const em = this.getEm();
    const rows = await em
      .getConnection()
      .execute(
        `SELECT lines, appliedPromoCode, updatedAt FROM customer_carts WHERE customerId = ? LIMIT 1`,
        [customerId],
      );
    const row = (rows as Array<Record<string, unknown>>)[0];
    if (!row) {
      return {
        lines: [],
        appliedPromoCode: null,
        updatedAt: new Date(0).toISOString(),
      };
    }
    return {
      lines: this.parseLines(row.lines),
      appliedPromoCode: row.appliedPromoCode
        ? String(row.appliedPromoCode)
        : null,
      updatedAt: row.updatedAt
        ? new Date(row.updatedAt as string).toISOString()
        : new Date(0).toISOString(),
    };
  }

  async saveForCustomer(customerId: string, raw: unknown): Promise<CartDto> {
    const em = this.getEm();
    const payload = this.sanitizePayload(raw);
    const linesJson = JSON.stringify(payload.lines);
    const existing = await em
      .getConnection()
      .execute(`SELECT id FROM customer_carts WHERE customerId = ? LIMIT 1`, [
        customerId,
      ]);
    const exists = (existing as Array<Record<string, unknown>>).length > 0;
    if (exists) {
      await em
        .getConnection()
        .execute(
          `UPDATE customer_carts SET lines = ?, appliedPromoCode = ?, updatedAt = NOW() WHERE customerId = ?`,
          [linesJson, payload.appliedPromoCode, customerId],
        );
    } else {
      await em
        .getConnection()
        .execute(
          `INSERT INTO customer_carts (customerId, lines, appliedPromoCode, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())`,
          [customerId, linesJson, payload.appliedPromoCode],
        );
    }
    return this.getForCustomer(customerId);
  }

  async clearForCustomer(customerId: string): Promise<void> {
    const em = this.getEm();
    await em
      .getConnection()
      .execute(`DELETE FROM customer_carts WHERE customerId = ?`, [customerId]);
  }

  private parseLines(raw: unknown): CartLineItem[] {
    if (!raw) return [];
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? (parsed as CartLineItem[]) : [];
    } catch {
      return [];
    }
  }

  private sanitizePayload(raw: unknown): CartPayload {
    const body =
      raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const linesIn = Array.isArray(body.lines) ? body.lines : [];
    const maxLines = 50;
    const lines: CartLineItem[] = [];
    for (const item of linesIn) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const productId = Number(o.productId);
      if (!Number.isFinite(productId) || productId <= 0) continue;
      if (typeof o.sku !== 'string' || typeof o.name !== 'string') continue;
      lines.push({
        productId: Math.floor(productId),
        sku: String(o.sku).trim(),
        name: String(o.name).trim(),
        image: typeof o.image === 'string' ? o.image : undefined,
        category: String(o.category ?? '').trim(),
        unitType: String(o.unitType ?? '').trim(),
        unitLabel: String(o.unitLabel ?? '').trim(),
        unitPrice: Math.max(0, Math.floor(Number(o.unitPrice) || 0)),
        listUnitPrice: Math.max(
          0,
          Math.floor(Number(o.listUnitPrice) || Number(o.unitPrice) || 0),
        ),
        promoUnitPrice:
          o.promoUnitPrice == null
            ? null
            : Math.max(0, Math.floor(Number(o.promoUnitPrice))),
        minPromoQty: Math.max(0, Math.floor(Number(o.minPromoQty) || 0)),
        qtyPerUnit: Math.max(1, Math.floor(Number(o.qtyPerUnit) || 1)),
        quantity: Math.max(1, Math.floor(Number(o.quantity) || 1)),
        isWholesale: o.isWholesale === true,
        fulfillmentNote:
          typeof o.fulfillmentNote === 'string' ? o.fulfillmentNote : null,
        giftRules: Array.isArray(o.giftRules) ? o.giftRules : undefined,
      });
      if (lines.length >= maxLines) break;
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
}
