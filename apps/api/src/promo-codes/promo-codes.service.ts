import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { PromoCode } from '../entities/promo-code.entity';
import { isPromoRedeemable } from '../common/promo-checkout';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';

export interface PromoCodeRowDto {
  id: number;
  code: string;
  label: string;
  discountKind: 'fixed' | 'percent';
  discountFixed: number;
  discountPercent: number;
  discountCapVnd: number | null;
  minOrderSubtotal: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

function toIso(value: Date | undefined | null): string | null {
  if (!value) return null;
  return value.toISOString();
}

function mapPromo(row: PromoCode): PromoCodeRowDto {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    discountKind: row.discountKind,
    discountFixed: row.discountFixed,
    discountPercent: row.discountPercent,
    discountCapVnd: row.discountCapVnd ?? null,
    minOrderSubtotal: row.minOrderSubtotal,
    isActive: row.isActive,
    validFrom: toIso(row.validFrom),
    validUntil: toIso(row.validUntil),
    usageLimit: row.usageLimit ?? null,
    usageCount: row.usageCount,
    createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(row.updatedAt) ?? new Date().toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

@Injectable()
export class PromoCodesService {
  constructor(private readonly em: EntityManager) {}

  async list(params: {
    page: number;
    limit: number;
    q?: string;
    activeOnly?: boolean;
  }) {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: FilterQuery<PromoCode> = { deletedAt: null };
    if (params.activeOnly) where.isActive = true;
    if (params.q?.trim()) {
      const q = `%${params.q.trim()}%`;
      where.$or = [{ code: { $like: q } }, { label: { $like: q } }];
    }
    const [rows, total] = await this.em.findAndCount(PromoCode, where, {
      orderBy: { updatedAt: 'DESC' },
      limit,
      offset: skip,
    });
    return {
      data: rows.map(mapPromo),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<PromoCodeRowDto | null> {
    const row = await this.em.findOne(PromoCode, { id, deletedAt: null });
    return row ? mapPromo(row) : null;
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

  async create(data: Partial<PromoCode>): Promise<PromoCodeRowDto> {
    const now = new Date();
    const row = this.em.create(PromoCode, {
      code: String(data.code ?? '')
        .trim()
        .toUpperCase(),
      label: String(data.label ?? '').trim(),
      discountKind: data.discountKind === 'percent' ? 'percent' : 'fixed',
      discountFixed: Math.max(0, Math.floor(Number(data.discountFixed) || 0)),
      discountPercent: Math.max(
        0,
        Math.min(100, Math.floor(Number(data.discountPercent) || 0)),
      ),
      discountCapVnd:
        data.discountCapVnd === undefined || data.discountCapVnd === null
          ? null
          : Math.max(0, Math.floor(Number(data.discountCapVnd))),
      minOrderSubtotal: Math.max(
        0,
        Math.floor(Number(data.minOrderSubtotal) || 0),
      ),
      isActive: data.isActive !== false,
      validFrom: data.validFrom ?? null,
      validUntil: data.validUntil ?? null,
      usageLimit:
        data.usageLimit === undefined || data.usageLimit === null
          ? null
          : Math.max(1, Math.floor(Number(data.usageLimit))),
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    await this.em.persistAndFlush(row);
    return mapPromo(row);
  }

  async update(
    id: number,
    data: Partial<PromoCode>,
  ): Promise<PromoCodeRowDto | null> {
    const row = await this.em.findOne(PromoCode, { id, deletedAt: null });
    if (!row) return null;
    if (data.label !== undefined) row.label = String(data.label).trim();
    if (data.discountKind !== undefined) {
      row.discountKind = data.discountKind === 'percent' ? 'percent' : 'fixed';
    }
    if (data.discountFixed !== undefined) {
      row.discountFixed = Math.max(0, Math.floor(Number(data.discountFixed)));
    }
    if (data.discountPercent !== undefined) {
      row.discountPercent = Math.max(
        0,
        Math.min(100, Math.floor(Number(data.discountPercent))),
      );
    }
    if (data.discountCapVnd !== undefined) {
      row.discountCapVnd =
        data.discountCapVnd === null
          ? null
          : Math.max(0, Math.floor(Number(data.discountCapVnd)));
    }
    if (data.minOrderSubtotal !== undefined) {
      row.minOrderSubtotal = Math.max(
        0,
        Math.floor(Number(data.minOrderSubtotal)),
      );
    }
    if (data.isActive !== undefined) row.isActive = Boolean(data.isActive);
    if (data.validFrom !== undefined) row.validFrom = data.validFrom;
    if (data.validUntil !== undefined) row.validUntil = data.validUntil;
    if (data.usageLimit !== undefined) {
      row.usageLimit =
        data.usageLimit === null
          ? null
          : Math.max(1, Math.floor(Number(data.usageLimit)));
    }
    await this.em.flush();
    return mapPromo(row);
  }

  async softDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(PromoCode, { id, deletedAt: null });
    if (!row) return false;
    row.deletedAt = new Date();
    row.isActive = false;
    await this.em.flush();
    return true;
  }

  async incrementUsage(em: EntityManager, id: number): Promise<void> {
    const row = await em.findOne(PromoCode, { id, deletedAt: null });
    if (!row) return;
    row.usageCount += 1;
  }

  /** Rule công khai cho storefront — chỉ mã đang redeem được. */
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
}
