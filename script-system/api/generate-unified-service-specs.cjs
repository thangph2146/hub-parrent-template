/**
 * Sinh `*.service.spec.ts` tối thiểu cho module unified admin.
 * Usage: node script-system/api/generate-unified-service-specs.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')
const { REGISTRY } = require('./api-module-registry.cjs')

const UNIFIED = [
  'events',
  'comments',
  'accounts',
  'page-contents',
  'notifications',
  'sessions',
  'event-checkins',
  'event-registrations',
  'event-speakers',
]

const LIST_PARAMS = {
  events: `{ page: 1, limit: 10, status: 'active' as const }`,
  comments: `{ page: 1, limit: 10, status: 'active' as const }`,
  'page-contents': `{ page: 1, limit: 10, status: 'active' as const }`,
  notifications: `{ userId: '1', limit: 10, offset: 0 }`,
  sessions: `{ page: 1, limit: 10, status: 'active' as const }`,
  'event-checkins': `{ eventId: '1', page: 1, limit: 10, status: 'active' as const }`,
  'event-registrations': `{ eventId: '1', page: 1, limit: 10 }`,
  'event-speakers': `{ eventId: '1', page: 1, limit: 10 }`,
}

function pascalFromFolder(folder) {
  return folder
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

function parseAbstractMethods(src) {
  const out = []
  for (const m of src.matchAll(/protected abstract (\w+)\([^)]*\)[^;]*;/g)) {
    out.push(m[1])
  }
  return out
}

function hasAsyncMethod(src, name) {
  return new RegExp(`\\n\\s*async ${name}\\s*\\(`).test(src)
}

function renderBindingMethods(abstractMethods) {
  return abstractMethods
    .map((name) => {
      if (name === 'getEm') {
        return `  protected getEm(): EntityManager {
    return this.emRef as EntityManager;
  }`
      }
      if (name === 'emitNotificationToUser') {
        return `  protected emitNotificationToUser = jest.fn();`
      }
      if (name === 'getAuthRoleNames') {
        return `  protected getAuthRoleNames() {
    return { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'User' };
  }`
      }
      return `  protected ${name}(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }`
    })
    .join('\n\n')
}

const LIST_ASSERT = {
  notifications: `expect.objectContaining({
          notifications: expect.any(Array),
          total: 0,
        })`,
}

function renderTests(moduleId, src, pascal) {
  const blocks = []
  const testCls = `Test${pascal}Service`

  if (hasAsyncMethod(src, 'list') && LIST_PARAMS[moduleId]) {
    const listAssert =
      LIST_ASSERT[moduleId] ??
      `expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            total: 0,
          }),
        })`
    blocks.push(`
  describe('list', () => {
    it('trả về data + pagination', async () => {
      em.findAndCount = jest.fn().mockResolvedValue([[], 0]);
      em.count = jest.fn().mockResolvedValue(0);
      const result = await service.list(${LIST_PARAMS[moduleId]});
      expect(result).toEqual(${listAssert});
    });
  });`)
  }

  if (hasAsyncMethod(src, 'getById')) {
    blocks.push(`
  describe('getById', () => {
    it('null khi không tìm thấy', async () => {
      em.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.getById('999')).resolves.toBeNull();
    });
  });`)
  }

  if (hasAsyncMethod(src, 'getProfile')) {
    blocks.push(`
  describe('getProfile', () => {
    it('null khi user không tồn tại', async () => {
      em.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.getProfile('999')).resolves.toBeNull();
    });
  });`)
  }

  if (hasAsyncMethod(src, 'getSuperAdminUserIds')) {
    blocks.push(`
  describe('getSuperAdminUserIds', () => {
    it('trả về mảng id', async () => {
      em.find = jest.fn().mockResolvedValue([{ user: { id: 1 } }]);
      await expect(service.getSuperAdminUserIds()).resolves.toEqual([1]);
    });
  });`)
  }

  if (blocks.length === 0) {
    blocks.push(`
  it('binding subclass khởi tạo được', () => {
    expect(service).toBeInstanceOf(${testCls});
  });`)
  }

  return blocks.join('\n')
}

function renderSpec(moduleId, def, src) {
  const folder = def.folder
  const pascal = pascalFromFolder(folder)
  const cls = `Base${pascal}Service`
  const svcFile = def.serviceFile.replace(/\.ts$/, '')
  const abstractMethods = parseAbstractMethods(src)
  const binding = renderBindingMethods(abstractMethods)
  const tests = renderTests(moduleId, src, pascal)

  return `/**
 * ${cls} unit tests — sinh bởi generate-unified-service-specs.cjs.
 */
import { EntityManager } from '@mikro-orm/core';
import { ${cls} } from './${svcFile}';

class Test${pascal}Service extends ${cls} {
  constructor(private readonly emRef: Partial<EntityManager>) {
    super();
  }

${binding}
}

describe('${cls}', () => {
  let service: Test${pascal}Service;
  let em: Partial<EntityManager>;

  beforeEach(() => {
    em = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      count: jest.fn().mockResolvedValue(0),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockReturnValue({ id: 1 }),
      getConnection: jest.fn().mockReturnValue({ execute: jest.fn().mockResolvedValue([]) }),
    };
    service = new Test${pascal}Service(em);
  });
${tests}
});
`
}

let generated = 0
for (const moduleId of UNIFIED) {
  const def = REGISTRY[moduleId]
  if (!def?.serviceFile) continue
  const dir = path.join(ROOT, 'packages/api-server/src/modules', def.folder)
  const svcPath = path.join(dir, def.serviceFile)
  if (!fs.existsSync(svcPath)) continue
  const src = fs.readFileSync(svcPath, 'utf8')
  if (!src.includes(`export abstract class Base${pascalFromFolder(def.folder)}Service`)) {
    console.warn(`[unified-service-spec] skip ${moduleId}: not abstract binding service`)
    continue
  }
  const specPath = path.join(dir, `${def.serviceFile.replace(/\.ts$/, '')}.spec.ts`)
  fs.writeFileSync(specPath, renderSpec(moduleId, def, src), 'utf8')
  generated++
  console.log(`[unified-service-spec] ${path.relative(ROOT, specPath)}`)
}

console.log(`[unified-service-spec] done: ${generated} file(s)`)
