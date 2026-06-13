/**
 * Controller spec — BaseCommentsController (unified admin HTTP).
 * Sinh bởi generate-unified-controller-specs.cjs — ghi đè khi chạy lại.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BaseCommentsController } from './comments.controller';
import type { ICommentsControllerService } from './comments.controller';

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

function createServiceMock(): jest.Mocked<ICommentsControllerService> {
  return {
    list: jest.fn(),
    getOptions: jest.fn(),
    getById: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    hardDelete: jest.fn(),
    approve: jest.fn(),
    unapprove: jest.fn(),
    bulk: jest.fn(),
  } as jest.Mocked<ICommentsControllerService>;
}

describe('BaseCommentsController — unified admin contract', () => {
  let controller: BaseCommentsController;
  let service: jest.Mocked<ICommentsControllerService>;
  const headers = { 'x-user-id': '7' };
  const handlers = ['options', 'getById', 'approve', 'unapprove', 'list', 'softDelete', 'restore', 'hardDelete', 'bulk'] as const;

  beforeEach(() => {
    service = createServiceMock();
    controller = new BaseCommentsController(service);
  });

  describe('route metadata', () => {
    it('exposes handlers HTTP admin', () => {
      const found = new Set(getRoutes(controller).map((r) => r.handler));
      for (const h of handlers) {
        expect(found.has(h)).toBe(true);
      }
    });
  });

  describe('admin CRUD contract', () => {
    it('list 401 khi thiếu X-User-Id', async () => {
      if (typeof (controller as { list?: unknown }).list !== 'function') return;
      const res = createResponseMock();
      await (controller as { list: (...a: unknown[]) => Promise<unknown> }).list(
        res as never,
        {},
        undefined,
        undefined,
        undefined,
        undefined,
        {},
      );
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('list 200 + pagination envelope', async () => {
      if (typeof (controller as { list?: unknown }).list !== 'function') return;
      service.list.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      const res = createResponseMock();
      await (controller as { list: (...a: unknown[]) => Promise<unknown> }).list(
        res as never,
        headers,
        '1',
        '10',
        undefined,
        undefined,
        {},
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.payload).toEqual(
        expect.objectContaining({ success: true, data: expect.any(Object) }),
      );
    });

    it('getById 404 khi service trả null', async () => {
      if (typeof (controller as { getById?: unknown }).getById !== 'function') return;
      service.getById.mockResolvedValue(null);
      const res = createResponseMock();
      await (controller as { getById: (...a: unknown[]) => Promise<unknown> }).getById(
        res as never,
        headers,
        '1',
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
  describe('approve / unapprove', () => {
    it('approve 401 khi thiếu X-User-Id', async () => {
      const res = createResponseMock();
      await controller.approve(res as never, {}, '1');
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('approve 200 khi service duyệt thành công', async () => {
      service.approve.mockResolvedValue(true);
      const res = createResponseMock();
      await controller.approve(res as never, headers, '1');
      expect(service.approve).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('unapprove route metadata POST /:id/unapprove', () => {
      const route = getRoutes(controller).find((r) => r.handler === 'unapprove');
      expect(route?.method).toBe('POST');
      expect(route?.path).toBe('/:id/unapprove');
    });
  });
});
