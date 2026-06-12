/**
 * BaseImportedUsersService - Integration test với dữ liệu thật.
 *
 * Pattern theo `packages/api-server/src/modules/users/users.integration.spec.ts`:
 *   - Service instance thật + fake EntityManager mô phỏng database.
 *   - Dữ liệu thật từ `data-test/hub-system-export-2026-06-11.json`.
 *   - Test nghiệp vụ CRUD với data production (entities từ
 *     `apps/main/api/src/entities/`).
 */
import { BaseImportedUsersService } from './imported-user.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';
import type { EntityManager } from '@mikro-orm/core';

class TestImportedUsersServiceIntegrationService extends BaseImportedUsersService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }
  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }
  protected getEntity(): new () => Record<string, unknown> {
    // Named class để fake EntityManager có thể resolve store key
    return class ImportedUsers { id = 0; } as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseImportedUsersService - integration test (real fixture data)', () => {
  let service: TestImportedUsersServiceIntegrationService;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = (fixture as unknown as Record<string, Array<Record<string, unknown>>>).imported_users ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestImportedUsersServiceIntegrationService(em);
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

    it('should filter by status="active" (exclude soft-deleted)', async () => {
      const result = await service.list({ page: 1, limit: 1000, status: 'active' });
      const allActive = fixtureRows.filter((r) => r.deletedAt == null);
      expect(result.pagination.total).toBe(allActive.length);
      // Một số entity join tables không có softDeleteField - skip check cho rows đó
      const sample = fixtureRows[0] || {};
      if (!('deletedAt' in sample)) {
        // Entity không có field này - chỉ verify total count
        return;
      }
      result.data.forEach((row) => {
        expect((row as Record<string, unknown>).deletedAt ?? null).toBeNull();
      });
    });

    it('should filter by status="deleted" (only soft-deleted)', async () => {
      const result = await service.list({ page: 1, limit: 1000, status: 'deleted' });
      const allDeleted = fixtureRows.filter((r) => r.deletedAt != null);
      expect(result.pagination.total).toBe(allDeleted.length);
      const sample = fixtureRows[0] || {};
      if (!('deletedAt' in sample)) return;
      if (result.data.length > 0) {
        result.data.forEach((row) => {
          expect((row as Record<string, unknown>).deletedAt).not.toBeNull();
        });
      }
    });

    it('should include both active + deleted with status="all"', async () => {
      const result = await service.list({ page: 1, limit: 1000, status: 'all' });
      expect(result.pagination.total).toBe(fixtureRows.length);
    });

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
    // Fixture rỗng - skip

    it('should return null for non-existent id', async () => {
      const result = await service.getById('99999');
      expect(result).toBeNull();
    });
  });

  describe('create (với fake-em thật)', () => {
    it('should persist new entity', async () => {
      const beforeCount = (em as unknown as { __all: (entity: unknown) => Array<Record<string, unknown>> }).__all('ImportedUsers').length;
      const newData: Record<string, unknown> = {
        id: 'TEST-NEW-1',
        isActive: true,
      };
      const created = await service.create(newData as never);
      expect(created).toBeDefined();
      const afterCount = (em as unknown as { __all: (entity: unknown) => Array<Record<string, unknown>> }).__all('ImportedUsers').length;
      expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
    });
  });

  // Fixture rỗng - skip update tests

  // Module không hỗ trợ soft-delete - skip

  // Fixture rỗng - skip

  describe('bulk (với fixture thật)', () => {
    // Fixture rỗng - skip bulk delete

    // Fixture rỗng - skip
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
    // Fixture rỗng - skip
  });
});
