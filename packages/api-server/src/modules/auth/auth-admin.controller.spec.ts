import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BaseAuthAdminController } from './auth-admin.controller';

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

describe('BaseAuthAdminController', () => {
  let service: {
    login: jest.Mock;
    tryAuthPayloadByUserId: jest.Mock;
    loginAsDevelopmentUser: jest.Mock;
    verifyGoogleToken: jest.Mock;
    loginWithGoogle: jest.Mock;
  };
  let controller: BaseAuthAdminController;

  beforeEach(() => {
    service = {
      login: jest.fn(),
      tryAuthPayloadByUserId: jest.fn(),
      loginAsDevelopmentUser: jest.fn(),
      verifyGoogleToken: jest.fn(),
      loginWithGoogle: jest.fn(),
    };
    controller = new BaseAuthAdminController(service as never);
  });

  it('exposes auth/admin routes used by api-client', () => {
    expect(getRoutes(controller)).toEqual(
      expect.arrayContaining([
        { method: 'GET', path: '/me', handler: 'me' },
        { method: 'POST', path: '/login', handler: 'login' },
        { method: 'POST', path: '/dev-login', handler: 'developmentLogin' },
        { method: 'GET', path: '/google/config', handler: 'getGoogleConfig' },
        { method: 'POST', path: '/google', handler: 'google' },
      ]),
    );
  });

  it('me tra 401 khi thieu X-User-Id', async () => {
    const res = createResponseMock();
    await controller.me(res as never, {});
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('me tra payload session khi service resolve', async () => {
    service.tryAuthPayloadByUserId.mockResolvedValue({
      payload: {
        id: 7,
        email: 'admin@example.com',
        name: 'Admin',
        image: null,
        permissions: ['users.view'],
        roles: [{ id: 1, name: 'admin', displayName: 'Admin' }],
      },
    });
    const res = createResponseMock();
    await controller.me(res as never, { 'x-user-id': '7' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 7 }),
      }),
    );
  });

  it('login tra 401 neu credential sai', async () => {
    service.login.mockResolvedValue(null);
    const res = createResponseMock();
    await controller.login({ email: 'a', password: 'b' }, res as never);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('login tra success envelope khi hop le', async () => {
    service.login.mockResolvedValue({
      id: 7,
      email: 'admin@example.com',
      name: 'Admin',
      image: null,
      permissions: [],
      roles: [{ id: 1, name: 'admin', displayName: 'Admin' }],
    });
    const res = createResponseMock();
    await controller.login(
      { email: 'admin@example.com', password: 'secret' },
      res as never,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Dang nhap thanh cong',
      }),
    );
  });

  it('developmentLogin tra 404 o production va 400 khi thieu userId', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const resProd = createResponseMock();
    await controller.developmentLogin({}, resProd as never);
    expect(resProd.status).toHaveBeenCalledWith(404);

    process.env.NODE_ENV = 'development';
    const resMissing = createResponseMock();
    await controller.developmentLogin({}, resMissing as never);
    expect(resMissing.status).toHaveBeenCalledWith(400);
    process.env.NODE_ENV = previousEnv;
  });

  it('getGoogleConfig + google bao dung contract', () => {
    const resConfig = createResponseMock();
    controller.getGoogleConfig(resConfig as never);
    expect(resConfig.status).toHaveBeenCalledWith(200);

    const resMissing = createResponseMock();
    void controller.google({}, resMissing as never);
    expect(resMissing.status).toHaveBeenCalledWith(400);
  });

  it('google tra 401 khi verify token fail', async () => {
    service.verifyGoogleToken.mockResolvedValueOnce(null);
    const res = createResponseMock();
    await controller.google({ credential: 'x' }, res as never);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('google tra 200 khi verify + login ok', async () => {
    service.verifyGoogleToken.mockResolvedValueOnce({
      email: 'admin@example.com',
      name: 'Admin',
      image: null,
    });
    service.loginWithGoogle.mockResolvedValueOnce({
      id: 7,
      email: 'admin@example.com',
      name: 'Admin',
      image: null,
      permissions: [],
      roles: [{ id: 1, name: 'admin', displayName: 'Admin' }],
    });
    const res = createResponseMock();
    await controller.google({ credential: 'x' }, res as never);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Dang nhap Google thanh cong',
      }),
    );
  });
});
