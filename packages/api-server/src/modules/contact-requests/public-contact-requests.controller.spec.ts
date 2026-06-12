import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BasePublicContactRequestsController } from './public-contact-requests.controller';

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
  const map: Record<number, string> = { 1: 'POST' };
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

describe('BasePublicContactRequestsController', () => {
  let service: {
    create: jest.Mock;
  };
  let controller: BasePublicContactRequestsController;

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 123 }),
    };
    controller = new BasePublicContactRequestsController(service as never);
  });

  it('exposes POST /contact-requests (public contract)', () => {
    expect(getRoutes(controller)).toEqual(
      expect.arrayContaining([
        { method: 'POST', path: '/contact-requests', handler: 'createContactRequest' },
      ]),
    );
  });

  it('400 khi thieu name/email va khong co subject/legacy fields', async () => {
    const res = createResponseMock();
    await controller.createContactRequest(
      { email: 'a@b.com' } as never,
      res as never,
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('tao contact request va tra {id, message} trong success envelope', async () => {
    const res = createResponseMock();
    await controller.createContactRequest(
      {
        fullName: 'User',
        email: 'user@example.com',
        program: 'A',
      } as never,
      res as never,
    );
    expect(service.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: '123',
          message: expect.any(String),
        }),
      }),
    );
  });

  it('500 khi service throw', async () => {
    service.create.mockRejectedValueOnce(new Error('boom'));
    const res = createResponseMock();
    await controller.createContactRequest(
      {
        fullName: 'User',
        email: 'user@example.com',
        subject: 'Help',
      } as never,
      res as never,
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

