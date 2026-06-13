/**
 * Controller spec — BaseEventsController (unified admin HTTP).
 * Sinh bởi generate-unified-controller-specs.cjs — ghi đè khi chạy lại.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BaseEventsController } from './events.controller';
import type { IEventsControllerService } from './events.controller';

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

function createServiceMock(): jest.Mocked<IEventsControllerService> {
  return {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    hardDelete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    bulk: jest.fn(),
  } as jest.Mocked<IEventsControllerService>;
}

describe('BaseEventsController — unified admin contract', () => {
  let controller: BaseEventsController;
  let service: jest.Mocked<IEventsControllerService>;
  const headers = { 'x-user-id': '7' };
  const handlers = ['getById', 'create', 'update', 'list', 'softDelete', 'restore', 'hardDelete', 'bulk'] as const;

  beforeEach(() => {
    service = createServiceMock();
    controller = new BaseEventsController(service);
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
});
