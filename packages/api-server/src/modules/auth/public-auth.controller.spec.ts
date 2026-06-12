import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BasePublicAuthController } from './public-auth.controller';

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

describe('BasePublicAuthController', () => {
  let service: {
    listDevelopmentLoginOptions: jest.Mock;
    register: jest.Mock;
    login: jest.Mock;
    loginAsDevelopmentUser: jest.Mock;
    verifyGoogleToken: jest.Mock;
    loginWithGoogleAsStudent: jest.Mock;
  };
  let controller: BasePublicAuthController;

  beforeEach(() => {
    service = {
      listDevelopmentLoginOptions: jest.fn().mockResolvedValue([
        {
          id: 1,
          email: 'dev@example.com',
          name: 'Dev',
          roleNames: ['admin'],
        },
      ]),
      register: jest.fn().mockResolvedValue({
        id: 7,
        email: 'user@example.com',
        name: 'User',
        image: null,
        permissions: [],
        roles: [{ id: 2, name: 'parent', displayName: 'Parent' }],
      }),
      login: jest.fn().mockResolvedValue(null),
      loginAsDevelopmentUser: jest.fn().mockResolvedValue(null),
      verifyGoogleToken: jest.fn().mockResolvedValue(null),
      loginWithGoogleAsStudent: jest.fn().mockResolvedValue(null),
    };
    controller = new BasePublicAuthController(service as never);
  });

  it('exposes public auth routes used by api-client PublicApi', () => {
    expect(getRoutes(controller)).toEqual(
      expect.arrayContaining([
        {
          method: 'GET',
          path: '/dev-login-options',
          handler: 'getDevelopmentLoginOptions',
        },
        {
          method: 'GET',
          path: '/auth/dev-login-options',
          handler: 'getAuthDevelopmentLoginOptions',
        },
        { method: 'GET', path: '/auth/google/config', handler: 'getPublicGoogleConfig' },
        { method: 'POST', path: '/auth/google', handler: 'publicGoogleLogin' },
        { method: 'POST', path: '/auth/login', handler: 'publicLogin' },
        { method: 'POST', path: '/auth/dev-login', handler: 'publicDevLogin' },
        { method: 'POST', path: '/auth/guest-login', handler: 'publicGuestLogin' },
        { method: 'POST', path: '/auth/guest-dev-login', handler: 'publicGuestDevLogin' },
        { method: 'POST', path: '/auth/store-login', handler: 'storeLogin' },
        { method: 'POST', path: '/auth/store-dev-login', handler: 'storeDevLogin' },
        { method: 'POST', path: '/register', handler: 'register' },
      ]),
    );
  });

  it('tra 404 khi khong o development', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = createResponseMock();
    await controller.getDevelopmentLoginOptions(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      res as never,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    process.env.NODE_ENV = previousEnv;
  });

  it('forward query filters sang service khi o development', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const res = createResponseMock();
    await controller.getAuthDevelopmentLoginOptions(
      'admin',
      'admin,staff',
      'student',
      '@example.com',
      'false',
      res as never,
    );

    expect(service.listDevelopmentLoginOptions).toHaveBeenCalledWith({
      role: 'admin',
      roles: 'admin,staff',
      excludeRoles: 'student',
      emailSuffix: '@example.com',
      activeOnly: false,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    process.env.NODE_ENV = previousEnv;
  });

  it('register tra 400 khi thieu fullName/email/password', async () => {
    const res = createResponseMock();
    await controller.register({ email: 'x', password: 'y' }, res as never);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('register tra 201 khi thanh cong', async () => {
    const res = createResponseMock();
    await controller.register(
      { fullName: 'User', email: 'user@example.com', password: 'p' },
      res as never,
    );
    expect(service.register).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.payload).toEqual(
      expect.objectContaining({ success: true, message: 'Dang ky tai khoan thanh cong' }),
    );
  });

  it('register tra 409 neu service bao ton tai', async () => {
    service.register.mockRejectedValueOnce(new Error('Email da ton tai.'));
    const res = createResponseMock();
    await controller.register(
      { fullName: 'User', email: 'user@example.com', password: 'p' },
      res as never,
    );
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
