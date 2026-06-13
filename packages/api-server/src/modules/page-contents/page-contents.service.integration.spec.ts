/**
 * BasePageContentsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BasePageContentsService } from './page-contents.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class PageContent {
  id = 0;
}

class TestPageContentsServiceIntegration extends BasePageContentsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getPageContentEntity(): new () => Record<string, unknown> {
    return PageContent as unknown as new () => Record<string, unknown>;
  }
}

describe('BasePageContentsService — integration (fixture)', () => {
  let service: TestPageContentsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.page_contents ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestPageContentsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang với dữ liệu fixture', async () => {
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(fixtureRows.length);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getById', () => {
    it('trả page content tồn tại trong fixture', async () => {
      const first = fixtureRows.find((r) => r.id != null);
      if (!first?.id) return;
      const row = await service.getById(String(first.id));
      expect(row).not.toBeNull();
      expect(row?.id).toBe(Number(first.id));
    });

    it('null với id không tồn tại', async () => {
      expect(await service.getById('999999')).toBeNull();
    });
  });

  describe('getByKey', () => {
    it('trả mảng theo pageKey có trong fixture', async () => {
      const sample = fixtureRows.find((r) => r.pageKey != null);
      if (!sample?.pageKey) return;
      const rows = await service.getByKey(String(sample.pageKey));
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
