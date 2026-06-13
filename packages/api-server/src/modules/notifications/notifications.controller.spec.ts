/**
 * Controller spec — BaseNotificationsController (unified admin HTTP).
 * Sinh bởi generate-unified-controller-specs.cjs — ghi đè khi chạy lại.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BaseNotificationsController } from './notifications.controller';
import type { INotificationsControllerService } from './notifications.controller';

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

function createServiceMock(): jest.Mocked<INotificationsControllerService> {
  return {
    listForAdminTable: jest.fn(),
    getColumnOptions: jest.fn(),
    list: jest.fn(),
    getUnreadCounts: jest.fn(),
    markRead: jest.fn(),
    deleteOne: jest.fn(),
    markAllAsRead: jest.fn(),
    bulkDelete: jest.fn(),
    bulkMarkReadUnread: jest.fn(),
  } as jest.Mocked<INotificationsControllerService>;
}

describe('BaseNotificationsController — unified admin contract', () => {
  let controller: BaseNotificationsController;
  let service: jest.Mocked<INotificationsControllerService>;
  const headers = { 'x-user-id': '7' };
  const handlers = ['listTable', 'options', 'list', 'unreadCounts', 'markRead', 'deleteOne', 'markAllAsRead', 'bulk'] as const;

  beforeEach(() => {
    service = createServiceMock();
    controller = new BaseNotificationsController(service);
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
