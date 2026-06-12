/**
 * Controller spec cho Message controller.
 *
 * Sinh tự động bởi `generate-controller-specs.cjs`. Mục tiêu:
 *   - 100% statement/branch coverage cho file controller tương ứng.
 *   - Validate contract mà `packages/api-client` đang dùng:
 *     route + envelope + filter[column] + hard-delete alias.
 *
 * Không spin Nest app: khởi tạo controller instance với service mock và
 * đọc route metadata qua `Reflect`. Đủ để phát hiện mismatch giữa client
 * và server.
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
import { BaseMessagesController } from './message.controller';
import type { ICrudControllerService, BulkOperationResult, ListCrudParams, PaginatedResult, CrudRowDto } from '../../bases';

class TestRow implements CrudRowDto {
  id!: number;
  title = '';
  deletedAt: string | null = null;
  createdAt = new Date().toISOString();
  updatedAt = new Date().toISOString();
}

type ReqHandler = (req: unknown, res?: unknown, next?: unknown) => unknown;
type RouteInfo = { method: string; path: string; handler: string };

class TestController extends BaseMessagesController {
  constructor(service: ICrudControllerService<TestRow>) {
    super(service as never);
  }
}

describe('BaseMessagesController — client contract', () => {
  let controller: TestController;
  let service: jest.Mocked<ICrudControllerService<TestRow>>;
  const sampleRow: TestRow = {
    id: 1,
    title: 'sample',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function getRoutes(ctrl: object): RouteInfo[] {
    const out: RouteInfo[] = [];
    // Map RequestMethod enum number → verb name.
    // RequestMethod: GET=0, POST=1, PUT=2, DELETE=3, PATCH=4, OPTIONS=9, HEAD=5, SEARCH=6, ALL=7
    const VERB_MAP: Record<number, string> = {
      0: 'GET',
      1: 'POST',
      2: 'PUT',
      3: 'DELETE',
      4: 'PATCH',
      5: 'HEAD',
      6: 'SEARCH',
      7: 'ALL',
      9: 'OPTIONS',
    };
    // Walk up the prototype chain vì decorator metadata có thể
    // được đăng ký ở BaseCrudController.
    const seen = new Set<string>();
    let proto: object | null = Object.getPrototypeOf(ctrl);
    while (proto && proto !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (name === 'constructor') continue;
        if (seen.has(name)) continue;
        seen.add(name);
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        if (!desc) continue;
        const handler = desc.value as ReqHandler | undefined;
        if (typeof handler !== 'function') continue;
        const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
        if (typeof verb !== 'number') continue;
        const verbName = VERB_MAP[verb];
        if (!verbName) continue;
        const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as
          | string
          | string[]
          | undefined;
        if (pathMeta == null) continue;
        const normalized = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta;
        const cleanPath =
          normalized === '' ? '/' : `/${String(normalized).replace(/^\//, '')}`;
        out.push({ method: verbName, path: cleanPath, handler: name });
      }
      proto = Object.getPrototypeOf(proto);
    }
    return out;
  }

  beforeEach(() => {
    service = {
      list: jest.fn(async () => ({
        data: [sampleRow],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
      getById: jest.fn(async (id) => ({ ...sampleRow, id: Number(id) })),
      create: jest.fn(async (data) => ({ ...sampleRow, ...(data as object) } as TestRow)),
      update: jest.fn(async (id, data) => ({ ...sampleRow, id: Number(id), ...(data as object) } as TestRow)),
      softDelete: jest.fn(async () => true),
      restore: jest.fn(async () => true),
      hardDelete: jest.fn(async () => true),
      bulk: jest.fn(async (_a, ids) => ({
        success: ids.length,
        failed: 0,
        total: ids.length,
        errors: [],
        message: 'ok',
      })),
    };
    controller = new TestController(service);
  });

  // ─────────────────────────────────────────────────────────
  // 1) Route metadata
  // ─────────────────────────────────────────────────────────
  describe('route metadata (api-client contract)', () => {
    it('exposes GET / (list)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'list');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/');
    });

    it('exposes GET /:id (getById)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'getById');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/:id');
    });

    it('exposes POST / (create)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'create');
      expect(r?.method).toBe('POST');
      expect(r?.path).toBe('/');
    });

    it('exposes PUT /:id (update)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'update');
      expect(r?.method).toBe('PUT');
      expect(r?.path).toBe('/:id');
    });

    it('exposes DELETE /:id (softDelete)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'softDelete');
      expect(r?.method).toBe('DELETE');
      expect(r?.path).toBe('/:id');
    });

    it('exposes POST /:id/restore (restore)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'restore');
      expect(r?.method).toBe('POST');
      expect(r?.path).toBe('/:id/restore');
    });

    it('exposes DELETE /:id/hard (hardDelete)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'hardDelete');
      expect(r?.method).toBe('DELETE');
      expect(r?.path).toBe('/:id/hard');
    });

    it('exposes DELETE /:id/hard-delete (alias cho api-client.purge)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'hardDeleteAlias');
      expect(r?.method).toBe('DELETE');
      expect(r?.path).toBe('/:id/hard-delete');
    });

    it('exposes POST /bulk (bulk)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'bulk');
      expect(r?.method).toBe('POST');
      expect(r?.path).toBe('/bulk');
    });
  });

  // ─────────────────────────────────────────────────────────
  // 2) Envelope + happy path
  // ─────────────────────────────────────────────────────────
  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('list trả về success envelope với paginated data', async () => {
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

    it('getById trả về success envelope với row', async () => {
      const result = await controller.getById('1');
      expect(result.success).toBe(true);
      expect((result.data as TestRow).id).toBe(1);
    });

    it('create trả về success envelope', async () => {
      const result = await controller.create({ title: 'new' } as Record<string, unknown>);
      expect(result.success).toBe(true);
      expect((result.data as TestRow).title).toBe('new');
    });

    it('update trả về success envelope', async () => {
      const result = await controller.update('1', { title: 'updated' } as Record<string, unknown>);
      expect(result.success).toBe(true);
      expect((result.data as TestRow).title).toBe('updated');
    });

    it('softDelete trả về success envelope với nested success/message', async () => {
      const result = await controller.softDelete('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: expect.any(String) });
    });

    it('restore trả về success envelope với nested success/message', async () => {
      const result = await controller.restore('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: expect.any(String) });
    });

    it('hardDelete trả về success envelope', async () => {
      const result = await controller.hardDelete('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: expect.any(String) });
    });

    it('hardDeleteAlias (DELETE :id/hard-delete) trả về cùng envelope', async () => {
      const result = await controller.hardDeleteAlias('1');
      expect(result.success).toBe(true);
    });

    it('bulk trả về success envelope với BulkOperationResult', async () => {
      const result = await controller.bulk({ action: 'delete', ids: ['1', '2'] });
      expect(result.success).toBe(true);
      const data = result.data as BulkOperationResult;
      expect(data.total).toBe(2);
      expect(data.failed).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 3) Query contract
  // ─────────────────────────────────────────────────────────
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
        'filter[isActive]': 'true',
        'filter[authorId]': '5',
      });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: {
          isActive: 'true',
          authorId: '5',
        },
      });
    });

    it('bỏ filter[empty]', async () => {
      await controller.list({
        'filter[isActive]': '',
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
  });

  // ─────────────────────────────────────────────────────────
  // 4) Error contract
  // ─────────────────────────────────────────────────────────
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
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        const body = (e as NotFoundException).getResponse() as { success: boolean; error: string };
        expect(body.success).toBe(false);
        expect(typeof body.error).toBe('string');
      }
    });

    it('update not-found throws NotFoundException', async () => {
      service.update.mockResolvedValueOnce(null);
      await expect(controller.update('1', { title: 'x' } as Record<string, unknown>)).rejects.toThrow(NotFoundException);
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

  // ─────────────────────────────────────────────────────────
  // 5) Pagination shape
  // ─────────────────────────────────────────────────────────
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
    });
  });
});
