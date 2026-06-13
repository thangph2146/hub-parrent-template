/**
 * BaseEventsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseEventsService } from './events.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class Event {
  id = 0;
}

class Camera {
  id = 0;
}

class TestEventsServiceIntegration extends BaseEventsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getCameraEntity(): new () => Record<string, unknown> {
    return Camera as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseEventsService — integration (fixture)', () => {
  let service: TestEventsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.events ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestEventsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang với dữ liệu fixture', async () => {
      const result = await service.list({ page: 1, limit: 10, status: 'all' });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination.total).toBe(fixtureRows.length);
    });

    it('status active loại bản ghi đã xóa', async () => {
      const activeCount = fixtureRows.filter((r) => r.deletedAt == null).length;
      const result = await service.list({ page: 1, limit: 5000, status: 'active' });
      expect(result.pagination.total).toBe(activeCount);
    });
  });

  describe('getById', () => {
    it('trả sự kiện tồn tại trong fixture', async () => {
      const first = fixtureRows[0];
      if (!first?.id) return;
      const row = await service.getById(String(first.id));
      expect(row).not.toBeNull();
      expect(row?.id).toBe(Number(first.id));
    });

    it('null với id không tồn tại', async () => {
      expect(await service.getById('999999')).toBeNull();
    });
  });

  describe('softDelete + restore', () => {
    it('soft delete rồi restore trên bản ghi active', async () => {
      const target = fixtureRows.find((r) => r.deletedAt == null && r.id != null);
      if (!target?.id) return;
      const id = String(target.id);

      expect(await service.softDelete(id)).toBe(true);
      const afterDelete = await service.getById(id);
      expect(afterDelete?.deletedAt).not.toBeNull();

      expect(await service.restore(id)).toBe(true);
      const restored = await service.getById(id);
      expect(restored?.deletedAt).toBeNull();
    });
  });

  describe('bulk', () => {
    it('bulk delete ids rỗng', async () => {
      const result = await service.bulk('delete', []);
      expect(result.affected).toBe(0);
    });
  });
});
