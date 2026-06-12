import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BasePublicSettingsController } from './public-settings.controller';

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
  };
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      const handler = desc?.value as ((...args: unknown[]) => unknown) | undefined;
      if (typeof handler !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      if (typeof method !== 'number' || !(method in verbMap)) continue;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
      if (pathMeta == null) continue;
      out.push({
        method: verbMap[method],
        path: pathMeta === '' ? '/' : `/${String(pathMeta).replace(/^\//, '')}`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

describe('BasePublicSettingsController', () => {
  let service: {
    getPublicBranding: jest.Mock;
  };
  let controller: BasePublicSettingsController;

  beforeEach(() => {
    service = {
      getPublicBranding: jest.fn().mockResolvedValue({
        siteName: 'HUB',
        siteDescription: 'Quan tri he thong',
      }),
    };
    controller = new BasePublicSettingsController(service as never);
  });

  it('exposes GET /site-branding for public settings contract', () => {
    const routes = getRoutes(controller);
    expect(routes).toEqual(
      expect.arrayContaining([
        { method: 'GET', path: '/site-branding', handler: 'getSiteBranding' },
      ]),
    );
  });

  it('returns success envelope for public branding', async () => {
    const res = createResponseMock();
    await controller.getSiteBranding(res as never);

    expect(service.getPublicBranding).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: {
          siteName: 'HUB',
          siteDescription: 'Quan tri he thong',
        },
      }),
    );
  });

  it('returns 500 envelope when service throws', async () => {
    service.getPublicBranding.mockRejectedValueOnce(new Error('boom'));
    const res = createResponseMock();
    await controller.getSiteBranding(res as never);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Internal Server Error',
      }),
    );
  });
});
