/**
 * Controller spec cho BaseUsersController.
 *
 * Sinh tự động bởi `generate-controller-specs.cjs`. Mục tiêu:
 *   - Cover tất cả nhánh của users.controller.ts.
 *   - Validate contract mà `packages/api-client.users` đang dùng:
 *     list/getById/create/update/softDelete/restore/hardDelete/bulk.
 *
 * Note: `BaseUsersController` không extend `BaseCrudController`. Mỗi
 * handler nhận `@Res() res` rồi gọi `res.status(...).json(...)`. Spec
 * này dùng fake Express response (status jest.fn → json jest.fn).
 */
import 'reflect-metadata';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { BaseUsersController, CreateUserDto, UpdateUserDto, BulkActionDto } from './users.controller';

function makeRes() {
  const statusMock = jest.fn().mockReturnThis();
  const jsonMock = jest.fn();
  const res: any = { status: statusMock, json: jsonMock };
  return { res, statusMock, jsonMock };
}

function getRoutes(ctrl: object): Array<{ method: string; path: string; handler: string }> {
  const out: Array<{ method: string; path: string; handler: string }> = [];
  const VERB_MAP: Record<number, string> = {
    0: 'GET', 1: 'POST', 2: 'PUT', 3: 'DELETE', 4: 'PATCH',
    5: 'HEAD', 6: 'SEARCH', 7: 'ALL', 9: 'OPTIONS',
  };
  const seen = new Set<string>();
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor' || seen.has(name)) continue;
      seen.add(name);
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      if (!desc) continue;
      const handler = desc.value as (...a: unknown[]) => unknown;
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
      const cleanPath = normalized === '' ? '/' : `/${String(normalized).replace(/^\//, '')}`;
      out.push({ method: verbName, path: cleanPath, handler: name });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

class TestUsersService {
  list = jest.fn();
  getById = jest.fn();
  getOptions = jest.fn();
  create = jest.fn();
  update = jest.fn();
  softDelete = jest.fn();
  restore = jest.fn();
  hardDelete = jest.fn();
  bulk = jest.fn();
  listDevelopmentLoginOptions = jest.fn();
  resolveActorEmail = jest.fn();
}

describe('BaseUsersController — client contract', () => {
  let controller: BaseUsersController;
  let service: TestUsersService;

  beforeEach(() => {
    service = new TestUsersService();
    controller = new BaseUsersController(service as never);
  });

  // ─────────────────────────────────────────────────────────
  // 1) Route metadata
  // ─────────────────────────────────────────────────────────
  describe('route metadata', () => {
    it('exposes tất cả handler mà api-client.users dùng', () => {
      const handlers = new Set(getRoutes(controller).map((r) => r.handler));
      for (const h of [
        'list',
        'getById',
        'create',
        'update',
        'softDelete',
        'restore',
        'hardDelete',
        'bulk',
        'options',
        'devLoginOptions',
      ]) {
        expect(handlers.has(h)).toBe(true);
      }
    });

    it('softDelete: DELETE', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'softDelete');
      expect(r?.method).toBe('DELETE');
    });

    it('restore: POST', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'restore');
      expect(r?.method).toBe('POST');
    });

    it('hardDelete: DELETE', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'hardDelete');
      expect(r?.method).toBe('DELETE');
    });

    it('bulk: POST', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'bulk');
      expect(r?.method).toBe('POST');
    });

    it('list: GET (root)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'list');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/');
    });

    it('getById: GET (/:id)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'getById');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/:id');
    });
  });

  // ─────────────────────────────────────────────────────────
  // 2) Helper envelopes
  // ─────────────────────────────────────────────────────────
  describe('envelope helpers', () => {
    it('createSuccessResponse mặc định statusCode 200 + body success', () => {
      const res = (controller as any).createSuccessResponse({ x: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ x: 1 });
    });

    it('createSuccessResponse cho phép override statusCode', () => {
      const res = (controller as any).createSuccessResponse({ x: 1 }, { statusCode: 201 });
      expect(res.statusCode).toBe(201);
    });

    it('createErrorResponse mặc định statusCode 500 + code INTERNAL_ERROR', () => {
      const res = (controller as any).createErrorResponse('Boom');
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('INTERNAL_ERROR');
      expect(res.body.error?.message).toBe('Boom');
    });

    it('createErrorResponse override code + statusCode + details', () => {
      const res = (controller as any).createErrorResponse('Boom', {
        statusCode: 400,
        code: 'BAD_REQUEST',
        details: { field: 'email' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error?.code).toBe('BAD_REQUEST');
      expect(res.body.error?.details).toEqual({ field: 'email' });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 3) parseListStatus
  // ─────────────────────────────────────────────────────────
  describe('parseListStatus', () => {
    it('valid status: active/deleted/all', () => {
      expect((controller as any).parseListStatus('active')).toBe('active');
      expect((controller as any).parseListStatus('deleted')).toBe('deleted');
      expect((controller as any).parseListStatus('all')).toBe('all');
    });

    it('invalid/undefined → active', () => {
      expect((controller as any).parseListStatus('invalid')).toBe('active');
      expect((controller as any).parseListStatus(undefined)).toBe('active');
      expect((controller as any).parseListStatus('')).toBe('active');
    });
  });

  describe('parsePagination', () => {
    it('chuẩn hóa page/limit hợp lệ', () => {
      expect((controller as any).parsePagination('2', '25')).toEqual({
        page: 2,
        limit: 25,
      });
    });

    it('fallback về default khi page/limit không hợp lệ', () => {
      expect((controller as any).parsePagination('abc', '0', 15)).toEqual({
        page: 1,
        limit: 1,
      });
    });

    it('fallback về defaultLimit khi limit không parse được', () => {
      expect((controller as any).parsePagination('abc', 'xyz', 15)).toEqual({
        page: 1,
        limit: 15,
      });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 4) parseFilters (logic dùng cho list query)
  // ─────────────────────────────────────────────────────────
  describe('parseFilters', () => {
    it('parse filter[col] keys', () => {
      const out = (controller as any).parseFilters({ 'filter[isActive]': 'true' });
      expect(out).toEqual({ isActive: 'true' });
    });

    it('ignore non filter[] keys', () => {
      const out = (controller as any).parseFilters({ plain: 'x' });
      expect(out).toEqual({});
    });

    it('ignore empty values', () => {
      const out = (controller as any).parseFilters({ 'filter[a]': '' });
      expect(out).toEqual({});
    });

    it('array value lấy phần tử đầu', () => {
      const out = (controller as any).parseFilters({
        'filter[a]': ['1', '2'] as never,
      });
      expect(out).toEqual({ a: '1' });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 5) isBulkAction
  // ─────────────────────────────────────────────────────────
  describe('isBulkAction', () => {
    it('true cho 5 action hợp lệ', () => {
      for (const a of ['delete', 'restore', 'hard-delete', 'active', 'unactive']) {
        expect((controller as any).isBulkAction(a)).toBe(true);
      }
    });

    it('false cho action khác', () => {
      expect((controller as any).isBulkAction('whatever')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 6) list endpoint
  // ─────────────────────────────────────────────────────────
  describe('list endpoint', () => {
    it('401 khi thiếu X-User-Id header', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).list(res, undefined, undefined, undefined, undefined, undefined, undefined);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('trả về paginated data envelope khi có header', async () => {
      service.list.mockResolvedValueOnce({
        data: [{ id: 'u1', email: 'a@b.c' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      } as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).list(
        res,
        'admin-id',
        '1',
        '10',
        'foo',
        'active',
        { 'filter[isActive]': 'true' } as never,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      const body = jsonMock.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.data).toEqual({
        data: [{ id: 'u1', email: 'a@b.c' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it('chuyển page/limit/search/status + filters cho service', async () => {
      service.list.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      } as never);
      const { res } = makeRes();
      await (controller as any).list(
        res,
        'admin',
        '2',
        '25',
        'foo',
        'deleted',
        { 'filter[isActive]': 'true' } as never,
      );
      expect(service.list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 25,
          search: 'foo',
          status: 'deleted',
          filters: { isActive: 'true' },
        }),
      );
    });

    it('fallback limit riêng cho list là 10 khi query không hợp lệ', async () => {
      service.list.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      } as never);
      const { res } = makeRes();
      await (controller as any).list(
        res,
        'admin',
        '1',
        'abc',
        '  foo  ',
        'active',
        undefined,
      );
      expect(service.list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          search: 'foo',
          status: 'active',
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // 7) options endpoint
  // ─────────────────────────────────────────────────────────
  describe('options endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).options(res, undefined, 'title', undefined, '10');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('trả về options khi có header', async () => {
      service.getOptions.mockResolvedValueOnce([{ label: 'A', value: 'a' }] as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).options(res, 'admin', 'title', 'foo', '50');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual([{ label: 'A', value: 'a' }]);
    });

    it('fallback limit riêng cho options là 50 khi query không hợp lệ', async () => {
      service.getOptions.mockResolvedValueOnce([] as never);
      const { res } = makeRes();
      await (controller as any).options(res, 'admin', 'title', 'foo', 'abc');
      expect(service.getOptions).toHaveBeenCalledWith('title', 'foo', 50);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 8) devLoginOptions
  // ─────────────────────────────────────────────────────────
  describe('devLoginOptions endpoint', () => {
    it('trả về options thành công', async () => {
      service.listDevelopmentLoginOptions.mockResolvedValueOnce([{ id: '1' }] as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).devLoginOptions(res, 'admin', 'foo');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual([{ id: '1' }]);
    });

    it('trim role/search trước khi gọi service', async () => {
      service.listDevelopmentLoginOptions.mockResolvedValueOnce([] as never);
      const { res } = makeRes();
      await (controller as any).devLoginOptions(res, '  admin  ', '  foo  ');
      expect(service.listDevelopmentLoginOptions).toHaveBeenCalledWith({
        role: 'admin',
        search: 'foo',
      });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 9) getById
  // ─────────────────────────────────────────────────────────
  describe('getById endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('trả về user khi tìm thấy', async () => {
      service.getById.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' } as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({ id: 'u1', email: 'a@b.c' });
    });

    it('404 khi không tìm thấy', async () => {
      service.getById.mockResolvedValueOnce(null);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, 'admin', 'missing');
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 10) create
  // ─────────────────────────────────────────────────────────
  describe('create endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).create(res, undefined, {} as never);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu email', async () => {
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = '';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('400 khi thiếu password', async () => {
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = '';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('trả về 201 khi tạo thành công', async () => {
      service.resolveActorEmail.mockResolvedValueOnce('admin@example.com' as never);
      service.create.mockResolvedValueOnce({ id: 'new', email: 'a@b.c' } as never);
      const { res, statusMock, jsonMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = '  a@b.c  ';
      dto.name = '  Name  ';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.c',
          name: 'Name',
          isActive: true,
        }),
      );
      expect(jsonMock.mock.calls[0][0].data).toEqual({ id: 'new', email: 'a@b.c' });
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 11) update
  // ─────────────────────────────────────────────────────────
  describe('update endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).update(res, undefined, 'u1', {} as never);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).update(res, 'admin', undefined, {} as never);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('trả về 200 khi update thành công', async () => {
      service.resolveActorEmail.mockResolvedValueOnce('admin@example.com' as never);
      service.update.mockResolvedValueOnce({ id: 'u1', email: 'new@b.c' } as never);
      const { res, statusMock, jsonMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = '  new@b.c  ';
      dto.name = '  User  ';
      dto.phone = ' 123 ';
      dto.address = ' addr ';
      dto.citizenId = ' cid ';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(service.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({
          email: 'new@b.c',
          name: 'User',
          phone: '123',
          address: 'addr',
          citizenId: 'cid',
        }),
        'admin@example.com',
      );
      expect(jsonMock.mock.calls[0][0].data).toEqual({ id: 'u1', email: 'new@b.c' });
    });

    it('404 khi service trả về null', async () => {
      service.update.mockResolvedValueOnce(null);
      const { res, statusMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 12) bulk
  // ─────────────────────────────────────────────────────────
  describe('bulk endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1'];
      await (controller as any).bulk(res, undefined, dto);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu action', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = '' as never;
      dto.ids = ['1'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('400 khi ids rỗng', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = [];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('400 khi action không hợp lệ', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'whatever';
      dto.ids = ['1'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('trả về 200 khi bulk thành công', async () => {
      service.bulk.mockResolvedValueOnce({
        success: 2,
        failed: 0,
        total: 2,
        errors: [],
        message: 'ok',
      } as never);
      const { res, statusMock, jsonMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1', '2'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        affected: 2,
        message: 'ok',
      });
    });

    it('500 khi service throw lỗi', async () => {
      service.bulk.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 13) softDelete
  // ─────────────────────────────────────────────────────────
  describe('softDelete endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('200 khi thành công', async () => {
      service.softDelete.mockResolvedValueOnce(true);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: true,
        message: 'Xóa người dùng thành công',
      });
    });

    it('200 với success=false khi service trả về false', async () => {
      service.softDelete.mockResolvedValueOnce(false);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data.success).toBe(false);
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.softDelete.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.softDelete.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 14) restore
  // ─────────────────────────────────────────────────────────
  describe('restore endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).restore(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).restore(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('200 khi thành công', async () => {
      service.restore.mockResolvedValueOnce(true);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).restore(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: true,
        message: 'Khôi phục người dùng thành công',
      });
    });

    it('200 success=false khi service trả về false', async () => {
      service.restore.mockResolvedValueOnce(false);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).restore(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data.success).toBe(false);
    });

    it('500 khi service throw', async () => {
      service.restore.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      await (controller as any).restore(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 15) hardDelete
  // ─────────────────────────────────────────────────────────
  describe('hardDelete endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('200 khi thành công', async () => {
      service.hardDelete.mockResolvedValueOnce(true);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: true,
        message: 'Xóa vĩnh viễn người dùng thành công',
      });
    });

    it('200 success=false khi service trả về false', async () => {
      service.hardDelete.mockResolvedValueOnce(false);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data.success).toBe(false);
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.hardDelete.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.hardDelete.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 16) DTO classes
  // ─────────────────────────────────────────────────────────
  describe('DTOs', () => {
    it('CreateUserDto là class hợp lệ (gán được field)', () => {
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      expect(dto.email).toBe('a@b.c');
      expect(dto.password).toBe('p');
    });

    it('UpdateUserDto là class hợp lệ', () => {
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      expect(dto.email).toBe('new@b.c');
    });

    it('BulkActionDto là class hợp lệ', () => {
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1'];
      expect(dto.action).toBe('delete');
      expect(dto.ids).toEqual(['1']);
    });
  });
});
