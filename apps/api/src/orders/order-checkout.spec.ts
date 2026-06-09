import {
  buildOrderItemsFromProducts,
  mergeCreateOrderLines,
} from './order-checkout';
import { Product } from '../entities/product.entity';

function mockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    sku: 'SP-001',
    name: 'Sản phẩm A',
    category: 'general',
    basePrice: 100000,
    wholesalePrice: 90000,
    retailPrice: 100000,
    stock: 10,
    unit: 'hop',
    unitTypes: [
      {
        type: 'hop',
        label: 'Hộp',
        sku: 'SP-001-HOP',
        retailPrice: 100000,
        wholesalePrice: 90000,
        minWholesaleQty: 2,
        qtyPerUnit: 1,
        images: ['/api/uploads/images/products/hop.webp'],
      },
    ],
    images: ['/api/uploads/images/products/a.webp'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Product;
}

describe('order-checkout', () => {
  it('gộp dòng trùng product + unitType', () => {
    const merged = mergeCreateOrderLines([
      { productId: 1, quantity: 1, unitType: 'hop' },
      { productId: 1, quantity: 2, unitType: 'hop' },
    ]);
    expect(merged).toEqual([{ productId: 1, quantity: 3, unitType: 'hop' }]);
  });

  it('tính giá và ảnh snapshot từ catalog', () => {
    const product = mockProduct();
    const items = buildOrderItemsFromProducts(
      [{ productId: 1, quantity: 2, unitType: 'hop' }],
      new Map([[1, product]]),
    );
    expect(items[0]?.unitPrice).toBe(90000);
    expect(items[0]?.totalPrice).toBe(180000);
    expect(items[0]?.image).toBe('/api/uploads/images/products/hop.webp');
    expect(items[0]?.variantSku).toBe('SP-001-HOP');
  });

  it('từ chối đặt vượt tồn theo loại hàng', () => {
    const product = mockProduct({
      unitTypes: [
        {
          type: 'thung',
          label: 'Thùng',
          sku: 'SP-001-THUNG',
          retailPrice: 100000,
          qtyPerUnit: 30,
          stock: 80,
        },
      ],
    });
    expect(() =>
      buildOrderItemsFromProducts(
        [{ productId: 1, quantity: 81, unitType: 'thung' }],
        new Map([[1, product]]),
      ),
    ).toThrow(/chỉ còn 80/);
  });

  it('chia pool sp gốc — thùng tồn 0 vẫn bán được từ gói lẻ', () => {
    const product = mockProduct({
      unitTypes: [
        {
          type: 'goi',
          label: 'Gói lẻ',
          retailPrice: 5000,
          qtyPerUnit: 1,
          stock: 200,
        },
        {
          type: 'thung',
          label: 'Thùng',
          retailPrice: 120000,
          qtyPerUnit: 30,
          stock: 0,
        },
      ],
    });
    const items = buildOrderItemsFromProducts(
      [{ productId: 1, quantity: 6, unitType: 'thung' }],
      new Map([[1, product]]),
    );
    expect(items[0]?.quantity).toBe(6);
    expect(() =>
      buildOrderItemsFromProducts(
        [{ productId: 1, quantity: 7, unitType: 'thung' }],
        new Map([[1, product]]),
      ),
    ).toThrow(/chỉ còn 6/);
  });
});
