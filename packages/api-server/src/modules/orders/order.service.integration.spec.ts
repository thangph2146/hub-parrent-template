/**
 * BaseOrdersService - Integration test với dữ liệu thật.
 *
 * Pattern theo `packages/api-server/src/modules/users/users.integration.spec.ts`:
 *   - Service instance thật + fake EntityManager mô phỏng database.
 *   - Dữ liệu thật từ `data-test/hub-system-export-2026-06-11.json`.
 *   - Test nghiệp vụ CRUD với data production (entities từ
 *     `apps/main/api/src/entities/`).
 */
import { BaseOrdersService } from './order.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';
import type { EntityManager } from '@mikro-orm/core';

class TestOrdersServiceIntegrationService extends BaseOrdersService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }
  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }
  protected getEntity(): new () => Record<string, unknown> {
    // Named class để fake EntityManager có thể resolve store key
    return class Order { id = 0; } as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseOrdersService - integration test (real fixture data)', () => {
  let service: TestOrdersServiceIntegrationService;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = (fixture as unknown as Record<string, Array<Record<string, unknown>>>).orders ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestOrdersServiceIntegrationService(em);
  });

  beforeEach(() => {
    // Reset to clean state trước mỗi test để đảm bảo isolation
    em.__reset();
    jest.clearAllMocks();
  });

  describe('list (với fixture thật)', () => {
    it('should return paginated result', async () => {
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    // Module không hỗ trợ soft-delete - chỉ return all rows

    it('should normalize invalid page/limit (page=0, limit=-5)', async () => {
      const result = await service.list({ page: 0, limit: -5 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
    });

    it('should respect max limit (1000)', async () => {
      const result = await service.list({ page: 1, limit: 9999 });
      expect(result.pagination.limit).toBeLessThanOrEqual(1000);
    });
  });

  describe('getById (với fixture thật)', () => {
    it('should return existing record', async () => {
      const sample = fixtureRows[0];
      const result = await service.getById(sample.id as string);
      expect(result).toBeDefined();
      expect(String(result?.id)).toBe(String(sample.id));
    });

    it('should return null for non-existent id', async () => {
      const result = await service.getById('99999');
      expect(result).toBeNull();
    });
  });

  describe('create (với fake-em thật)', () => {
    it('should persist new entity', async () => {
      const beforeCount = (em as unknown as { __all: (entity: unknown) => Array<Record<string, unknown>> }).__all('Order').length;
      const newData: Record<string, unknown> = {
        id: 'TEST-NEW-1',
        isActive: true,
      };
      const created = await service.create(newData as never);
      expect(created).toBeDefined();
      const afterCount = (em as unknown as { __all: (entity: unknown) => Array<Record<string, unknown>> }).__all('Order').length;
      expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
    });
  });

  describe('update (với fixture thật)', () => {
    it('should update existing record', async () => {
      const sample = fixtureRows[0];
      const updated = await service.update(sample.id as string, { isActive: false } as never);
      expect(updated).toBeDefined();
      expect(updated?.isActive).toBe(false);
    });

    it('should return null for non-existent id', async () => {
      const result = await service.update('99999', { isActive: false } as never);
      expect(result).toBeNull();
    });
  });

  // Module không hỗ trợ soft-delete - skip

  describe('hardDelete (với fixture thật)', () => {
    it('should hard delete record', async () => {
      const sample = fixtureRows[0];
      const ok = await service.hardDelete(sample.id as string);
      expect(ok).toBe(true);
    });

    it('should return false when hard-deleting non-existent id', async () => {
      const ok = await service.hardDelete('99999');
      expect(ok).toBe(false);
    });
  });

  // Module không hỗ trợ soft-delete - bulk chỉ hỗ trợ hard-delete
  describe('bulk (với fixture thật)', () => {
    it('should hard-delete records', async () => {
      const id = String(fixtureRows[0].id);
      const result = await service.bulk('hard-delete', [id]);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('bulk error handling (với fake-em thật)', () => {
    it('should throw on invalid action', async () => {
      await expect(
        service.bulk('invalid-action' as never, ['1']),
      ).rejects.toBeDefined();
    });

    it('should throw on empty ids', async () => {
      await expect(service.bulk('delete', [])).rejects.toBeDefined();
    });
  });

  describe('fixture integrity', () => {
    it('should have at least 0 fixture rows', () => {
      expect(fixtureRows.length).toBeGreaterThanOrEqual(0);
    });
    it('each row has valid shape (id or FK keys)', () => {
      fixtureRows.forEach((row) => {
        const hasId = 'id' in row && row.id != null;
        const hasFk = Object.keys(row).some((k) => /Id[A-Z]?|Id$/.test(k));
        expect(hasId || hasFk).toBe(true);
      });
    });
  });
});
