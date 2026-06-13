/**
 * BaseCommentsService — integration test (fixture + seed in-memory).
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseCommentsService } from './comments.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class Comment {
  id = 0;
}

class TestCommentsServiceIntegration extends BaseCommentsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getCommentEntity(): new () => Record<string, unknown> {
    return Comment as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseCommentsService — integration (fixture)', () => {
  let service: TestCommentsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    em.__store.comments.set('1', {
      id: 1,
      content: 'Bình luận kiểm thử',
      approved: false,
      deletedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      authorId: 1,
      postId: 1,
    });
    service = new TestCommentsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    em.__store.comments.set('1', {
      id: 1,
      content: 'Bình luận kiểm thử',
      approved: false,
      deletedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      authorId: 1,
      postId: 1,
    });
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('trả pagination với bản ghi seed', async () => {
      const result = await service.list({ page: 1, limit: 10, status: 'active' });
      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.content).toBe('Bình luận kiểm thử');
    });
  });

  describe('getById', () => {
    it('trả comment seed', async () => {
      const row = await service.getById('1');
      expect(row?.id).toBe(1);
    });

    it('null với id không tồn tại', async () => {
      expect(await service.getById('999999')).toBeNull();
    });
  });

  describe('approve / unapprove', () => {
    it('approve rồi unapprove', async () => {
      expect(await service.approve('1')).toBe(true);
      let row = await service.getById('1');
      expect(row?.approved).toBe(true);

      expect(await service.unapprove('1')).toBe(true);
      row = await service.getById('1');
      expect(row?.approved).toBe(false);
    });
  });

  describe('bulk', () => {
    it('bulk approve ids rỗng', async () => {
      const result = await service.bulk('approve', []);
      expect(result.affected).toBe(0);
    });
  });
});
