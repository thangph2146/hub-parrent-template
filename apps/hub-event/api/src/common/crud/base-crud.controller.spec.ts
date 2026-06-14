/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Contract tests cho `BaseCrudController`.
 *
 * Mục tiêu:
 *   - Validate HTTP/controller contract mà `packages/api-client` đang dùng.
 *   - Kiểm tra envelope `{ success, message, error, data }`.
 *   - Kiểm tra query parsing `filter[column]`.
 *   - Kiểm tra hard-delete alias `/:id/hard-delete`.
 *
 * Test này không spin Nest app/full HTTP server; chỉ gọi trực tiếp method của
 * controller và đọc metadata decorator bằng `Reflect`. Cách này đủ để phát
 * hiện contract mismatch giữa `api-client` và `api-server`.
 */
import 'reflect-metadata';
import {
  BadRequestException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import {
  BaseCrudController,
  type ICrudControllerService,
} from './base-crud.controller';
import type {
  BulkOperationResult,
  ListCrudParams,
  PaginatedResult,
  CrudRowDto,
} from './crud.types';
import { loadFixture } from '../../data-test/fixture';

class TestRow implements CrudRowDto {
  id!: number;
  title = '';
  deletedAt: string | null = null;
  createdAt = new Date().toISOString();
  updatedAt = new Date().toISOString();
}

class TestController extends BaseCrudController<TestRow> {
  constructor(service: ICrudControllerService<TestRow>) {
    super(service, 'tests');
  }
}

describe('BaseCrudController — client contract', () => {
  let controller: TestController;
  let service: jest.Mocked<ICrudControllerService<TestRow>>;
  const fixture = loadFixture();
  const samplePost = fixture.posts[0] ?? {
    id: 1,
    title: 'fixture post',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleRow: TestRow = {
    id: Number(samplePost.id ?? 1),
    title: String(samplePost.title ?? 'fixture post'),
    deletedAt:
      samplePost.deletedAt == null ? null : String(samplePost.deletedAt),
    createdAt: String(samplePost.createdAt ?? new Date().toISOString()),
    updatedAt: String(samplePost.updatedAt ?? new Date().toISOString()),
  };

  beforeEach(() => {
    service = {
      list: jest.fn(async () => ({
        data: [sampleRow],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
      getById: jest.fn(async (id) => ({ ...sampleRow, id: Number(id) })),
      create: jest.fn(async (data) => ({ ...sampleRow, ...data } as TestRow)),
      update: jest.fn(async (id, data) => ({ ...sampleRow, id: Number(id), ...data } as TestRow)),
      softDelete: jest.fn(async () => true),
      restore: jest.fn(async () => true),
      hardDelete: jest.fn(async () => true),
      bulk: jest.fn(async (_action, ids) => ({
        success: ids.length,
        failed: 0,
        total: ids.length,
        errors: [],
        message: 'ok',
      })),
    };
    controller = new TestController(service);
  });

  function normalizePath(path: string | string[] | undefined): string {
    if (Array.isArray(path)) return normalizePath(path[0]);
    if (path == null || path === '') return '/';
    return String(path).startsWith('/') ? String(path) : `/${String(path)}`;
  }

  function getRouteMeta(handlerName: keyof TestController): {
    method: RequestMethod | undefined;
    path: string;
  } {
    const proto = Object.getPrototypeOf(controller) as Record<string, unknown>;
    const handler = proto[handlerName as string] as object | undefined;
    return {
      method: handler
        ? (Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined)
        : undefined,
      path: normalizePath(
        handler
          ? (Reflect.getMetadata(PATH_METADATA, handler) as string | string[] | undefined)
          : undefined,
      ),
    };
  }

  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('list returns success envelope with paginated payload', async () => {
      const result = await controller.list({});
      expect(result).toEqual({
        success: true,
        message: expect.any(String),
        error: null,
        data: {
          data: [sampleRow],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      });
    });

    it('getById returns success envelope with row in data', async () => {
      const result = await controller.getById('1');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect((result.data as TestRow).id).toBe(1);
    });

    it('create returns success envelope', async () => {
      const result = await controller.create({ title: 'new' });
      expect(result.success).toBe(true);
      expect((result.data as TestRow).title).toBe('new');
    });

    it('update returns success envelope', async () => {
      const result = await controller.update('1', { title: 'updated' });
      expect(result.success).toBe(true);
      expect((result.data as TestRow).title).toBe('updated');
    });

    it('softDelete returns success envelope with nested success/message payload', async () => {
      const result = await controller.softDelete('1');
      expect(result).toEqual({
        success: true,
        message: expect.any(String),
        error: null,
        data: { success: true, message: 'Đã xóa bản ghi' },
      });
    });

    it('restore returns success envelope with nested success/message payload', async () => {
      const result = await controller.restore('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: 'Đã khôi phục bản ghi' });
    });

    it('hardDelete returns success envelope', async () => {
      const result = await controller.hardDelete('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: 'Đã xóa vĩnh viễn bản ghi' });
    });

    it('hardDeleteAlias returns same envelope', async () => {
      const result = await controller.hardDeleteAlias('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: 'Đã xóa vĩnh viễn bản ghi' });
    });

    it('bulk returns success envelope with BulkOperationResult', async () => {
      const result = await controller.bulk({ action: 'delete', ids: ['1', '2'] });
      expect(result.success).toBe(true);
      const data = result.data as BulkOperationResult;
      expect(data.total).toBe(2);
      expect(data.failed).toBe(0);
    });
  });

  describe('route metadata (api-client method → HTTP verb/path)', () => {
    it('list: GET /', () => {
      const meta = getRouteMeta('list');
      expect(meta.method).toBe(RequestMethod.GET);
      expect(meta.path).toBe('/');
    });

    it('getById: GET /:id', () => {
      const meta = getRouteMeta('getById');
      expect(meta.method).toBe(RequestMethod.GET);
      expect(meta.path).toBe('/:id');
    });

    it('create: POST /', () => {
      const meta = getRouteMeta('create');
      expect(meta.method).toBe(RequestMethod.POST);
      expect(meta.path).toBe('/');
    });

    it('update: PUT /:id', () => {
      const meta = getRouteMeta('update');
      expect(meta.method).toBe(RequestMethod.PUT);
      expect(meta.path).toBe('/:id');
    });

    it('softDelete: DELETE /:id', () => {
      const meta = getRouteMeta('softDelete');
      expect(meta.method).toBe(RequestMethod.DELETE);
      expect(meta.path).toBe('/:id');
    });

    it('restore: POST /:id/restore', () => {
      const meta = getRouteMeta('restore');
      expect(meta.method).toBe(RequestMethod.POST);
      expect(meta.path).toBe('/:id/restore');
    });

    it('hardDelete: DELETE /:id/hard', () => {
      const meta = getRouteMeta('hardDelete');
      expect(meta.method).toBe(RequestMethod.DELETE);
      expect(meta.path).toBe('/:id/hard');
    });

    it('hardDeleteAlias: DELETE /:id/hard-delete — khớp api-client.purge()', () => {
      const meta = getRouteMeta('hardDeleteAlias');
      expect(meta.method).toBe(RequestMethod.DELETE);
      expect(meta.path).toBe('/:id/hard-delete');
    });

    it('bulk: POST /bulk', () => {
      const meta = getRouteMeta('bulk');
      expect(meta.method).toBe(RequestMethod.POST);
      expect(meta.path).toBe('/bulk');
    });
  });

  describe('query contract (api-client.buildAdminListQuery)', () => {
    it('maps page/limit/search/status sang ListCrudParams', async () => {
      await controller.list({ page: '2', limit: '25', search: 'foo', status: 'deleted' });
      expect(service.list).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
        search: 'foo',
        status: 'deleted',
        filters: {},
      });
    });

    it('maps filter[column] sang filters object', async () => {
      await controller.list({
        'filter[published]': 'true',
        'filter[authorId]': '5',
      });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: {
          published: 'true',
          authorId: '5',
        },
      });
    });

    it('status invalid → fallback active', async () => {
      await controller.list({ status: 'invalid' });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: {},
      });
    });

    it('bỏ qua filter rỗng', async () => {
      await controller.list({
        'filter[published]': '',
        'filter[authorId]': '5',
      });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: { authorId: '5' },
      });
    });
  });

  describe('error contract', () => {
    it('invalid id throws BadRequestException', async () => {
      await expect(controller.getById('0')).rejects.toThrow(BadRequestException);
      await expect(controller.getById('abc')).rejects.toThrow(BadRequestException);
      await expect(controller.getById('')).rejects.toThrow(BadRequestException);
    });

    it('getById not-found throws NotFoundException với error envelope', async () => {
      service.getById.mockResolvedValueOnce(null);
      try {
        await controller.getById('1');
        throw new Error('expected NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        const body = (error as NotFoundException).getResponse() as {
          success: boolean;
          error: string;
          message: string;
        };
        expect(body.success).toBe(false);
        expect(typeof body.error).toBe('string');
        expect(typeof body.message).toBe('string');
      }
    });

    it('update not-found throws NotFoundException', async () => {
      service.update.mockResolvedValueOnce(null);
      await expect(controller.update('1', { title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('softDelete not-found throws NotFoundException', async () => {
      service.softDelete.mockResolvedValueOnce(false);
      await expect(controller.softDelete('1')).rejects.toThrow(NotFoundException);
    });

    it('restore not-found throws NotFoundException', async () => {
      service.restore.mockResolvedValueOnce(false);
      await expect(controller.restore('1')).rejects.toThrow(NotFoundException);
    });

    it('hardDelete not-found throws NotFoundException', async () => {
      service.hardDelete.mockResolvedValueOnce(false);
      await expect(controller.hardDelete('1')).rejects.toThrow(NotFoundException);
    });

    it('hardDeleteAlias not-found throws NotFoundException', async () => {
      service.hardDelete.mockResolvedValueOnce(false);
      await expect(controller.hardDeleteAlias('1')).rejects.toThrow(NotFoundException);
    });

    it('bulk invalid action throws BadRequestException', async () => {
      await expect(controller.bulk({ action: 'invalid', ids: ['1'] })).rejects.toThrow(BadRequestException);
    });

    it('bulk empty ids throws BadRequestException', async () => {
      await expect(controller.bulk({ action: 'delete', ids: [] })).rejects.toThrow(BadRequestException);
    });

    it('bulk non-array ids throws BadRequestException', async () => {
      await expect(
        controller.bulk({ action: 'delete', ids: 'not-array' as unknown as Array<string> }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('pagination shape (api-client.normalizePagedResult)', () => {
    it('data.pagination có đủ 4 field', async () => {
      const result = await controller.list({});
      const data = result.data as PaginatedResult<TestRow>;
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('data.data là array', async () => {
      const result = await controller.list({});
      const data = result.data as PaginatedResult<TestRow>;
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data).toHaveLength(1);
    });
  });
});
