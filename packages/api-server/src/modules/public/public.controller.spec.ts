import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BasePublicController } from './public.controller';

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
  const map: Record<number, string> = { 0: 'GET', 1: 'POST' };
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;
      const handler = Object.getOwnPropertyDescriptor(proto, name)?.value as
        | ((...args: unknown[]) => unknown)
        | undefined;
      if (typeof handler !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
      if (typeof method !== 'number' || pathMeta == null || !(method in map)) continue;
      out.push({
        method: map[method],
        path: pathMeta === '' ? '/' : `/${String(pathMeta).replace(/^\//, '')}`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

describe('BasePublicController', () => {
  let service: Record<string, jest.Mock>;
  let controller: BasePublicController;

  beforeEach(() => {
    service = {
      getCategories: jest.fn().mockResolvedValue([]),
      getEventCategories: jest.fn().mockResolvedValue([]),
      getPageContents: jest.fn().mockResolvedValue([]),
      getPageContentBySection: jest.fn().mockResolvedValue(null),
      getPosts: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
      getPostBySlug: jest.fn().mockResolvedValue(null),
      incrementPostViewBySlug: jest.fn().mockResolvedValue(null),
      listEvents: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 1 } }),
      getEventBySlug: jest.fn().mockResolvedValue(null),
      registerForEvent: jest.fn(),
      listMyEvents: jest.fn().mockResolvedValue([]),
      cancelMyRegistration: jest.fn(),
      getSeoMetaByPage: jest.fn().mockResolvedValue(null),
    };
    controller = new BasePublicController(service as never);
  });

  it('exposes public content routes used by api-client PublicApi', () => {
    expect(getRoutes(controller)).toEqual(
      expect.arrayContaining([
        { method: 'GET', path: '/posts', handler: 'getPosts' },
        { method: 'GET', path: '/posts/:slug', handler: 'getPostBySlug' },
        { method: 'POST', path: '/posts/:slug/view', handler: 'incrementPostView' },
        { method: 'GET', path: '/categories', handler: 'getCategories' },
        { method: 'GET', path: '/event-categories', handler: 'getEventCategories' },
        { method: 'GET', path: '/page-contents/:pageKey', handler: 'getPageContents' },
        { method: 'GET', path: '/events', handler: 'getEvents' },
        { method: 'GET', path: '/events/:slug', handler: 'getEventBySlug' },
        { method: 'POST', path: '/events/:slug/register', handler: 'registerForEvent' },
        { method: 'GET', path: '/me/events', handler: 'listMyEvents' },
        { method: 'POST', path: '/me/event-registrations/:id/cancel', handler: 'cancelMyEventRegistration' },
        { method: 'GET', path: '/seo-meta', handler: 'getSeoMetaByPage' },
      ]),
    );
  });

  it('registerForEvent returns 401 when missing x-user-id', async () => {
    const res = createResponseMock();
    await controller.registerForEvent('s', {}, {}, res as never);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('listMyEvents returns 401 when missing x-user-id', async () => {
    const res = createResponseMock();
    await controller.listMyEvents({}, res as never);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('cancelMyEventRegistration returns 401 when missing x-user-id', async () => {
    const res = createResponseMock();
    await controller.cancelMyEventRegistration('1', {}, res as never);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('getSeoMetaByPage returns 400 when missing page query', async () => {
    const res = createResponseMock();
    await controller.getSeoMetaByPage(undefined, res as never);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

