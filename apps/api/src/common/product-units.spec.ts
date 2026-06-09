import { applyProductStockDeduction, productBaseStock } from './product-units';
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
    stock: 200,
    unit: 'goi',
    unitTypes: [
      {
        type: 'goi',
        label: 'Gói lẻ',
        retailPrice: 5000,
        wholesalePrice: 4500,
        minWholesaleQty: 0,
        qtyPerUnit: 1,
      },
      {
        type: 'thung',
        label: 'Thùng',
        retailPrice: 120000,
        wholesalePrice: 110000,
        minWholesaleQty: 0,
        qtyPerUnit: 30,
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Product;
}

describe('applyProductStockDeduction', () => {
  it('trừ pool-only qua product.stock', () => {
    const product = mockProduct({ stock: 200 });
    applyProductStockDeduction(product, 180, 'thung');
    expect(product.stock).toBe(20);
    expect(productBaseStock(product)).toBe(20);
  });

  it('từ chối trừ vượt pool-only', () => {
    const product = mockProduct({ stock: 50 });
    expect(() => applyProductStockDeduction(product, 60, 'goi')).toThrow(
      /không đủ tồn kho/,
    );
    expect(product.stock).toBe(50);
  });

  it('ưu tiên product.stock — bỏ qua unit.stock cũ gây phình pool', () => {
    const product = mockProduct({
      stock: 30,
      unitTypes: [
        {
          type: 'thung',
          label: 'Thùng',
          retailPrice: 120000,
          wholesalePrice: 110000,
          minWholesaleQty: 0,
          qtyPerUnit: 30,
          stock: 30,
        },
      ],
    });
    expect(productBaseStock(product)).toBe(30);
    expect(Math.floor(productBaseStock(product) / 30)).toBe(1);
  });

  it('trừ legacy qua unit.stock rồi sync product.stock', () => {
    const product = mockProduct({
      stock: 0,
      unitTypes: [
        {
          type: 'thung',
          label: 'Thùng',
          retailPrice: 120000,
          wholesalePrice: 110000,
          minWholesaleQty: 0,
          qtyPerUnit: 30,
          stock: 80,
        },
      ],
    });
    applyProductStockDeduction(product, 60, 'thung');
    expect(product.unitTypes?.[0]?.stock).toBe(78);
    expect(productBaseStock(product)).toBe(2340);
  });
});
