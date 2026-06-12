import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { PassThrough } from 'node:stream';
import { BasePublicUploadsController } from './public-uploads.controller';

type RouteInfo = { method: string; path: string; handler: string };
type ResponseMock = PassThrough & {
  statusCode: number;
  payload: unknown;
  headers: Record<string, string>;
  setHeader: jest.Mock<void, [string, string]>;
  status: jest.Mock<ResponseMock, [number]>;
  json: jest.Mock<ResponseMock, [unknown]>;
};

function createResponseMock(): ResponseMock {
  const stream = new PassThrough();
  const response: ResponseMock = Object.assign(stream, {
    statusCode: 200,
    payload: undefined,
    headers: {},
    setHeader: jest.fn((key: string, value: string) => {
      response.headers[key] = value;
    }),
    status: jest.fn((code: number): ResponseMock => {
      response.statusCode = code;
      return response;
    }),
    json: jest.fn((payload: unknown): ResponseMock => {
      response.payload = payload;
      return response;
    }),
  });
  return response;
}

function getRoutes(ctrl: object): RouteInfo[] {
  const out: RouteInfo[] = [];
  const verbs: Record<number, string> = {
    0: 'GET',
    1: 'POST',
    2: 'PUT',
    3: 'DELETE',
    4: 'PATCH',
    5: 'HEAD',
    6: 'SEARCH',
    7: 'ALL',
    9: 'OPTIONS',
  };
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      const handler = descriptor?.value;
      if (typeof handler !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      if (typeof method !== 'number') continue;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as
        | string
        | string[]
        | undefined;
      if (pathMeta == null) continue;
      const normalized = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta;
      out.push({
        method: verbs[method],
        path: `/${String(normalized).replace(/^\//, '')}`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

class TestController extends BasePublicUploadsController {}

describe('BasePublicUploadsController', () => {
  let controller: TestController;
  let service: {
    serveFile: jest.Mock;
    serveResized: jest.Mock;
  };

  beforeEach(() => {
    service = {
      serveFile: jest.fn(async () => ({
        stream: ReadableFrom('plain'),
        contentType: 'text/plain',
        originalName: 'plain.txt',
      })),
      serveResized: jest.fn(async () => ({
        stream: ReadableFrom('image'),
        contentType: 'image/webp',
        originalName: 'image.webp',
      })),
    };
    controller = new TestController(service as never);
  });

  it('exposes public uploads routes', () => {
    const routes = getRoutes(controller);
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: 'GET', path: '/resized/*path', handler: 'serveResized' }),
        expect.objectContaining({ method: 'GET', path: '/*path', handler: 'serve' }),
      ]),
    );
  });

  it('serveResized validate width va delegate sang service', async () => {
    const res = createResponseMock();
    await controller.serveResized('images/a.png', '200', '75', res as never);

    expect(service.serveResized).toHaveBeenCalledWith('images/a.png', 200, 75);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/webp');
  });

  it('serveResized tra 400 khi width invalid', async () => {
    const res = createResponseMock();
    await controller.serveResized('images/a.png', '10', '75', res as never);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('serve tra 404 khi service throw', async () => {
    service.serveFile.mockRejectedValueOnce(new Error('missing'));
    const res = createResponseMock();
    await controller.serve('images/missing.png', res as never);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

function ReadableFrom(value: string): PassThrough {
  const stream = new PassThrough();
  stream.end(value);
  return stream;
}
