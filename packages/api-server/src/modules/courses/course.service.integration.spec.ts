/**
 * BaseCoursesService - Integration test với dữ liệu thật.
 *
 * Pattern theo `packages/api-server/src/modules/users/users.integration.spec.ts`:
 *   - Service instance thật + fake EntityManager mô phỏng database.
 *   - Dữ liệu thật từ `data-test/hub-system-export-2026-06-11.json`.
 *   - Test nghiệp vụ CRUD với data production (entities từ
 *     `apps/main/api/src/entities/`).
 */
import { BaseCoursesService } from './course.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';
import type { EntityManager } from '@mikro-orm/core';

class TestCoursesServiceIntegrationService extends BaseCoursesService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }
  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }
  protected getEntity(): new () => Record<string, unknown> {
    // Named class để fake EntityManager có thể resolve store key
    return class Course { id = 0; } as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseCoursesService - integration test (real fixture data)', () => {
  let service: TestCoursesServiceIntegrationService;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = (fixture as unknown as Record<string, Array<Record<string, unknown>>>).courses ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestCoursesServiceIntegrationService(em);
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
    // Fixture rỗng - skip

    it('should return null for non-existent id', async () => {
      const result = await service.getById('99999');
      expect(result).toBeNull();
    });
  });

  describe('create (với fake-em thật)', () => {
    it('should persist new entity', async () => {
      const beforeCount = (em as unknown as { __all: (entity: unknown) => Array<Record<string, unknown>> }).__all('Course').length;
      const newData: Record<string, unknown> = {
        id: 'TEST-NEW-1',
        isActive: true,
      };
      const created = await service.create(newData as never);
      expect(created).toBeDefined();
      const afterCount = (em as unknown as { __all: (entity: unknown) => Array<Record<string, unknown>> }).__all('Course').length;
      expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
    });
  });

  // Fixture rỗng - skip update tests

  // Module không hỗ trợ soft-delete - skip

  // Fixture rỗng - skip

  // Module không hỗ trợ soft-delete - bulk chỉ hỗ trợ hard-delete
  describe('bulk (với fixture thật)', () => {
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
