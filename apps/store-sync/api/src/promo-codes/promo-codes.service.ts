/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { toEntityId } from '../common/entity-id';
import { PromoCode } from '../entities/promo-code.entity';
import { isPromoRedeemable } from '../common/commerce/promo-checkout';
import { BasePromoCodesService } from '../common/module-bases/promo-codes/promo-code.service';
export type {
  PromoCodesRowDto,
  PromoCodesCreateData,
  PromoCodesUpdateData,
} from '../common/module-bases/promo-codes/promo-code.service';

@Injectable()
export class PromoCodesService extends BasePromoCodesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return PromoCode as unknown as new () => Record<string, unknown>;
  }

  async listPublicRules(): Promise<
    Array<{
      code: string;
      label: string;
      discountKind: 'fixed' | 'percent';
      discountFixed: number;
      discountPercent: number;
      discountCapVnd: number | null;
      minOrderSubtotal: number;
    }>
  > {
    const rows = await this.em.find(
      PromoCode,
      { deletedAt: null, isActive: true },
      { orderBy: { updatedAt: 'DESC' } },
    );
    return rows
      .filter((row) => isPromoRedeemable(row).ok)
      .map((row) => ({
        code: row.code,
        label: row.label,
        discountKind: row.discountKind,
        discountFixed: row.discountFixed,
        discountPercent: row.discountPercent,
        discountCapVnd: row.discountCapVnd ?? null,
        minOrderSubtotal: row.minOrderSubtotal,
      }));
  }

  async findRedeemableByCode(code: string): Promise<PromoCode | null> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;
    const row = await this.em.findOne(PromoCode, {
      code: normalized,
      deletedAt: null,
    });
    if (!row) return null;
    const check = isPromoRedeemable(row);
    return check.ok ? row : null;
  }

  async incrementUsage(em: EntityManager, id: number): Promise<void> {
    const row = await em.findOne(PromoCode, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return;
    row.usageCount += 1;
  }
}
