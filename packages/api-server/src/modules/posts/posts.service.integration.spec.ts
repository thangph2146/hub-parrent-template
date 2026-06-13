/**
 * BasePostsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BasePostsService } from './posts.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class Post {
  id = 0;
}

class Category {
  id = 0;
}

class Tag {
  id = 0;
}

class PostCategory {
  id = 0;
}

class PostTag {
  id = 0;
}

class User {
  id = 0;
}

class TestPostsServiceIntegration extends BasePostsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getTagEntity(): new () => Record<string, unknown> {
    return Tag as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity(): new () => Record<string, unknown> {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }

  protected getPostTagEntity(): new () => Record<string, unknown> {
    return PostTag as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }
}

describe('BasePostsService — integration (fixture)', () => {
  let service: TestPostsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.posts ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestPostsServiceIntegration(em);
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
    it('trả bài viết tồn tại trong fixture', async () => {
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

  describe('getDatesWithPosts', () => {
    it('trả mảng ngày không rỗng khi có posts', async () => {
      if (fixtureRows.length === 0) return;
      const dates = await service.getDatesWithPosts();
      expect(Array.isArray(dates)).toBe(true);
      expect(dates.length).toBeGreaterThan(0);
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]! >= dates[i - 1]!).toBe(true);
      }
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
