#!/usr/bin/env node
/* eslint-disable */
/**
 * Generator tạo `*.controller.spec.ts` cho mọi module trong
 * packages/api-server/src/modules/.
 *
 * Mỗi spec test:
 *   1) Route metadata (GET/POST/PUT/DELETE/bulk/restore/hardDelete) — khớp
 *      contract mà `packages/api-client` đang dùng.
 *   2) Envelope response (`success/message/error/data`).
 *   3) Happy path của list/getById/create/update/softDelete/restore/hardDelete/bulk.
 *   4) Error paths: invalid id → BadRequest, not-found → NotFound,
 *      bulk invalid action / empty ids → BadRequest.
 *   5) Extra endpoints nếu có (vd `getOptions` trong posts.controller).
 *
 * Không dùng Nest TestingModule: instantiate controller trực tiếp với
 * service mock + Reflect metadata — đã cover đầy đủ logic HTTP layer.
 *
 * Chạy:
 *   node packages/api-server/generate-controller-specs.cjs
 *
 * Idempotent: nếu file đã có thì ghi đè.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(
  __dirname,
  'src',
  'modules',
);

const TEMPLATE = (opts) => `/**
 * Controller spec cho ${opts.entity} controller.
 *
 * Sinh tự động bởi \`generate-controller-specs.cjs\`. Mục tiêu:
 *   - 100% statement/branch coverage cho file controller tương ứng.
 *   - Validate contract mà \`packages/api-client\` đang dùng:
 *     route + envelope + filter[column] + hard-delete alias.
 *
 * Không spin Nest app: khởi tạo controller instance với service mock và
 * đọc route metadata qua \`Reflect\`. Đủ để phát hiện mismatch giữa client
 * và server.
 */
import 'reflect-metadata';
import {
  BadRequestException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { ${opts.imports.join(', ')} } from './${opts.ctrlBaseName}';
import type { ICrudControllerService, BulkOperationResult, ListCrudParams, PaginatedResult, CrudRowDto } from '../../bases';

class TestRow implements CrudRowDto {
  id!: number;
  title = '';
  deletedAt: string | null = null;
  createdAt = new Date().toISOString();
  updatedAt = new Date().toISOString();
}

type ReqHandler = (req: unknown, res?: unknown, next?: unknown) => unknown;
type RouteInfo = { method: string; path: string; handler: string };

class TestController extends ${opts.cls} {
  constructor(service: ICrudControllerService<TestRow>) {
    super(service as never);
  }
}

describe('${opts.cls} — client contract', () => {
  let controller: TestController;
  let service: jest.Mocked<ICrudControllerService<TestRow>>;
  const sampleRow: TestRow = {
    id: 1,
    title: 'sample',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function getRoutes(ctrl: object): RouteInfo[] {
    const out: RouteInfo[] = [];
    // Map RequestMethod enum number → verb name.
    // RequestMethod: GET=0, POST=1, PUT=2, DELETE=3, PATCH=4, OPTIONS=9, HEAD=5, SEARCH=6, ALL=7
    const VERB_MAP: Record<number, string> = {
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
    // Walk up the prototype chain vì decorator metadata có thể
    // được đăng ký ở BaseCrudController.
    const seen = new Set<string>();
    let proto: object | null = Object.getPrototypeOf(ctrl);
    while (proto && proto !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (name === 'constructor') continue;
        if (seen.has(name)) continue;
        seen.add(name);
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        if (!desc) continue;
        const handler = desc.value as ReqHandler | undefined;
        if (typeof handler !== 'function') continue;
        const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
        if (typeof verb !== 'number') continue;
        const verbName = VERB_MAP[verb];
        if (!verbName) continue;
        const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as
          | string
          | string[]
          | undefined;
        if (pathMeta == null) continue;
        const normalized = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta;
        const cleanPath =
          normalized === '' ? '/' : \`/\${String(normalized).replace(/^\\//, '')}\`;
        out.push({ method: verbName, path: cleanPath, handler: name });
      }
      proto = Object.getPrototypeOf(proto);
    }
    return out;
  }

  beforeEach(() => {
    service = {
      list: jest.fn(async () => ({
        data: [sampleRow],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
      getById: jest.fn(async (id) => ({ ...sampleRow, id: Number(id) })),
      create: jest.fn(async (data) => ({ ...sampleRow, ...(data as object) } as TestRow)),
      update: jest.fn(async (id, data) => ({ ...sampleRow, id: Number(id), ...(data as object) } as TestRow)),
      softDelete: jest.fn(async () => true),
      restore: jest.fn(async () => true),
      hardDelete: jest.fn(async () => true),
      bulk: jest.fn(async (_a, ids) => ({
        success: ids.length,
        failed: 0,
        total: ids.length,
        errors: [],
        message: 'ok',
      })),
    };
    controller = new TestController(service);
  });

  // ─────────────────────────────────────────────────────────
  // 1) Route metadata
  // ─────────────────────────────────────────────────────────
  describe('route metadata (api-client contract)', () => {
    it('exposes GET / (list)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'list');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/');
    });

    it('exposes GET /:id (getById)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'getById');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/:id');
    });

    it('exposes POST / (create)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'create');
      expect(r?.method).toBe('POST');
      expect(r?.path).toBe('/');
    });

    it('exposes PUT /:id (update)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'update');
      expect(r?.method).toBe('PUT');
      expect(r?.path).toBe('/:id');
    });

    it('exposes DELETE /:id (softDelete)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'softDelete');
      expect(r?.method).toBe('DELETE');
      expect(r?.path).toBe('/:id');
    });

    it('exposes POST /:id/restore (restore)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'restore');
      expect(r?.method).toBe('POST');
      expect(r?.path).toBe('/:id/restore');
    });

    it('exposes DELETE /:id/hard (hardDelete)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'hardDelete');
      expect(r?.method).toBe('DELETE');
      expect(r?.path).toBe('/:id/hard');
    });

    it('exposes DELETE /:id/hard-delete (alias cho api-client.purge)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'hardDeleteAlias');
      expect(r?.method).toBe('DELETE');
      expect(r?.path).toBe('/:id/hard-delete');
    });

    it('exposes POST /bulk (bulk)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'bulk');
      expect(r?.method).toBe('POST');
      expect(r?.path).toBe('/bulk');
    });
  });

  // ─────────────────────────────────────────────────────────
  // 2) Envelope + happy path
  // ─────────────────────────────────────────────────────────
  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('list trả về success envelope với paginated data', async () => {
      const result = await controller.list({});
      expect(result).toEqual({
        success: true,
        message: expect.any(String),
        error: null,
        data: {
          data: [sampleRow],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      });
    });

    it('getById trả về success envelope với row', async () => {
      const result = await controller.getById('1');
      expect(result.success).toBe(true);
      expect((result.data as TestRow).id).toBe(1);
    });

    it('create trả về success envelope', async () => {
      const result = await controller.create({ title: 'new' } as Record<string, unknown>);
      expect(result.success).toBe(true);
      expect((result.data as TestRow).title).toBe('new');
    });

    it('update trả về success envelope', async () => {
      const result = await controller.update('1', { title: 'updated' } as Record<string, unknown>);
      expect(result.success).toBe(true);
      expect((result.data as TestRow).title).toBe('updated');
    });

    it('softDelete trả về success envelope với nested success/message', async () => {
      const result = await controller.softDelete('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: expect.any(String) });
    });

    it('restore trả về success envelope với nested success/message', async () => {
      const result = await controller.restore('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: expect.any(String) });
    });

    it('hardDelete trả về success envelope', async () => {
      const result = await controller.hardDelete('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: expect.any(String) });
    });

    it('hardDeleteAlias (DELETE :id/hard-delete) trả về cùng envelope', async () => {
      const result = await controller.hardDeleteAlias('1');
      expect(result.success).toBe(true);
    });

    it('bulk trả về success envelope với BulkOperationResult', async () => {
      const result = await controller.bulk({ action: 'delete', ids: ['1', '2'] });
      expect(result.success).toBe(true);
      const data = result.data as BulkOperationResult;
      expect(data.total).toBe(2);
      expect(data.failed).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 3) Query contract
  // ─────────────────────────────────────────────────────────
  describe('query contract (api-client.buildAdminListQuery)', () => {
    it('maps page/limit/search/status sang ListCrudParams', async () => {
      await controller.list({ page: '2', limit: '25', search: 'foo', status: 'deleted' });
      expect(service.list).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
        search: 'foo',
        status: 'deleted',
        filters: {},
      });
    });

    it('maps filter[column] sang filters object', async () => {
      await controller.list({
        'filter[isActive]': 'true',
        'filter[authorId]': '5',
      });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: {
          isActive: 'true',
          authorId: '5',
        },
      });
    });

    it('bỏ filter[empty]', async () => {
      await controller.list({
        'filter[isActive]': '',
        'filter[authorId]': '5',
      });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: { authorId: '5' },
      });
    });

    it('status invalid → fallback active', async () => {
      await controller.list({ status: 'invalid' });
      expect(service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        filters: {},
      });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 4) Error contract
  // ─────────────────────────────────────────────────────────
  describe('error contract', () => {
    it('invalid id throws BadRequestException', async () => {
      await expect(controller.getById('0')).rejects.toThrow(BadRequestException);
      await expect(controller.getById('abc')).rejects.toThrow(BadRequestException);
      await expect(controller.getById('')).rejects.toThrow(BadRequestException);
    });

    it('getById not-found throws NotFoundException với error envelope', async () => {
      service.getById.mockResolvedValueOnce(null);
      try {
        await controller.getById('1');
        throw new Error('expected NotFoundException');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        const body = (e as NotFoundException).getResponse() as { success: boolean; error: string };
        expect(body.success).toBe(false);
        expect(typeof body.error).toBe('string');
      }
    });

    it('update not-found throws NotFoundException', async () => {
      service.update.mockResolvedValueOnce(null);
      await expect(controller.update('1', { title: 'x' } as Record<string, unknown>)).rejects.toThrow(NotFoundException);
    });

    it('softDelete not-found throws NotFoundException', async () => {
      service.softDelete.mockResolvedValueOnce(false);
      await expect(controller.softDelete('1')).rejects.toThrow(NotFoundException);
    });

    it('restore not-found throws NotFoundException', async () => {
      service.restore.mockResolvedValueOnce(false);
      await expect(controller.restore('1')).rejects.toThrow(NotFoundException);
    });

    it('hardDelete not-found throws NotFoundException', async () => {
      service.hardDelete.mockResolvedValueOnce(false);
      await expect(controller.hardDelete('1')).rejects.toThrow(NotFoundException);
    });

    it('hardDeleteAlias not-found throws NotFoundException', async () => {
      service.hardDelete.mockResolvedValueOnce(false);
      await expect(controller.hardDeleteAlias('1')).rejects.toThrow(NotFoundException);
    });

    it('bulk invalid action throws BadRequestException', async () => {
      await expect(controller.bulk({ action: 'invalid', ids: ['1'] })).rejects.toThrow(BadRequestException);
    });

    it('bulk empty ids throws BadRequestException', async () => {
      await expect(controller.bulk({ action: 'delete', ids: [] })).rejects.toThrow(BadRequestException);
    });

    it('bulk non-array ids throws BadRequestException', async () => {
      await expect(
        controller.bulk({ action: 'delete', ids: 'not-array' as unknown as Array<string> }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 5) Pagination shape
  // ─────────────────────────────────────────────────────────
  describe('pagination shape (api-client.normalizePagedResult)', () => {
    it('data.pagination có đủ 4 field', async () => {
      const result = await controller.list({});
      const data = result.data as PaginatedResult<TestRow>;
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('data.data là array', async () => {
      const result = await controller.list({});
      const data = result.data as PaginatedResult<TestRow>;
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
`;

// Special spec cho users.controller.ts (Express-style, không extend BaseCrudController)
const USERS_SPEC = `/**
 * Controller spec cho BaseUsersController.
 *
 * Sinh tự động bởi \`generate-controller-specs.cjs\`. Mục tiêu:
 *   - Cover tất cả nhánh của users.controller.ts.
 *   - Validate contract mà \`packages/api-client.users\` đang dùng:
 *     list/getById/create/update/softDelete/restore/hardDelete/bulk.
 *
 * Note: \`BaseUsersController\` không extend \`BaseCrudController\`. Mỗi
 * handler nhận \`@Res() res\` rồi gọi \`res.status(...).json(...)\`. Spec
 * này dùng fake Express response (status jest.fn → json jest.fn).
 */
import 'reflect-metadata';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { BaseUsersController, CreateUserDto, UpdateUserDto, BulkActionDto } from './users.controller';

function makeRes() {
  const statusMock = jest.fn().mockReturnThis();
  const jsonMock = jest.fn();
  const res: any = { status: statusMock, json: jsonMock };
  return { res, statusMock, jsonMock };
}

function getRoutes(ctrl: object): Array<{ method: string; path: string; handler: string }> {
  const out: Array<{ method: string; path: string; handler: string }> = [];
  const VERB_MAP: Record<number, string> = {
    0: 'GET', 1: 'POST', 2: 'PUT', 3: 'DELETE', 4: 'PATCH',
    5: 'HEAD', 6: 'SEARCH', 7: 'ALL', 9: 'OPTIONS',
  };
  const seen = new Set<string>();
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor' || seen.has(name)) continue;
      seen.add(name);
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      if (!desc) continue;
      const handler = desc.value as (...a: unknown[]) => unknown;
      if (typeof handler !== 'function') continue;
      const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      if (typeof verb !== 'number') continue;
      const verbName = VERB_MAP[verb];
      if (!verbName) continue;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as
        | string
        | string[]
        | undefined;
      if (pathMeta == null) continue;
      const normalized = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta;
      const cleanPath = normalized === '' ? '/' : \`/\${String(normalized).replace(/^\\//, '')}\`;
      out.push({ method: verbName, path: cleanPath, handler: name });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

class TestUsersService {
  list = jest.fn();
  getById = jest.fn();
  getOptions = jest.fn();
  create = jest.fn();
  update = jest.fn();
  softDelete = jest.fn();
  restore = jest.fn();
  hardDelete = jest.fn();
  bulk = jest.fn();
  listDevelopmentLoginOptions = jest.fn();
  resolveActorEmail = jest.fn();
}

describe('BaseUsersController — client contract', () => {
  let controller: BaseUsersController;
  let service: TestUsersService;

  beforeEach(() => {
    service = new TestUsersService();
    controller = new BaseUsersController(service as never);
  });

  // ─────────────────────────────────────────────────────────
  // 1) Route metadata
  // ─────────────────────────────────────────────────────────
  describe('route metadata', () => {
    it('exposes tất cả handler mà api-client.users dùng', () => {
      const handlers = new Set(getRoutes(controller).map((r) => r.handler));
      for (const h of [
        'list',
        'getById',
        'create',
        'update',
        'softDelete',
        'restore',
        'hardDelete',
        'bulk',
        'options',
        'devLoginOptions',
      ]) {
        expect(handlers.has(h)).toBe(true);
      }
    });

    it('softDelete: DELETE', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'softDelete');
      expect(r?.method).toBe('DELETE');
    });

    it('restore: POST', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'restore');
      expect(r?.method).toBe('POST');
    });

    it('hardDelete: DELETE', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'hardDelete');
      expect(r?.method).toBe('DELETE');
    });

    it('bulk: POST', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'bulk');
      expect(r?.method).toBe('POST');
    });

    it('list: GET (root)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'list');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/');
    });

    it('getById: GET (/:id)', () => {
      const r = getRoutes(controller).find((x) => x.handler === 'getById');
      expect(r?.method).toBe('GET');
      expect(r?.path).toBe('/:id');
    });
  });

  // ─────────────────────────────────────────────────────────
  // 2) Helper envelopes
  // ─────────────────────────────────────────────────────────
  describe('envelope helpers', () => {
    it('createSuccessResponse mặc định statusCode 200 + body success', () => {
      const res = (controller as any).createSuccessResponse({ x: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ x: 1 });
    });

    it('createSuccessResponse cho phép override statusCode', () => {
      const res = (controller as any).createSuccessResponse({ x: 1 }, { statusCode: 201 });
      expect(res.statusCode).toBe(201);
    });

    it('createErrorResponse mặc định statusCode 500 + code INTERNAL_ERROR', () => {
      const res = (controller as any).createErrorResponse('Boom');
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('INTERNAL_ERROR');
      expect(res.body.error?.message).toBe('Boom');
    });

    it('createErrorResponse override code + statusCode + details', () => {
      const res = (controller as any).createErrorResponse('Boom', {
        statusCode: 400,
        code: 'BAD_REQUEST',
        details: { field: 'email' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error?.code).toBe('BAD_REQUEST');
      expect(res.body.error?.details).toEqual({ field: 'email' });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 3) parseListStatus
  // ─────────────────────────────────────────────────────────
  describe('parseListStatus', () => {
    it('valid status: active/deleted/all', () => {
      expect((controller as any).parseListStatus('active')).toBe('active');
      expect((controller as any).parseListStatus('deleted')).toBe('deleted');
      expect((controller as any).parseListStatus('all')).toBe('all');
    });

    it('invalid/undefined → active', () => {
      expect((controller as any).parseListStatus('invalid')).toBe('active');
      expect((controller as any).parseListStatus(undefined)).toBe('active');
      expect((controller as any).parseListStatus('')).toBe('active');
    });
  });

  // ─────────────────────────────────────────────────────────
  // 4) parseFilters (logic dùng cho list query)
  // ─────────────────────────────────────────────────────────
  describe('parseFilters', () => {
    it('parse filter[col] keys', () => {
      const out = (controller as any).parseFilters({ 'filter[isActive]': 'true' });
      expect(out).toEqual({ isActive: 'true' });
    });

    it('ignore non filter[] keys', () => {
      const out = (controller as any).parseFilters({ plain: 'x' });
      expect(out).toEqual({});
    });

    it('ignore empty values', () => {
      const out = (controller as any).parseFilters({ 'filter[a]': '' });
      expect(out).toEqual({});
    });

    it('array value lấy phần tử đầu', () => {
      const out = (controller as any).parseFilters({
        'filter[a]': ['1', '2'] as never,
      });
      expect(out).toEqual({ a: '1' });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 5) isBulkAction
  // ─────────────────────────────────────────────────────────
  describe('isBulkAction', () => {
    it('true cho 5 action hợp lệ', () => {
      for (const a of ['delete', 'restore', 'hard-delete', 'active', 'unactive']) {
        expect((controller as any).isBulkAction(a)).toBe(true);
      }
    });

    it('false cho action khác', () => {
      expect((controller as any).isBulkAction('whatever')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 6) list endpoint
  // ─────────────────────────────────────────────────────────
  describe('list endpoint', () => {
    it('401 khi thiếu X-User-Id header', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).list(res, undefined, undefined, undefined, undefined, undefined, undefined);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('trả về paginated data envelope khi có header', async () => {
      service.list.mockResolvedValueOnce({
        data: [{ id: 'u1', email: 'a@b.c' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      } as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).list(
        res,
        'admin-id',
        '1',
        '10',
        'foo',
        'active',
        { 'filter[isActive]': 'true' } as never,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      const body = jsonMock.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.data).toEqual({
        data: [{ id: 'u1', email: 'a@b.c' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it('chuyển page/limit/search/status + filters cho service', async () => {
      service.list.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      } as never);
      const { res } = makeRes();
      await (controller as any).list(
        res,
        'admin',
        '2',
        '25',
        'foo',
        'deleted',
        { 'filter[isActive]': 'true' } as never,
      );
      expect(service.list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 25,
          search: 'foo',
          status: 'deleted',
          filters: { isActive: 'true' },
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // 7) options endpoint
  // ─────────────────────────────────────────────────────────
  describe('options endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).options(res, undefined, 'title', undefined, '10');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('trả về options khi có header', async () => {
      service.getOptions.mockResolvedValueOnce([{ label: 'A', value: 'a' }] as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).options(res, 'admin', 'title', 'foo', '50');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual([{ label: 'A', value: 'a' }]);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 8) devLoginOptions
  // ─────────────────────────────────────────────────────────
  describe('devLoginOptions endpoint', () => {
    it('trả về options thành công', async () => {
      service.listDevelopmentLoginOptions.mockResolvedValueOnce([{ id: '1' }] as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).devLoginOptions(res, 'admin', 'foo');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual([{ id: '1' }]);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 9) getById
  // ─────────────────────────────────────────────────────────
  describe('getById endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });

    it('trả về user khi tìm thấy', async () => {
      service.getById.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' } as never);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({ id: 'u1', email: 'a@b.c' });
    });

    it('404 khi không tìm thấy', async () => {
      service.getById.mockResolvedValueOnce(null);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).getById(res, 'admin', 'missing');
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock.mock.calls[0][0].success).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 10) create
  // ─────────────────────────────────────────────────────────
  describe('create endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).create(res, undefined, {} as never);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu email', async () => {
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = '';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('400 khi thiếu password', async () => {
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = '';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('trả về 201 khi tạo thành công', async () => {
      service.create.mockResolvedValueOnce({ id: 'new', email: 'a@b.c' } as never);
      const { res, statusMock, jsonMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock.mock.calls[0][0].data).toEqual({ id: 'new', email: 'a@b.c' });
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      await (controller as any).create(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 11) update
  // ─────────────────────────────────────────────────────────
  describe('update endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).update(res, undefined, 'u1', {} as never);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).update(res, 'admin', undefined, {} as never);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('trả về 200 khi update thành công', async () => {
      service.update.mockResolvedValueOnce({ id: 'u1', email: 'new@b.c' } as never);
      const { res, statusMock, jsonMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({ id: 'u1', email: 'new@b.c' });
    });

    it('404 khi service trả về null', async () => {
      service.update.mockResolvedValueOnce(null);
      const { res, statusMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.resolveActorEmail.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      await (controller as any).update(res, 'admin', 'u1', dto);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 12) bulk
  // ─────────────────────────────────────────────────────────
  describe('bulk endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1'];
      await (controller as any).bulk(res, undefined, dto);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu action', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = '' as never;
      dto.ids = ['1'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('400 khi ids rỗng', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = [];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('400 khi action không hợp lệ', async () => {
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'whatever';
      dto.ids = ['1'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('trả về 200 khi bulk thành công', async () => {
      service.bulk.mockResolvedValueOnce({
        success: 2,
        failed: 0,
        total: 2,
        errors: [],
        message: 'ok',
      } as never);
      const { res, statusMock, jsonMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1', '2'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: 2,
        failed: 0,
        total: 2,
        errors: [],
        message: 'ok',
      });
    });

    it('500 khi service throw lỗi', async () => {
      service.bulk.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1'];
      await (controller as any).bulk(res, 'admin', dto);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 13) softDelete
  // ─────────────────────────────────────────────────────────
  describe('softDelete endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('200 khi thành công', async () => {
      service.softDelete.mockResolvedValueOnce(true);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: true,
        message: 'Xóa người dùng thành công',
      });
    });

    it('200 với success=false khi service trả về false', async () => {
      service.softDelete.mockResolvedValueOnce(false);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data.success).toBe(false);
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.softDelete.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.softDelete.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      await (controller as any).softDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 14) restore
  // ─────────────────────────────────────────────────────────
  describe('restore endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).restore(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).restore(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('200 khi thành công', async () => {
      service.restore.mockResolvedValueOnce(true);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).restore(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: true,
        message: 'Khôi phục người dùng thành công',
      });
    });

    it('200 success=false khi service trả về false', async () => {
      service.restore.mockResolvedValueOnce(false);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).restore(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data.success).toBe(false);
    });

    it('500 khi service throw', async () => {
      service.restore.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      await (controller as any).restore(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 15) hardDelete
  // ─────────────────────────────────────────────────────────
  describe('hardDelete endpoint', () => {
    it('401 khi thiếu header', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, undefined, 'u1');
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('400 khi thiếu id', async () => {
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', undefined);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('200 khi thành công', async () => {
      service.hardDelete.mockResolvedValueOnce(true);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data).toEqual({
        success: true,
        message: 'Xóa vĩnh viễn người dùng thành công',
      });
    });

    it('200 success=false khi service trả về false', async () => {
      service.hardDelete.mockResolvedValueOnce(false);
      const { res, statusMock, jsonMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock.mock.calls[0][0].data.success).toBe(false);
    });

    it('403 khi service throw ForbiddenException', async () => {
      service.hardDelete.mockRejectedValueOnce(new ForbiddenException('forbidden'));
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('500 khi service throw lỗi khác', async () => {
      service.hardDelete.mockRejectedValueOnce(new Error('boom'));
      const { res, statusMock } = makeRes();
      await (controller as any).hardDelete(res, 'admin', 'u1');
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 16) DTO classes
  // ─────────────────────────────────────────────────────────
  describe('DTOs', () => {
    it('CreateUserDto là class hợp lệ (gán được field)', () => {
      const dto = new CreateUserDto();
      dto.email = 'a@b.c';
      dto.password = 'p';
      expect(dto.email).toBe('a@b.c');
      expect(dto.password).toBe('p');
    });

    it('UpdateUserDto là class hợp lệ', () => {
      const dto = new UpdateUserDto();
      dto.email = 'new@b.c';
      expect(dto.email).toBe('new@b.c');
    });

    it('BulkActionDto là class hợp lệ', () => {
      const dto = new BulkActionDto();
      dto.action = 'delete';
      dto.ids = ['1'];
      expect(dto.action).toBe('delete');
      expect(dto.ids).toEqual(['1']);
    });
  });
});
`;

// ──────────────────────────────────────────────────────────────
// 47 module controllers + 1 users (special)
// ──────────────────────────────────────────────────────────────

const MODULE_CONTROLLERS = [
  ['academic-years', 'AcademicYear', 'BaseAcademicYearsController', 'academic-year.controller'],
  ['accounts', 'Account', 'BaseAccountsController', 'account.controller'],
  ['admission-results', 'AdmissionResult', 'BaseAdmissionResultsController', 'admission-result.controller'],
  ['cameras', 'Camera', 'BaseCamerasController', 'camera.controller'],
  ['categories', 'Category', 'BaseCategoriesController', 'categories.controller'],
  ['comments', 'Comment', 'BaseCommentsController', 'comments.controller'],
  ['contact-requests', 'ContactRequest', 'BaseContactRequestsController', 'contact-request.controller'],
  ['courses', 'Course', 'BaseCoursesController', 'course.controller'],
  ['customer-carts', 'CustomerCart', 'BaseCustomerCartsController', 'customer-cart.controller'],
  ['departments', 'Department', 'BaseDepartmentsController', 'department.controller'],
  ['event-checkins', 'EventCheckin', 'BaseEventCheckinsController', 'event-checkin.controller'],
  ['event-registrations', 'EventRegistration', 'BaseEventRegistrationsController', 'event-registration.controller'],
  ['event-speakers', 'EventSpeaker', 'BaseEventSpeakersController', 'event-speaker.controller'],
  ['events', 'Event', 'BaseEventsController', 'event.controller'],
  ['face-data', 'FaceData', 'BaseFaceDatasController', 'face-data.controller'],
  ['group-members', 'GroupMember', 'BaseGroupMembersController', 'group-member.controller'],
  ['groups', 'Group', 'BaseGroupsController', 'group.controller'],
  ['imported-users', 'ImportedUser', 'BaseImportedUsersController', 'imported-user.controller'],
  ['locations', 'Location', 'BaseLocationsController', 'location.controller'],
  ['majors', 'Major', 'BaseMajorsController', 'major.controller'],
  ['message-reads', 'MessageRead', 'BaseMessageReadsController', 'message-read.controller'],
  ['messages', 'Message', 'BaseMessagesController', 'message.controller'],
  ['notifications', 'Notification', 'BaseNotificationsController', 'notification.controller'],
  ['orders', 'Order', 'BaseOrdersController', 'order.controller'],
  ['page-contents', 'PageContent', 'BasePageContentsController', 'page-content.controller'],
  ['parent-students', 'ParentStudent', 'BaseParentStudentsController', 'parent-student.controller'],
  ['post-categories', 'PostCategory', 'BasePostCategoriesController', 'post-category.controller'],
  ['post-tags', 'PostTag', 'BasePostTagsController', 'post-tag.controller'],
  ['posts', 'Post', 'BasePostsController', 'posts.controller'],
  ['products', 'Product', 'BaseProductsController', 'product.controller'],
  ['promo-codes', 'PromoCode', 'BasePromoCodesController', 'promo-code.controller'],
  ['roles', 'Role', 'BaseRolesController', 'role.controller'],
  ['screens', 'Screen', 'BaseScreensController', 'screen.controller'],
  ['seo-metas', 'SeoMeta', 'BaseSeoMetasController', 'seo-meta.controller'],
  ['sessions', 'Session', 'BaseSessionsController', 'session.controller'],
  ['settings', 'Setting', 'BaseSettingsController', 'setting.controller'],
  ['speakers', 'Speaker', 'BaseSpeakersController', 'speaker.controller'],
  ['storage-files', 'StorageFile', 'BaseStorageFilesController', 'storage-file.controller'],
  ['students', 'Student', 'BaseStudentsController', 'student.controller'],
  ['tags', 'Tag', 'BaseTagsController', 'tag.controller'],
  ['templates', 'Template', 'BaseTemplatesController', 'template.controller'],
  ['training-levels', 'TrainingLevel', 'BaseTrainingLevelsController', 'training-level.controller'],
  ['training-systems', 'TrainingSystem', 'BaseTrainingSystemsController', 'training-system.controller'],
  ['user-roles', 'UserRole', 'BaseUserRolesController', 'user-role.controller'],
  ['verification-tokens', 'VerificationToken', 'BaseVerificationTokensController', 'verification-token.controller'],
];

let generated = 0;
let skipped = 0;

function safeRead(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function detectImports(content) {
  // Phát hiện các class exported cần import
  const m = content.match(/^export\s+class\s+(\w+)/gm) || [];
  return m.map((x) => x.replace(/^export\s+class\s+/, ''));
}

for (const [module, entity, cls, ctrlFile] of MODULE_CONTROLLERS) {
  const ctrlPath = path.join(MODULES_DIR, module, ctrlFile + '.ts');
  if (!fs.existsSync(ctrlPath)) {
    console.warn(`[skip] missing controller file: ${ctrlPath}`);
    skipped++;
    continue;
  }
  const content = safeRead(ctrlPath);
  if (!content) {
    skipped++;
    continue;
  }
  const imports = detectImports(content);
  if (!imports.includes(cls)) {
    console.warn(`[skip] class ${cls} not found in ${ctrlFile}.ts`);
    skipped++;
    continue;
  }
  const ctrlBaseName = ctrlFile;
  const specPath = path.join(MODULES_DIR, module, `${ctrlFile}.spec.ts`);
  const specContent = TEMPLATE({
    entity,
    cls,
    imports,
    ctrlBaseName,
  });
  fs.writeFileSync(specPath, specContent, 'utf8');
  generated++;
  console.log(`[gen ] ${path.relative(__dirname, specPath)}`);
}

// Special: users.controller.ts (Express-style, không extend BaseCrudController) — ghi đè riêng
const usersSpecPath = path.join(MODULES_DIR, 'users', 'users.controller.spec.ts');
fs.writeFileSync(usersSpecPath, USERS_SPEC, 'utf8');
generated++;
console.log(`[gen ] ${path.relative(__dirname, usersSpecPath)}`);

console.log(`\nDone: ${generated} generated, ${skipped} skipped.`);
