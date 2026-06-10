import { computePromoDiscount, isPromoRedeemable } from './promo-checkout';
import { PromoCode } from '../entities/promo-code.entity';

function mockPromo(overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    id: 1,
    code: 'SALE10',
    label: 'Giảm 10%',
    discountKind: 'percent',
    discountFixed: 0,
    discountPercent: 10,
    discountCapVnd: 50_000,
    minOrderSubtotal: 100_000,
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as PromoCode;
}

describe('promo-checkout', () => {
  it('tính giảm % có trần', () => {
    const result = computePromoDiscount(500_000, mockPromo());
    expect(result.discountAmount).toBe(50_000);
  });

  it('không giảm khi chưa đạt minOrderSubtotal', () => {
    const result = computePromoDiscount(50_000, mockPromo());
    expect(result.discountAmount).toBe(0);
  });

  it('từ chối mã hết hạn', () => {
    const promo = mockPromo({
      validUntil: new Date('2020-01-01'),
    });
    expect(isPromoRedeemable(promo, new Date('2026-01-01')).ok).toBe(false);
  });
});
