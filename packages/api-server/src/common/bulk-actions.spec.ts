/**
 * Contract tests cho `applyBulkAction` (packages/api-server/src/common/bulk-actions.ts).
 *
 * Mục tiêu: đảm bảo bulk action khớp với payload từ `api-client.bulk()`:
 *   - `{ action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive', ids: string[] }`
 *   - Server phải chấp nhận cả numeric id và CUID/string id (Users dùng CUID)
 *   - Server trả về `affected` + `message` tiếng Việt
 */
import { loadFixture } from '../data-test/fixture';
import { createFakeEntityManager } from '../data-test/fake-em';
import {
  applyBulkAction,
  isBulkAction,
  BULK_ACTIONS,
  type BulkAction,
} from './bulk-actions';

describe('bulk-actions — api-client.bulk() contract', () => {
  describe('isBulkAction', () => {
    it('true cho 5 action hợp lệ', () => {
      expect(isBulkAction('delete')).toBe(true);
      expect(isBulkAction('restore')).toBe(true);
      expect(isBulkAction('hard-delete')).toBe(true);
      expect(isBulkAction('active')).toBe(true);
      expect(isBulkAction('unactive')).toBe(true);
    });

    it('false cho action không hợp lệ', () => {
      expect(isBulkAction('whatever')).toBe(false);
      expect(isBulkAction('DELETE')).toBe(false);
      expect(isBulkAction('')).toBe(false);
    });

    it('BULK_ACTIONS chứa đúng 5 action', () => {
      expect(BULK_ACTIONS.size).toBe(5);
    });
  });

  describe('applyBulkAction — payload contract', () => {
    let em: ReturnType<typeof createFakeEntityManager>;
    const fixture = loadFixture();

    beforeAll(() => {
      em = createFakeEntityManager(fixture);
    });

    beforeEach(() => {
      em.__reset();
    });

    it('ids rỗng → affected=0 + message tiếng Việt', async () => {
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(0);
      expect(result.message).toContain('Không có bản ghi');
    });

    it('ids không có giá trị hợp lệ (empty string, CUID không tồn tại) → affected=0', async () => {
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        ['', '   '],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(0);
    });

    it('delete: soft-delete các bản ghi active', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id;
      if (!postId) return;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [postId as number],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
      expect(result.message).toContain('Đã xóa');
      expect(result.message).toContain('bài viết');
    });

    it('restore: khôi phục các bản ghi đã soft-delete', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id;
      if (!postId) return;
      // trước: delete
      await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [postId as number],
        { label: 'bài viết' },
      );
      // sau: restore
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'restore',
        [postId as number],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
      expect(result.message).toContain('Đã khôi phục');
    });

    it('active: set isActive=true cho các bản ghi', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id;
      if (!postId) return;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'active',
        [postId as number],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
      expect(result.message).toContain('kích hoạt');
    });

    it('unactive: set isActive=false', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id;
      if (!postId) return;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'unactive',
        [postId as number],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
      expect(result.message).toContain('hủy kích hoạt');
    });

    it('hard-delete: xóa vĩnh viễn', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id;
      if (!postId) return;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'hard-delete',
        [postId as number],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
      expect(result.message).toContain('vĩnh viễn');
    });

    it('chấp nhận ids là string[] (như từ api-client.bulk)', async () => {
      const postId = String((fixture.posts[0] as { id?: number | string }).id);
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [postId],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
    });

    it('chấp nhận ids là number[] (test edge case)', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id as number;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [postId],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
    });

    it('hỗn hợp numeric và string id', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id as number;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [postId, String(postId)],
        { label: 'bài viết' },
      );
      // dedupe sẽ gộp lại thành 1
      expect(result.affected).toBe(1);
    });

    it('bỏ id trùng lặp', async () => {
      const postId = (fixture.posts[0] as { id?: number | string }).id as number;
      const result = await applyBulkAction(
        em as never,
        'Post' as never,
        'delete',
        [postId, postId, postId],
        { label: 'bài viết' },
      );
      expect(result.affected).toBe(1);
    });
  });

  describe('BULK_ACTIONS — type contract', () => {
    it('BULK_ACTIONS là ReadonlySet<BulkAction>', () => {
      const actions: BulkAction[] = Array.from(BULK_ACTIONS) as BulkAction[];
      expect(actions.length).toBe(5);
    });
  });
});
