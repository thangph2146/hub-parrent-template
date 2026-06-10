import { evaluateOrderGifts } from './gift-rules';
import { Product } from '../entities/product.entity';

function mockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    sku: 'SP-001',
    name: 'Sản phẩm A',
    category: 'general',
    retailPrice: 100000,
    wholesalePrice: 90000,
    stock: 20,
    unit: 'hop',
    unitTypes: [
      {
        type: 'hop',
        label: 'Hộp',
        retailPrice: 100000,
        wholesalePrice: 90000,
        minWholesaleQty: 2,
        qtyPerUnit: 1,
        giftRules: [
          {
            id: 'gift-coc',
            label: 'Tặng cốc',
            trigger: { scope: 'line', minQty: 3 },
            gift: { name: 'Cốc in logo', qty: 1, qtyMultiplier: 'once' },
          },
        ],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Product;
}

describe('evaluateOrderGifts', () => {
  it('không tặng khi chưa đủ SL', () => {
    const gifts = evaluateOrderGifts(
      [{ productId: 1, unitType: 'hop', quantity: 2 }],
      new Map([[1, mockProduct()]]),
    );
    expect(gifts).toHaveLength(0);
  });

  it('tặng quà khi đủ minQty theo dòng', () => {
    const gifts = evaluateOrderGifts(
      [{ productId: 1, unitType: 'hop', quantity: 3 }],
      new Map([[1, mockProduct()]]),
    );
    expect(gifts).toHaveLength(1);
    expect(gifts[0]?.name).toBe('Cốc in logo');
    expect(gifts[0]?.qty).toBe(1);
  });

  it('scope product — cộng SL các dòng cùng SP', () => {
    const product = mockProduct({
      unitTypes: [
        {
          type: 'hop',
          label: 'Hộp',
          retailPrice: 100000,
          wholesalePrice: null,
          minWholesaleQty: 0,
          qtyPerUnit: 1,
          giftRules: [
            {
              id: 'gift-bundle',
              label: 'Tặng túi',
              trigger: { scope: 'product', minQty: 5 },
              gift: { name: 'Túi vải', qty: 1 },
            },
          ],
        },
        {
          type: 'thung',
          label: 'Thùng',
          retailPrice: 400000,
          wholesalePrice: null,
          minWholesaleQty: 0,
          qtyPerUnit: 1,
          giftRules: [
            {
              id: 'gift-bundle',
              label: 'Tặng túi',
              trigger: { scope: 'product', minQty: 5 },
              gift: { name: 'Túi vải', qty: 1 },
              applyPer: 'order',
            },
          ],
        },
      ],
    });
    const gifts = evaluateOrderGifts(
      [
        { productId: 1, unitType: 'hop', quantity: 2 },
        { productId: 1, unitType: 'thung', quantity: 3 },
      ],
      new Map([[1, product]]),
    );
    expect(gifts).toHaveLength(1);
    expect(gifts[0]?.name).toBe('Túi vải');
  });
});
