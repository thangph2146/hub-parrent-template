import { EntityManager } from '@mikro-orm/core';
import { BaseEventCheckoutsService } from './event-checkout.service';

class TestService extends BaseEventCheckoutsService {
  protected emRef!: Partial<EntityManager>;
  setEm(em: Partial<EntityManager>) { this.emRef = em; }
  protected getEm(): EntityManager { return this.emRef as EntityManager; }
}

const fakeRows = [
  { id: 1, eventId: 10, email: 'a@t.com', fullName: 'User A', phone: '0901', checkoutTime: '2026-01-01T00:00:00.000Z', attendanceStatus: 1, attendanceMinutes: 120, hasCheckin: true, faceVerified: false, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, eventId: 10, email: 'b@t.com', fullName: 'User B', phone: null, checkoutTime: null, attendanceStatus: 0, attendanceMinutes: 0, hasCheckin: false, faceVerified: false, createdAt: null },
];

describe('BaseEventCheckoutsService', () => {
  let service: TestService;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    const em = { getConnection: jest.fn(() => ({ execute })) };
    service = new TestService();
    service.setEm(em);
  });

  describe('list', () => {
    it('returns paginated result', async () => {
      execute.mockResolvedValueOnce([{ cnt: 2 }]);
      execute.mockResolvedValueOnce(fakeRows);

      const result = await service.list({ eventId: '10', page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('passes search param as LIKE pattern', async () => {
      execute.mockResolvedValueOnce([{ cnt: 0 }]);
      execute.mockResolvedValueOnce([]);

      await service.list({ eventId: '10', page: 1, limit: 10, search: 'User' });

      expect(execute).toHaveBeenCalledTimes(2);
      const countSql = (execute.mock.calls[0][0] as string);
      expect(countSql).toContain('LIKE');
    });

    it('clamps limit to max 1000', async () => {
      execute.mockResolvedValueOnce([{ cnt: 0 }]);
      execute.mockResolvedValueOnce([]);

      await service.list({ eventId: '10', page: 1, limit: 5000 });

      expect(execute.mock.calls[1][1][1]).toBe(1000);
    });

    it('normalizes phone and dates correctly', async () => {
      execute.mockResolvedValueOnce([{ cnt: 1 }]);
      execute.mockResolvedValueOnce(fakeRows);

      const result = await service.list({ eventId: '10', page: 1, limit: 10 });
      const row1 = result.data[0];
      const row2 = result.data[1];

      expect(row1.phone).toBe('0901');
      expect(row1.checkoutTime).toBe('2026-01-01T00:00:00.000Z');
      expect(row1.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(row1.hasCheckin).toBe(true);

      expect(row2.phone).toBeNull();
      expect(row2.checkoutTime).toBeNull();
      expect(row2.createdAt).toBeNull();
      expect(row2.hasCheckin).toBe(false);
    });
  });

  describe('bulkClear', () => {
    it('updates hasCheckout=false for given ids', async () => {
      execute.mockResolvedValueOnce({ affectedRows: 2 });

      const result = await service.bulkClear(['1', '2']);

      expect(result.affected).toBe(2);
      expect(result.message).toContain('2');
      const sql = (execute.mock.calls[0][0] as string);
      expect(sql).toContain('UPDATE');
      expect(sql).toContain('hasCheckout = false');
    });

    it('returns affected=0 when ids empty', async () => {
      const result = await service.bulkClear([]);
      expect(result.affected).toBe(0);
      expect(result.message).toBe('Không có bản ghi nào');
      expect(execute).not.toHaveBeenCalled();
    });
  });
});
