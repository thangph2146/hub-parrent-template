/**
 * BasePostsService unit tests — logic admin gộp 1 service.
 *
 * Pattern: mock EntityManager + subclass binding entity classes.
 */
import { EntityManager } from '@mikro-orm/core';
import { BasePostsService } from './posts.service';

class PostEntity {
  id = 0;
  title = '';
  slug = '';
  content: unknown = {};
  excerpt: string | null = null;
  image: string | null = null;
  published = false;
  publishedAt: Date | null = null;
  eventStartAt: Date | null = null;
  eventEndAt: Date | null = null;
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt: Date | null = null;
  author: { id: number; name: string | null; email: string } = {
    id: 1,
    name: 'Author',
    email: 'author@test.com',
  };
  categories: Array<{ category: { id: number; name: string } }> = [];
  tags: Array<{ tag: { id: number; name: string } }> = [];
}

class CategoryEntity {
  id = 0;
  name = '';
  deletedAt: Date | null = null;
}

class TagEntity {
  id = 0;
  name = '';
  deletedAt: Date | null = null;
}

class PostCategoryEntity {
  post: unknown;
  category: unknown;
}

class PostTagEntity {
  post: unknown;
  tag: unknown;
}

class UserEntity {
  id = 0;
  name: string | null = null;
  email = '';
}

class TestPostsService extends BasePostsService {
  constructor(private readonly emRef: Partial<EntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as EntityManager;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return PostEntity as unknown as new () => Record<string, unknown>;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return CategoryEntity as unknown as new () => Record<string, unknown>;
  }

  protected getTagEntity(): new () => Record<string, unknown> {
    return TagEntity as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity(): new () => Record<string, unknown> {
    return PostCategoryEntity as unknown as new () => Record<string, unknown>;
  }

  protected getPostTagEntity(): new () => Record<string, unknown> {
    return PostTagEntity as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return UserEntity as unknown as new () => Record<string, unknown>;
  }
}

describe('BasePostsService', () => {
  let service: TestPostsService;
  let em: Partial<EntityManager>;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    slug: 'test-post',
    content: { type: 'doc', content: [] },
    excerpt: 'Test excerpt',
    image: null,
    published: false,
    publishedAt: null,
    eventStartAt: null,
    eventEndAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    author: { id: 1, name: 'Author', email: 'author@test.com' },
    categories: [],
    tags: [],
  };

  const mockCategory = { id: 1, name: 'Test Category', deletedAt: null };
  const mockTag = { id: 1, name: 'Test Tag', deletedAt: null };

  beforeEach(() => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      count: jest.fn(),
      getReference: jest.fn().mockImplementation((_entity, id) => ({ id })),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      getRepository: jest.fn(),
      transactional: jest.fn().mockImplementation(async (cb) => {
        const tx = {
          findOne: em.findOne,
          find: em.find,
          persist: em.persist,
          flush: em.flush,
          nativeDelete: em.nativeDelete,
          getReference: em.getReference,
        };
        return cb(tx as unknown as EntityManager);
      }),
    };
    service = new TestPostsService(em);
  });

  describe('list', () => {
    it('trả phân trang', async () => {
      (em.find as jest.Mock)
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([mockPost]);
      (em.count as jest.Mock).mockResolvedValue(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.data[0]?.title).toBe('Test Post');
    });

    it('search + status deleted', async () => {
      (em.find as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, search: 'test', status: 'deleted' });
      expect(em.find).toHaveBeenCalled();
    });

    it('rỗng khi không có bản ghi', async () => {
      (em.find as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      const result = await service.list({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('trả chi tiết kèm content', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockPost);
      const result = await service.getById('1');
      expect(result?.title).toBe('Test Post');
      expect(result?.content).toEqual({ type: 'doc', content: [] });
    });

    it('null khi không tìm thấy', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);
      expect(await service.getById('999')).toBeNull();
    });
  });

  describe('create', () => {
    it('tạo bài viết mới', async () => {
      const createdPost = { ...mockPost, id: 2, title: 'New Post' };
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.findOne as jest.Mock).mockResolvedValue(createdPost);
      (em.persist as jest.Mock).mockImplementation((entity: PostEntity) => {
        if (!entity.id) entity.id = 2;
      });

      const result = await service.create('1', {
        title: 'New Post',
        slug: 'new-post',
        content: {},
      });

      expect(em.persist).toHaveBeenCalled();
      expect(result.title).toBe('New Post');
    });

    it('tạo kèm category và tag', async () => {
      const createdPost = { ...mockPost, id: 2 };
      (em.find as jest.Mock)
        .mockResolvedValueOnce([mockCategory])
        .mockResolvedValueOnce([mockTag]);
      (em.findOne as jest.Mock).mockResolvedValue(createdPost);

      await service.create('1', {
        title: 'New Post',
        slug: 'new-post',
        content: {},
        categoryIds: ['1'],
        tagIds: ['1'],
      });

      expect(em.persist).toHaveBeenCalled();
    });

    it('ném lỗi khi category không tồn tại', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      await expect(
        service.create('1', {
          title: 'New Post',
          slug: 'new-post',
          content: {},
          categoryIds: ['999'],
        }),
      ).rejects.toThrow('Category ID không tồn tại');
    });

    it('ném lỗi khi tag không tồn tại', async () => {
      (em.find as jest.Mock)
        .mockResolvedValueOnce([mockCategory])
        .mockResolvedValueOnce([]);
      await expect(
        service.create('1', {
          title: 'New Post',
          slug: 'new-post',
          content: {},
          categoryIds: ['1'],
          tagIds: ['999'],
        }),
      ).rejects.toThrow('Tag ID không tồn tại');
    });
  });

  describe('update', () => {
    it('cập nhật title', async () => {
      const existingPost = { ...mockPost };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce({ ...existingPost, title: 'Updated Title' });

      const result = await service.update('1', { title: 'Updated Title' });
      expect(result?.title).toBe('Updated Title');
    });

    it('null khi không tìm thấy', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);
      expect(await service.update('999', { title: 'X' })).toBeNull();
    });

    it('ném lỗi slug trùng', async () => {
      const existingPost = { ...mockPost };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce({ id: 2, slug: 'taken' });

      await expect(service.update('1', { slug: 'taken' })).rejects.toThrow(
        'Slug đã tồn tại',
      );
    });

    it('cập nhật categories', async () => {
      const existingPost = { ...mockPost };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(existingPost);
      (em.find as jest.Mock).mockResolvedValue([mockCategory]);

      await service.update('1', { categoryIds: ['1'] });
      expect(em.nativeDelete).toHaveBeenCalled();
    });

    it('cập nhật author', async () => {
      const existingPost = { ...mockPost };
      const author = { id: 2, name: 'New Author', email: 'a@b.com' };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(author)
        .mockResolvedValueOnce(existingPost);

      await service.update('1', { authorId: '2' });
      expect(em.findOne).toHaveBeenCalled();
    });

    it('ném lỗi author không tồn tại', async () => {
      const existingPost = { ...mockPost };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(null);

      await expect(service.update('1', { authorId: '999' })).rejects.toThrow(
        'Tác giả không tồn tại',
      );
    });

    it('ném lỗi ngày không hợp lệ', async () => {
      const existingPost = { ...mockPost };
      (em.findOne as jest.Mock).mockResolvedValueOnce(existingPost);

      await expect(
        service.update('1', { publishedAt: 'invalid-date' }),
      ).rejects.toThrow('Giá trị publishedAt không hợp lệ');
    });
  });

  describe('softDelete / restore / hardDelete', () => {
    it('softDelete thành công', async () => {
      const post = { ...mockPost, deletedAt: null };
      (em.findOne as jest.Mock).mockResolvedValue(post);
      expect(await service.softDelete('1')).toBe(true);
      expect(post.deletedAt).not.toBeNull();
    });

    it('softDelete false khi đã xóa', async () => {
      const post = { ...mockPost, deletedAt: new Date() };
      (em.findOne as jest.Mock).mockResolvedValue(post);
      expect(await service.softDelete('1')).toBe(false);
    });

    it('restore thành công', async () => {
      const post = { ...mockPost, deletedAt: new Date() };
      (em.findOne as jest.Mock).mockResolvedValue(post);
      expect(await service.restore('1')).toBe(true);
      expect(post.deletedAt).toBeNull();
    });

    it('hardDelete thành công', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockPost);
      expect(await service.hardDelete('1')).toBe(true);
      expect(em.remove).toHaveBeenCalled();
    });
  });

  describe('bulk', () => {
    it('bulk delete', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(2);
      const result = await service.bulk('delete', ['1', '2']);
      expect(result.affected).toBe(2);
      expect(result.message).toContain('2 bài viết');
    });

    it('bulk restore', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(1);
      const result = await service.bulk('restore', ['1']);
      expect(result.affected).toBe(1);
    });

    it('bulk hard-delete', async () => {
      (em.nativeDelete as jest.Mock).mockResolvedValue(2);
      const result = await service.bulk('hard-delete', ['1', '2']);
      expect(result.affected).toBe(2);
    });

    it('ids rỗng', async () => {
      const result = await service.bulk('delete', []);
      expect(result.affected).toBe(0);
    });
  });

  describe('bulkSetCategories / bulkClearImages', () => {
    it('replace categories', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockCategory]);
      (em.findOne as jest.Mock).mockResolvedValue({ id: 1, deletedAt: null });

      const result = await service.bulkSetCategories(['1'], ['1'], 'replace');
      expect(result.affected).toBe(1);
    });

    it('add categories', async () => {
      (em.find as jest.Mock)
        .mockResolvedValueOnce([mockCategory])
        .mockResolvedValueOnce([]);
      (em.findOne as jest.Mock).mockResolvedValue({ id: 1, deletedAt: null });

      const result = await service.bulkSetCategories(['1'], ['1'], 'add');
      expect(result.affected).toBe(1);
    });

    it('bulkSetCategories ids rỗng', async () => {
      const result = await service.bulkSetCategories([], ['1']);
      expect(result.affected).toBe(0);
    });

    it('bulkClearImages', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(2);
      const result = await service.bulkClearImages(['1', '2']);
      expect(result.affected).toBe(2);
    });
  });

  describe('getOptions / getDatesWithPosts', () => {
    it('getOptions qua repository', async () => {
      const mockRepo = {
        find: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Post' }]),
      };
      (em.getRepository as jest.Mock).mockReturnValue(mockRepo);

      const result = await service.getOptions('title', 'test', 10);
      expect(result).toHaveLength(1);
    });

    it('getDatesWithPosts trả ngày đã sort', async () => {
      (em.find as jest.Mock).mockResolvedValue([
        { publishedAt: new Date('2024-01-02'), createdAt: new Date('2024-01-02') },
        { publishedAt: new Date('2024-01-01'), createdAt: new Date('2024-01-01') },
      ]);

      const result = await service.getDatesWithPosts();
      expect(result).toEqual(['2024-01-01', '2024-01-02']);
    });
  });
});
