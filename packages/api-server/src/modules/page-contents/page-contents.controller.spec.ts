/**
 * Controller spec — BasePageContentsController (unified admin HTTP).
 * Sinh bởi generate-unified-controller-specs.cjs — ghi đè khi chạy lại.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BasePageContentsController } from './page-contents.controller';
import type { IPageContentsControllerService } from './page-contents.controller';

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

function createServiceMock(): jest.Mocked<IPageContentsControllerService> {
  return {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    bulk: jest.fn(),
  } as jest.Mocked<IPageContentsControllerService>;
}

describe('BasePageContentsController — unified admin contract', () => {
  let controller: BasePageContentsController;
  let service: jest.Mocked<IPageContentsControllerService>;
  const headers = { 'x-user-id': '7' };
  const handlers = ['list', 'getById', 'create', 'update', 'delete', 'bulk'] as const;

  beforeEach(() => {
    service = createServiceMock();
    controller = new BasePageContentsController(service);
  });

  describe('route metadata', () => {
    it('exposes handlers HTTP admin', () => {
      const found = new Set(getRoutes(controller).map((r) => r.handler));
      for (const h of handlers) {
        expect(found.has(h)).toBe(true);
      }
    });
  });

  describe('auth header contract', () => {
    it('endpoint đầu tiên trả 401 khi thiếu X-User-Id', async () => {
      const first = handlers[0];
      if (!first || typeof (controller as Record<string, unknown>)[first] !== 'function') return;
      const res = createResponseMock();
      const fn = (controller as Record<string, (...a: unknown[]) => Promise<unknown>>)[first];
      await fn.call(controller, res as never, {}, undefined, undefined, undefined, undefined, {});
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
