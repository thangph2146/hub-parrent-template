import { effectiveLineUnitPrice } from './unit-pricing';

describe('effectiveLineUnitPrice', () => {
  it('ưu tiên bậc giá cao nhất khi đủ SL', () => {
    const result = effectiveLineUnitPrice(
      {
        retailPrice: 100000,
        wholesalePrice: 90000,
        minWholesaleQty: 2,
        priceTiers: [
          { minQty: 3, unitPrice: 85000, label: 'Mua 3+' },
          { minQty: 5, unitPrice: 80000, label: 'Mua 5+' },
        ],
      },
      5,
    );
    expect(result.unitPrice).toBe(80000);
    expect(result.tierLabel).toBe('Mua 5+');
  });

  it('fallback wholesale khi không có bậc', () => {
    const result = effectiveLineUnitPrice(
      {
        retailPrice: 100000,
        wholesalePrice: 90000,
        minWholesaleQty: 2,
      },
      2,
    );
    expect(result.unitPrice).toBe(90000);
  });
});
