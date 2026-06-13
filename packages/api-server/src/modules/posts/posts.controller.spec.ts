/**
 * Controller spec — BasePostsController (admin HTTP, gộp 1 lớp).
 *
 * Validate route metadata + envelope response khớp `packages/api-client`.
 * Không spin Nest app: mock service + fake Express `res`.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BasePostsController } from './posts.controller';
import type { IPostsControllerService, PostRowDto } from './posts.service';

type RouteInfo = { method: string; path: string; handler: string };
type ResponseMock = {
  statusCode: number;
  payload: unknown;
  status: jest.Mock<ResponseMock, [number]>;
  json: jest.Mock<ResponseMock, [unknown]>;
};

function createResponseMock(): ResponseMock {
  const response: ResponseMock = {
    statusCode: 200,
    payload: undefined,
    status: jest.fn((code: number): ResponseMock => {
      response.statusCode = code;
      return response;
    }),
    json: jest.fn((payload: unknown): ResponseMock => {
      response.payload = payload;
      return response;
    }),
  };
  return response;
}

function getRoutes(ctrl: object): RouteInfo[] {
  const out: RouteInfo[] = [];
  const verbMap: Record<number, string> = {
    0: 'GET',
    1: 'POST',
    2: 'PUT',
    3: 'DELETE',
    4: 'PATCH',
  };
  const seen = new Set<string>();
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor' || seen.has(name)) continue;
      seen.add(name);
      const handler = Object.getOwnPropertyDescriptor(proto, name)?.value as
        | ((...args: unknown[]) => unknown)
        | undefined;
      if (typeof handler !== 'function') continue;
      const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as
        | string
        | string[]
        | undefined;
      if (typeof verb !== 'number' || pathMeta == null || !(verb in verbMap)) continue;
      const normalized = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta;
      out.push({
        method: verbMap[verb],
        path: normalized === '' ? '/' : `/${String(normalized).replace(/^\//, '')}`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

const sampleRow: PostRowDto = {
  id: 1,
  title: 'Bài viết mẫu',
  slug: 'bai-viet-mau',
  excerpt: null,
  image: null,
  published: true,
  publishedAt: '2026-01-01T00:00:00.000Z',
  eventStartAt: null,
  eventEndAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
  author: { id: 7, name: 'Admin', email: 'admin@example.com' },
  categories: [],
  tags: [],
};

function createServiceMock(): jest.Mocked<IPostsControllerService> {
  return {
    list: jest.fn(),
    getOptions: jest.fn(),
    getDatesWithPosts: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    bulkSetCategories: jest.fn(),
    bulkClearImages: jest.fn(),
    bulk: jest.fn(),
    hardDelete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };
}

describe('BasePostsController — admin client contract', () => {
  let controller: BasePostsController;
  let service: jest.Mocked<IPostsControllerService>;
  const headers = { 'x-user-id': '7' };

  beforeEach(() => {
    service = createServiceMock();
    controller = new BasePostsController(service);
  });

  describe('route metadata', () => {
    it('exposes handlers mà api-client posts admin dùng', () => {
      const handlers = new Set(getRoutes(controller).map((r) => r.handler));
      for (const h of [
        'list',
        'options',
        'getDatesWithPosts',
        'getById',
        'create',
        'update',
        'bulk',
        'softDelete',
        'restore',
        'hardDelete',
      ]) {
        expect(handlers.has(h)).toBe(true);
      }
    });

    it('options và dates-with-posts là GET tĩnh (trước :id)', () => {
      const routes = getRoutes(controller);
      expect(routes.find((r) => r.handler === 'options')).toEqual(
        expect.objectContaining({ method: 'GET', path: '/options' }),
      );
      expect(routes.find((r) => r.handler === 'getDatesWithPosts')).toEqual(
        expect.objectContaining({ method: 'GET', path: '/dates-with-posts' }),
      );
    });
  });

  describe('list', () => {
    it('401 khi thiếu X-User-Id', async () => {
      const res = createResponseMock();
      await controller.list(res as never, {}, undefined, undefined, undefined, undefined, {});
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('200 + pagination envelope', async () => {
      service.list.mockResolvedValue({
        data: [sampleRow],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      const res = createResponseMock();
      await controller.list(res as never, headers, '1', '10', undefined, undefined, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            data: [sampleRow],
            pagination: expect.objectContaining({ total: 1 }),
          }),
        }),
      );
    });
  });

  describe('options', () => {
    it('401 khi thiếu header', async () => {
      const res = createResponseMock();
      await controller.options(res as never, {}, 'title');
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('gọi getOptions và trả success', async () => {
      service.getOptions.mockResolvedValue([{ label: 'A', value: '1' }]);
      const res = createResponseMock();
      await controller.options(res as never, headers, 'title', 'a', '20');
      expect(service.getOptions).toHaveBeenCalledWith('title', 'a', 20);
      expect(res.payload).toEqual(
        expect.objectContaining({ success: true, data: [{ label: 'A', value: '1' }] }),
      );
    });
  });

  describe('getDatesWithPosts', () => {
    it('trả danh sách ngày', async () => {
      service.getDatesWithPosts.mockResolvedValue(['2026-01-01', '2026-01-02']);
      const res = createResponseMock();
      await controller.getDatesWithPosts(res as never, headers);
      expect(res.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: { dates: ['2026-01-01', '2026-01-02'] },
        }),
      );
    });
  });

  describe('getById', () => {
    it('404 khi không tìm thấy', async () => {
      service.getById.mockResolvedValue(null);
      const res = createResponseMock();
      await controller.getById(res as never, headers, '999');
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 khi có bản ghi', async () => {
      service.getById.mockResolvedValue({ ...sampleRow, content: {} });
      const res = createResponseMock();
      await controller.getById(res as never, headers, '1');
      expect(res.payload).toEqual(
        expect.objectContaining({ success: true, data: expect.objectContaining({ id: 1 }) }),
      );
    });
  });

  describe('create', () => {
    it('400 khi thiếu title hoặc slug', async () => {
      const res = createResponseMock();
      await controller.create(res as never, headers, { title: '  ', slug: 'ok' });
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 khi hợp lệ', async () => {
      service.create.mockResolvedValue(sampleRow);
      const res = createResponseMock();
      await controller.create(res as never, headers, {
        title: 'Mới',
        slug: 'moi',
        content: {},
        categoryIds: ['1'],
        tagIds: ['2'],
      });
      expect(service.create).toHaveBeenCalledWith(
        '7',
        expect.objectContaining({ title: 'Mới', slug: 'moi', categoryIds: ['1'], tagIds: ['2'] }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('404 khi service trả null', async () => {
      service.update.mockResolvedValue(null);
      const res = createResponseMock();
      await controller.update(res as never, headers, '1', { title: 'Sửa' });
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 khi cập nhật thành công', async () => {
      service.update.mockResolvedValue({ ...sampleRow, title: 'Sửa' });
      const res = createResponseMock();
      await controller.update(res as never, headers, '1', { title: 'Sửa' });
      expect(res.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ title: 'Sửa' }),
        }),
      );
    });

    it('400 khi lỗi nghiệp vụ (slug không hợp lệ)', async () => {
      service.update.mockRejectedValue(new Error('Slug không hợp lệ'));
      const res = createResponseMock();
      await controller.update(res as never, headers, '1', { slug: 'bad' });
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('500 khi lỗi không có message', async () => {
      service.update.mockRejectedValue({});
      const res = createResponseMock();
      await controller.update(res as never, headers, '1', { title: 'X' });
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('bulk', () => {
    it('400 với action không hợp lệ', async () => {
      const res = createResponseMock();
      await controller.bulk(res as never, headers, { action: 'noop', ids: ['1'] });
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('set-categories gọi bulkSetCategories', async () => {
      service.bulkSetCategories.mockResolvedValue({ affected: 2, message: 'ok' });
      const res = createResponseMock();
      await controller.bulk(res as never, headers, {
        action: 'set-categories',
        ids: ['1', '2'],
        categoryIds: ['3'],
        mode: 'add',
      });
      expect(service.bulkSetCategories).toHaveBeenCalledWith(['1', '2'], ['3'], 'add');
      expect(res.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ affected: 2 }),
        }),
      );
    });

    it('clear-images gọi bulkClearImages', async () => {
      service.bulkClearImages.mockResolvedValue({ affected: 1, message: 'cleared' });
      const res = createResponseMock();
      await controller.bulk(res as never, headers, {
        action: 'clear-images',
        ids: ['1'],
      });
      expect(service.bulkClearImages).toHaveBeenCalledWith(['1']);
    });

    it('delete ủy quyền bulk CRUD chuẩn', async () => {
      service.bulk.mockResolvedValue({ affected: 1, message: 'Đã xóa 1 bài viết' });
      const res = createResponseMock();
      await controller.bulk(res as never, headers, { action: 'delete', ids: ['1'] });
      expect(service.bulk).toHaveBeenCalledWith('delete', ['1']);
    });
  });

  describe('softDelete / restore / hardDelete', () => {
    it('softDelete 404 khi thất bại', async () => {
      service.softDelete.mockResolvedValue(false);
      const res = createResponseMock();
      await controller.softDelete(res as never, headers, '1');
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('softDelete 200 khi thành công', async () => {
      service.softDelete.mockResolvedValue(true);
      const res = createResponseMock();
      await controller.softDelete(res as never, headers, '1');
      expect(res.payload).toEqual(expect.objectContaining({ success: true }));
    });

    it('restore 404 khi thất bại', async () => {
      service.restore.mockResolvedValue(false);
      const res = createResponseMock();
      await controller.restore(res as never, headers, '1');
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('hardDelete 404 khi không tìm thấy', async () => {
      service.hardDelete.mockResolvedValue(false);
      const res = createResponseMock();
      await controller.hardDelete(res as never, headers, '1');
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('hardDelete 200 khi thành công', async () => {
      service.hardDelete.mockResolvedValue(true);
      const res = createResponseMock();
      await controller.hardDelete(res as never, headers, '1');
      expect(res.payload).toEqual(expect.objectContaining({ success: true }));
    });
  });
});
