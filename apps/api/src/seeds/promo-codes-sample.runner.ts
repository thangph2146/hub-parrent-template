import type { EntityManager } from '@mikro-orm/core';
import { PromoCode } from '../entities/promo-code.entity';

/** Khớp `@workspace/promo-codes` BUILTIN_PROMO_RULES + mã admin. */
const SAMPLE: Array<Partial<PromoCode>> = [
  {
    code: 'GIAM50K',
    label: 'Giảm 50.000đ (GIAM50K)',
    discountKind: 'fixed',
    discountFixed: 50_000,
    minOrderSubtotal: 200_000,
    isActive: true,
  },
  {
    code: 'SYNC10',
    label: 'Giảm 10% (tối đa 200.000đ) — SYNC10',
    discountKind: 'percent',
    discountPercent: 10,
    discountCapVnd: 200_000,
    minOrderSubtotal: 0,
    isActive: true,
  },
  {
    code: 'WELCOME30',
    label: 'Giảm 30.000đ cho đơn đầu',
    discountKind: 'fixed',
    discountFixed: 30_000,
    minOrderSubtotal: 150_000,
    isActive: true,
  },
  {
    code: 'SALE10',
    label: 'Giảm 10% (tối đa 50k)',
    discountKind: 'percent',
    discountPercent: 10,
    discountCapVnd: 50_000,
    minOrderSubtotal: 100_000,
    isActive: true,
  },
  {
    code: 'FLAT20K',
    label: 'Giảm 20.000đ',
    discountKind: 'fixed',
    discountFixed: 20_000,
    minOrderSubtotal: 150_000,
    isActive: true,
  },
];

export async function seedSamplePromoCodes(em: EntityManager): Promise<number> {
  let created = 0;
  const now = new Date();
  for (const sample of SAMPLE) {
    const code = sample.code?.trim().toUpperCase();
    if (!code) continue;
    const exists = await em.findOne(PromoCode, { code });
    if (exists) continue;
    em.persist(
      em.create(PromoCode, {
        code,
        label: sample.label ?? code,
        discountKind: sample.discountKind ?? 'fixed',
        discountFixed: sample.discountFixed ?? 0,
        discountPercent: sample.discountPercent ?? 0,
        discountCapVnd: sample.discountCapVnd ?? null,
        minOrderSubtotal: sample.minOrderSubtotal ?? 0,
        isActive: sample.isActive ?? true,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      }),
    );
    created += 1;
  }
  if (created) await em.flush();
  return created;
}
