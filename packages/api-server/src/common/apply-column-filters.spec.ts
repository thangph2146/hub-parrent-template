/**
 * Contract tests cho `buildStandardAdminWhere`.
 *
 * Mục tiêu: đảm bảo filter contract mà `api-client.buildAdminListQuery()`
 * gửi (dạng `filter[column]=value`) được `parseListQuery` map vào `filters`
 * object, sau đó service truyền cho `buildStandardAdminWhere` sẽ dựng đúng
 * WHERE clause cho MikroORM.
 */
import { loadFixture } from '../data-test/fixture';
import { createFakeEntityManager } from '../data-test/fake-em';
import {
  buildStandardAdminWhere,
  type AdminColumnFiltersConfig,
} from './apply-column-filters';

describe('buildStandardAdminWhere — admin list filter contract', () => {
  describe('soft-delete status', () => {
    it('status="active" → deletedAt: null', () => {
      const where = buildStandardAdminWhere(
        {},
        {},
        'active',
        { softDeleteField: 'deletedAt' },
      );
      expect(where.deletedAt).toBeNull();
    });

    it('status="deleted" → deletedAt: { $ne: null }', () => {
      const where = buildStandardAdminWhere(
        {},
        {},
        'deleted',
        { softDeleteField: 'deletedAt' },
      );
      expect(where.deletedAt).toEqual({ $ne: null });
    });

    it('status="all" → bỏ soft-delete filter', () => {
      const where = buildStandardAdminWhere(
        {},
        {},
        'all',
        { softDeleteField: 'deletedAt' },
      );
      expect(where.deletedAt).toBeUndefined();
    });

    it('softDeleteField mặc định là deletedAt', () => {
      const where = buildStandardAdminWhere({}, {}, 'active');
      expect(where.deletedAt).toBeNull();
    });
  });

  describe('text type', () => {
    it('builds { $like: %term% }', () => {
      const config: AdminColumnFiltersConfig = {
        title: { type: 'text', path: 'title' },
      };
      const where = buildStandardAdminWhere(
        { title: 'hello' },
        config,
        'active',
      );
      expect(where.title).toEqual({ $like: '%hello%' });
    });
  });

  describe('exact type', () => {
    it('set exact value', () => {
      const config: AdminColumnFiltersConfig = {
        status: { type: 'exact', path: 'status' },
      };
      const where = buildStandardAdminWhere(
        { status: 'active' },
        config,
        'all',
      );
      expect(where.status).toBe('active');
    });
  });

  describe('number type', () => {
    it('parses numeric string sang number', () => {
      const config: AdminColumnFiltersConfig = {
        count: { type: 'number', path: 'count' },
      };
      const where = buildStandardAdminWhere(
        { count: '42' },
        config,
        'all',
      );
      expect(where.count).toBe(42);
    });

    it('NaN → bỏ filter (không set)', () => {
      const config: AdminColumnFiltersConfig = {
        count: { type: 'number', path: 'count' },
      };
      const where = buildStandardAdminWhere(
        { count: 'abc' },
        config,
        'all',
      );
      expect(where.count).toBeUndefined();
    });
  });

  describe('boolean type', () => {
    it('"true" → true', () => {
      const config: AdminColumnFiltersConfig = {
        active: { type: 'boolean', path: 'isActive' },
      };
      const where = buildStandardAdminWhere(
        { active: 'true' },
        config,
        'all',
      );
      expect(where.isActive).toBe(true);
    });

    it('"false" → false', () => {
      const config: AdminColumnFiltersConfig = {
        active: { type: 'boolean', path: 'isActive' },
      };
      const where = buildStandardAdminWhere(
        { active: 'false' },
        config,
        'all',
      );
      expect(where.isActive).toBe(false);
    });

    it('other value (vd "1") → bỏ filter (chỉ chấp nhận "true"/"false")', () => {
      const config: AdminColumnFiltersConfig = {
        active: { type: 'boolean', path: 'isActive' },
      };
      const where = buildStandardAdminWhere(
        { active: '1' },
        config,
        'all',
      );
      expect(where.isActive).toBeUndefined();
    });
  });

  describe('entityId type', () => {
    it('numeric string → number', () => {
      const config: AdminColumnFiltersConfig = {
        author: { type: 'entityId', path: 'authorId' },
      };
      const where = buildStandardAdminWhere(
        { author: '5' },
        config,
        'all',
      );
      expect(where.authorId).toBe(5);
    });

    it('non-numeric (CUID) → bỏ filter', () => {
      const config: AdminColumnFiltersConfig = {
        author: { type: 'entityId', path: 'authorId' },
      };
      const where = buildStandardAdminWhere(
        { author: 'cm123abc' },
        config,
        'all',
      );
      expect(where.authorId).toBeUndefined();
    });
  });

  describe('dateRange type', () => {
    it('1 date → $gte', () => {
      const config: AdminColumnFiltersConfig = {
        date: { type: 'dateRange', path: 'createdAt' },
      };
      const where = buildStandardAdminWhere(
        { date: '2025-01-01' },
        config,
        'all',
      );
      expect(where.createdAt).toEqual({ $gte: new Date('2025-01-01') });
    });

    it('2 dates comma-separated → $gte + $lte', () => {
      const config: AdminColumnFiltersConfig = {
        date: { type: 'dateRange', path: 'createdAt' },
      };
      const where = buildStandardAdminWhere(
        { date: '2025-01-01,2025-12-31' },
        config,
        'all',
      );
      expect(where.createdAt).toEqual({
        $gte: new Date('2025-01-01'),
        $lte: new Date('2025-12-31'),
      });
    });
  });

  describe('unknown filter column → bỏ qua (không throw)', () => {
    it('filter không có trong config → bỏ', () => {
      const config: AdminColumnFiltersConfig = {
        title: { type: 'text', path: 'title' },
      };
      const where = buildStandardAdminWhere(
        { unknownColumn: 'x', title: 'hello' },
        config,
        'all',
      );
      expect((where as Record<string, unknown>).unknownColumn).toBeUndefined();
      expect(where.title).toEqual({ $like: '%hello%' });
    });
  });

  describe('empty filter value → bỏ qua', () => {
    it('filter value rỗng hoặc null → bỏ', () => {
      const config: AdminColumnFiltersConfig = {
        title: { type: 'text', path: 'title' },
      };
      const where = buildStandardAdminWhere(
        { title: '', author: null as unknown as string },
        config,
        'all',
      );
      expect(where.title).toBeUndefined();
    });
  });

  describe('multiple filters cùng lúc', () => {
    it('build nhiều field trong where', () => {
      const config: AdminColumnFiltersConfig = {
        title: { type: 'text', path: 'title' },
        published: { type: 'boolean', path: 'published' },
        author: { type: 'entityId', path: 'authorId' },
      };
      const where = buildStandardAdminWhere(
        { title: 'hello', published: 'true', author: '7' },
        config,
        'active',
      );
      expect(where.title).toEqual({ $like: '%hello%' });
      expect(where.published).toBe(true);
      expect(where.authorId).toBe(7);
      expect(where.deletedAt).toBeNull();
    });
  });

  describe('integration với fixture data', () => {
    it('em.find tìm đúng record khi áp filter từ buildStandardAdminWhere', async () => {
      const fixture = loadFixture();
      const em = createFakeEntityManager(fixture);
      em.__reset();
      const postId = (fixture.posts[0] as { id?: number | string }).id;
      if (!postId) return;
      const where = buildStandardAdminWhere(
        { id: String(postId) },
        { id: { type: 'entityId', path: 'id' } },
        'all',
      );
      const found = await em.find('Post', where as never);
      expect(found.length).toBeGreaterThan(0);
      expect(found.some((p: Record<string, unknown>) => p.id === postId)).toBe(true);
    });

    it('em.find với status="active" chỉ trả về bản ghi chưa soft-delete', async () => {
      const fixture = loadFixture();
      const em = createFakeEntityManager(fixture);
      em.__reset();
      const where = buildStandardAdminWhere(
        {},
        {},
        'active',
        { softDeleteField: 'deletedAt' },
      );
      const found = await em.find('Post', where as never);
      // tất cả bản ghi trả về phải có deletedAt == null
      for (const row of found) {
        expect((row as Record<string, unknown>).deletedAt).toBeNull();
      }
    });
  });
});
