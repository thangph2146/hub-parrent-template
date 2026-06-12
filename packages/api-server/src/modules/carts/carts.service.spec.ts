import { EntityManager } from '@mikro-orm/core';
import { BaseCartsService } from './carts.service';

class TestService extends BaseCartsService {
  protected emRef!: Partial<EntityManager>;
  setEm(em: Partial<EntityManager>) { this.emRef = em; }
  protected getEm(): EntityManager { return this.emRef as EntityManager; }
}

const fakeDbRow = {
  id: 1,
  customerId: 'abc',
  lines: JSON.stringify([{ productId: 1, sku: 'SP001', name: 'Product A', category: 'Danh mục', unitType: 'cai', unitLabel: 'Cái', unitPrice: 50000, listUnitPrice: 50000, promoUnitPrice: null, minPromoQty: 0, qtyPerUnit: 1, quantity: 2, isWholesale: false, fulfillmentNote: null }]),
  appliedPromoCode: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('BaseCartsService', () => {
  let service: TestService;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    const em = { getConnection: jest.fn(() => ({ execute })) };
    service = new TestService();
    service.setEm(em);
  });

  describe('getForCustomer', () => {
    it('returns existing cart with parsed lines', async () => {
      execute.mockResolvedValueOnce([fakeDbRow]);

      const result = await service.getForCustomer('abc');

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].sku).toBe('SP001');
      expect(result.lines[0].quantity).toBe(2);
      expect(result.appliedPromoCode).toBeNull();
      expect(result.updatedAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('returns empty cart when no record found', async () => {
      execute.mockResolvedValueOnce([]);

      const result = await service.getForCustomer('abc');

      expect(result.lines).toEqual([]);
      expect(result.appliedPromoCode).toBeNull();
      expect(result.updatedAt).toEqual(expect.any(String));
    });

    it('handles null/empty lines gracefully', async () => {
      execute.mockResolvedValueOnce([{ ...fakeDbRow, lines: null }]);

      const result = await service.getForCustomer('abc');

      expect(result.lines).toEqual([]);
    });

    it('handles invalid JSON lines gracefully', async () => {
      execute.mockResolvedValueOnce([{ ...fakeDbRow, lines: 'not-json' }]);

      const result = await service.getForCustomer('abc');

      expect(result.lines).toEqual([]);
    });
  });

  describe('saveForCustomer', () => {
    it('updates existing cart', async () => {
      execute.mockResolvedValueOnce([fakeDbRow]); // existing check
      execute.mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE
      execute.mockResolvedValueOnce([fakeDbRow]); // re-fetch

      const result = await service.saveForCustomer('abc', { lines: [fakeDbRow], appliedPromoCode: null });

      expect(result.lines).toHaveLength(1);
      expect(execute.mock.calls[1][0] as string).toContain('UPDATE');
    });

    it('inserts new cart when none exists', async () => {
      execute.mockResolvedValueOnce([]); // no existing
      execute.mockResolvedValueOnce({ affectedRows: 1 }); // INSERT
      execute.mockResolvedValueOnce([fakeDbRow]); // re-fetch

      const result = await service.saveForCustomer('new-user', { lines: [fakeDbRow], appliedPromoCode: null });

      expect(execute.mock.calls[1][0] as string).toContain('INSERT');
      expect(result.lines).toHaveLength(1);
    });
  });

  describe('clearForCustomer', () => {
    it('deletes cart for customer', async () => {
      execute.mockResolvedValueOnce({ affectedRows: 1 });

      await service.clearForCustomer('abc');

      const sql = execute.mock.calls[0][0] as string;
      expect(sql).toContain('DELETE');
      expect(sql).toContain('customerId = ?');
    });
  });

  describe('input sanitization', () => {
    it('filters out items without valid productId', async () => {
      execute.mockResolvedValueOnce([]);
      execute.mockResolvedValueOnce({ affectedRows: 1 });
      execute.mockResolvedValueOnce([{ ...fakeDbRow, lines: '[]' }]);

      await service.saveForCustomer('abc', {
        lines: [
          { productId: 0, sku: 'SP001', name: 'Bad' },
          { productId: -1, sku: 'SP002', name: 'Bad2' },
          { productId: 1, sku: 'SP003', name: 'Good' },
        ],
        appliedPromoCode: null,
      });

      expect(execute).toHaveBeenCalled();
    });

    it('enforces max 50 lines', async () => {
      execute.mockResolvedValueOnce([]);
      execute.mockResolvedValueOnce({ affectedRows: 1 });
      execute.mockResolvedValueOnce([{ ...fakeDbRow, lines: '[]' }]);

      const manyLines = Array.from({ length: 100 }, (_, i) => ({
        productId: i + 1, sku: `SP${i}`, name: `Product ${i}`, category: 'X', unitType: 'cai', unitLabel: 'Cái', unitPrice: 1000, listUnitPrice: 1000, promoUnitPrice: null, minPromoQty: 0, qtyPerUnit: 1, quantity: 1, isWholesale: false, fulfillmentNote: null,
      }));

      await service.saveForCustomer('abc', { lines: manyLines, appliedPromoCode: null });

      const linesJson = JSON.parse(execute.mock.calls[1][1][1] as string);
      expect(linesJson.length).toBeLessThanOrEqual(50);
    });

    it('normalizes promoCode to uppercase', async () => {
      execute.mockResolvedValueOnce([]);
      execute.mockResolvedValueOnce({ affectedRows: 1 });
      execute.mockResolvedValueOnce([fakeDbRow]);

      await service.saveForCustomer('abc', { lines: [fakeDbRow], appliedPromoCode: '   promo20  ' });

      expect((execute.mock.calls[1][1] as unknown[])[2]).toBe('PROMO20');
    });
  });
});
