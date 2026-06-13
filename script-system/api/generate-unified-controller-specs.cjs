/**
 * Sinh `*.controller.spec.ts` cho module unified admin (mẫu posts).
 * Usage: node script-system/api/generate-unified-controller-specs.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')
const { REGISTRY } = require('./api-module-registry.cjs')

const UNIFIED_SKIP = new Set(['posts'])

const UNIFIED = [
  'posts',
  'events',
  'comments',
  'accounts',
  'page-contents',
  'notifications',
  'sessions',
  'event-checkins',
  'event-registrations',
  'event-speakers',
].filter((id) => !UNIFIED_SKIP.has(id))

function pascalFromFolder(folder) {
  return folder
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

const EXTRA_CONTROLLER_TESTS = {
  comments: `
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
  });`,
}

function parsePickMethods(src) {
  const block = src.match(/export type I\w+ControllerService = Pick<[\s\S]*?>;/)
  if (!block) return []
  return [...block[0].matchAll(/\| '(\w+)'/g)].map((m) => m[1])
}

function parseOwnHandlers(src) {
  const skip = new Set([
    'handleGetById',
    'buildListParams',
    'buildErrorDetails',
    'sendEntityNotFound',
  ])
  const out = []
  for (const m of src.matchAll(/^\s*async\s+(\w+)\s*\(/gm)) {
    if (!skip.has(m[1])) out.push(m[1])
  }
  return out
}

function parseConstructorParams(src) {
  const m = src.match(/constructor\s*\(([\s\S]*?)\)\s*{/)
  if (!m) return ['service']
  return m[1]
    .split(',')
    .map((p) => p.match(/readonly\s+(\w+)/)?.[1])
    .filter(Boolean)
}

function isCrudBase(src) {
  return src.includes('extends BaseAdminCrudController')
}

function handlerSet(src) {
  const handlers = new Set(parseOwnHandlers(src))
  if (isCrudBase(src)) {
    for (const h of ['list', 'softDelete', 'restore', 'hardDelete', 'bulk']) {
      handlers.add(h)
    }
  }
  return [...handlers]
}

function renderSpec(moduleId, def, src) {
  const folder = def.folder
  const pascal = pascalFromFolder(folder)
  const cls = `Base${pascal}Controller`
  const ctrlFile = def.controllerFile.replace(/\.ts$/, '')
  const iface = `I${pascal}ControllerService`
  const methods = parsePickMethods(src)
  const params = parseConstructorParams(src)
  const handlers = handlerSet(src)
  const crud = isCrudBase(src)

  const extraCtor =
    params.length > 1
      ? params
          .slice(1)
          .map(() => `{} as never`)
          .join(', ')
      : ''

  const ctorArgs =
    params.length > 1
      ? `service${extraCtor ? `, ${extraCtor}` : ''}`
      : 'service'

  const mockMethods = methods
    .map((m) => `    ${m}: jest.fn(),`)
    .join('\n')

  const handlerList = handlers.map((h) => `'${h}'`).join(', ')

  const crudTests = crud
    ? `
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
  });`
    : `
  describe('auth header contract', () => {
    it('endpoint đầu tiên trả 401 khi thiếu X-User-Id', async () => {
      const first = handlers[0];
      if (!first || typeof (controller as Record<string, unknown>)[first] !== 'function') return;
      const res = createResponseMock();
      const fn = (controller as Record<string, (...a: unknown[]) => Promise<unknown>>)[first];
      await fn.call(controller, res as never, {}, undefined, undefined, undefined, undefined, {});
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });`

  const extraTests = EXTRA_CONTROLLER_TESTS[moduleId] ?? ''

  return `/**
 * Controller spec — ${cls} (unified admin HTTP).
 * Sinh bởi generate-unified-controller-specs.cjs — ghi đè khi chạy lại.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ${cls} } from './${ctrlFile}';
import type { ${iface} } from './${ctrlFile}';

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
        path: normalized === '' ? '/' : \`/\${String(normalized).replace(/^\\//, '')}\`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

function createServiceMock(): jest.Mocked<${iface}> {
  return {
${mockMethods}
  } as jest.Mocked<${iface}>;
}

describe('${cls} — unified admin contract', () => {
  let controller: ${cls};
  let service: jest.Mocked<${iface}>;
  const headers = { 'x-user-id': '7' };
  const handlers = [${handlerList}] as const;

  beforeEach(() => {
    service = createServiceMock();
    controller = new ${cls}(${ctorArgs});
  });

  describe('route metadata', () => {
    it('exposes handlers HTTP admin', () => {
      const found = new Set(getRoutes(controller).map((r) => r.handler));
      for (const h of handlers) {
        expect(found.has(h)).toBe(true);
      }
    });
  });
${crudTests}${extraTests}
});
`
}

let generated = 0
for (const moduleId of UNIFIED) {
  const def = REGISTRY[moduleId]
  if (!def?.controllerFile) continue
  const dir = path.join(ROOT, 'packages/api-server/src/modules', def.folder)
  const ctrlPath = path.join(dir, def.controllerFile)
  if (!fs.existsSync(ctrlPath)) {
    console.warn(`[unified-spec] skip ${moduleId}: missing ${def.controllerFile}`)
    continue
  }
  const src = fs.readFileSync(ctrlPath, 'utf8')
  const specPath = path.join(dir, `${def.controllerFile.replace(/\.ts$/, '')}.spec.ts`)
  fs.writeFileSync(specPath, renderSpec(moduleId, def, src), 'utf8')
  generated++
  console.log(`[unified-spec] ${path.relative(ROOT, specPath)}`)
}

console.log(`[unified-spec] done: ${generated} file(s)`)
