/**
 * Vend lớp kế thừa CRUD local vào template (src/common/crud/) — nguồn @workspace/api-server, không hub-event.
 */
const fs = require('node:fs')
const path = require('node:path')
const { PACKAGE_ROOT } = require('../monorepo-root.cjs')
const { resolveTemplateRoot } = require('../../../config/template.config.cjs')
const { createLogger } = require('../cli-logger.cjs')

const PKG_BASES = path.join(PACKAGE_ROOT, 'src/bases')
const PKG_COMMON = path.join(PACKAGE_ROOT, 'src/common')

const CRUD_BANNER = '/** CRUD runtime — template local (pnpm api:sync-template). */\n'

/** Production files do sync tạo — spec giữ lại cho contract sync. */
const CRUD_RUNTIME_FILES = new Set([
  'base-admin-crud.controller.ts',
  'base-admin-http.controller.ts',
  'base-crud.controller.ts',
  'base-crud.service.ts',
  'base-standard-admin-crud.service.ts',
  'build-admin-list-params.ts',
  'common.types.ts',
  'crud.types.ts',
  'crud-apply-column-filters.ts',
  'crud-date.ts',
  'index.ts',
])

const CRUD_TYPES_STUB = `${CRUD_BANNER}/** Re-export — single source: src/common/module-types/. */
export * from '../module-types/crud.types';
export type { PaginatedResult } from '../module-types/user.types';
`

const COMMON_TYPES_STUB = `${CRUD_BANNER}/** Re-export — single source: src/common/module-types/. */
export * from '../module-types/common.types';
`

const CRUD_DATE_STUB = `${CRUD_BANNER}/** Alias date helpers cho BaseCrudService vend. */
export { safeIsoString as toIso, safeIsoStringNow as toIsoNow } from '../date-utils';
`

function stripGeneratedBanner(content) {
  return content.replace(/^\/\*\* AUTO-GENERATED[\s\S]*?\*\/\n/m, '')
}

function withCrudBanner(content) {
  return CRUD_BANNER + stripGeneratedBanner(content).replace(/^\s*\n/, '')
}

function writeCrudFile(destRoot, name, content) {
  const dir = path.join(destRoot, 'src/common/crud')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, name), content.replace(/\r\n/g, '\n'), 'utf8')
}

function rewriteBaseCrudController(content) {
  return withCrudBanner(
    content
      .replace(/from '\.\.\/types'/g, "from './crud.types'")
      .replace(/from '\.\.\/types\/crud\.types'/g, "from './crud.types'")
      .replace(
        /import \{\s*createSuccessResponse,\s*createErrorResponse,\s*parseListQuery,\s*isBulkAction,\s*Permissions,\s*parseEntityId,\s*type ApiResponsePayload,\s*type BulkAction,\s*\} from '\.\.\/(?:common|api-response)';/,
        `import { createSuccessResponse, createErrorResponse, type ApiResponsePayload } from '../api-response';
import { parseListQuery } from '../parse-list-query';
import { isBulkAction, type BulkAction } from '../bulk-actions';
import { Permissions } from '../permissions.decorator';
import { parseEntityId } from '../entity-id';`,
      ),
  )
}

function rewriteBaseCrudService(content) {
  return withCrudBanner(
    content
      .replace(/from '\.\.\/types'/g, "from './crud.types'")
      .replace(
        /import \{\s*normalizePageLimit,\s*paginationMeta,\s*toEntityId,\s*toEntityIdList,\s*toIso,\s*toIsoNow,\s*applyBulkAction,\s*buildStandardAdminWhere,\s*isBulkAction,\s*type AdminColumnFiltersConfig,\s*type BulkAction,\s*\} from '\.\.\/common';/,
        `import { normalizePageLimit, paginationMeta } from '../pagination';
import { toEntityId, toEntityIdList } from '../entity-id';
import { toIso, toIsoNow } from './crud-date';
import { applyBulkAction, isBulkAction, type BulkAction } from '../bulk-actions';
import {
  buildStandardAdminWhere,
  type AdminColumnFiltersConfig,
} from './crud-apply-column-filters';`,
      ),
  )
}

function pruneStaleCrudRuntimeFiles(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const dir = path.join(destRoot, 'src/common/crud')
  if (!fs.existsSync(dir)) return 0

  let removed = 0
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.ts')) continue
    if (file.endsWith('.spec.ts')) continue
    if (CRUD_RUNTIME_FILES.has(file)) continue
    fs.unlinkSync(path.join(dir, file))
    removed++
    log.detail('sync:crud', `removed stale src/common/crud/${file}`)
  }
  return removed
}

const BASE_STANDARD_ADMIN_SERVICE = `${CRUD_BANNER}/** CRUD admin chuẩn — kế thừa trong template, không import package. */
import { Injectable } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { toEntityId, toEntityIdList } from '../entity-id';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
} from '../pagination';
import { applyBulkAction, type BulkAction, type BulkResult } from '../bulk-actions';
import { buildStandardAdminWhere, type AdminColumnFiltersConfig } from './crud-apply-column-filters';

function backfillLegacyAuditTimestampsIfMissing(_row: object): boolean {
  return false;
}

export type StandardAdminListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  statusFilter?: number;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  deletedAtFrom?: string;
  deletedAtTo?: string;
  filters?: Record<string, string>;
};

export type StandardAdminListResult<TRow> = {
  data: TRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export abstract class BaseStandardAdminCrudService<
  TEntity extends object,
  TRow,
  TListParams extends StandardAdminListParams = StandardAdminListParams,
  TListResult extends StandardAdminListResult<TRow> = StandardAdminListResult<TRow>,
> {
  protected abstract getEm(): EntityManager;
  protected abstract getEntityClass(): new () => TEntity;
  protected abstract getSearchFields(): string[];
  protected abstract getColumnFiltersConfig(): AdminColumnFiltersConfig;
  protected abstract mapEntity(row: TEntity): TRow;

  protected applyDateRangeFilters(
    where: Record<string, unknown>,
    params: StandardAdminListParams,
  ): void {
    if (params.updatedAtFrom) {
      where.updatedAt = {
        ...(where.updatedAt ?? {}),
        $gte: new Date(params.updatedAtFrom),
      };
    }
    if (params.updatedAtTo) {
      where.updatedAt = {
        ...(where.updatedAt ?? {}),
        $lte: new Date(params.updatedAtTo),
      };
    }
    if (params.deletedAtFrom) {
      where.deletedAt = {
        ...(where.deletedAt ?? {}),
        $gte: new Date(params.deletedAtFrom),
      };
    }
    if (params.deletedAtTo) {
      where.deletedAt = {
        ...(where.deletedAt ?? {}),
        $lte: new Date(params.deletedAtTo),
      };
    }
  }

  protected applySearchFilter(
    where: Record<string, unknown>,
    search: string | undefined,
  ): void {
    const q = search?.trim();
    if (!q) return;
    const fields = this.getSearchFields();
    if (!fields.length) return;
    where.$or = fields.map((field) => ({ [field]: { $like: \`%\${q}%\` } }));
  }

  async list(params: TListParams): Promise<TListResult> {
    const status = params.status ?? 'active';
    const flatFilters: Record<string, string> = {};
    if (params.filters) {
      for (const [k, v] of Object.entries(params.filters)) {
        if (v != null && v !== '') flatFilters[k] = String(v);
      }
    }
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildStandardAdminWhere(
      flatFilters,
      this.getColumnFiltersConfig(),
      status,
    ) as Record<string, unknown>;
    this.applyDateRangeFilters(where, params);
    this.applySearchFilter(where, params.search);

    const Entity = this.getEntityClass();
    const qb = where as FilterQuery<TEntity>;
    const [rows, total] = await Promise.all([
      this.getEm().find(Entity, qb, {
        orderBy: { updatedAt: 'DESC' } as never,
        offset: skip,
        limit,
      }),
      this.getEm().count(Entity, qb),
    ]);

    return {
      data: rows.map((row) => this.mapEntity(row)),
      pagination: paginationMeta(page, limit, total),
    } as TListResult;
  }

  async getById(id: number | string): Promise<TRow | null> {
    const Entity = this.getEntityClass();
    const row = await this.getEm().findOne(Entity, {
      id: toEntityId(id),
    } as never);
    if (!row) return null;
    if (backfillLegacyAuditTimestampsIfMissing(row as object)) {
      await this.getEm().persistAndFlush(row);
    }
    return this.mapEntity(row);
  }

  async softDelete(id: number | string): Promise<boolean> {
    const Entity = this.getEntityClass();
    const row = await this.getEm().findOne(Entity, {
      id: toEntityId(id),
    } as never);
    if (!row || (row as { deletedAt?: unknown }).deletedAt) return false;
    (row as { deletedAt?: Date | null }).deletedAt = new Date();
    await this.getEm().persistAndFlush(row);
    return true;
  }

  async restore(id: number | string): Promise<boolean> {
    const Entity = this.getEntityClass();
    const row = await this.getEm().findOne(Entity, {
      id: toEntityId(id),
    } as never);
    if (!row || !(row as { deletedAt?: unknown }).deletedAt) return false;
    (row as { deletedAt?: Date | null }).deletedAt = null;
    await this.getEm().persistAndFlush(row);
    return true;
  }

  async hardDelete(id: number | string): Promise<boolean> {
    const Entity = this.getEntityClass();
    const row = await this.getEm().findOne(Entity, {
      id: toEntityId(id),
    } as never);
    if (!row) return false;
    await this.getEm().removeAndFlush(row);
    return true;
  }

  async bulk(action: BulkAction, ids: Array<number | string>): Promise<BulkResult> {
    const Entity = this.getEntityClass();
    return applyBulkAction(
      this.getEm(),
      Entity as never,
      action,
      toEntityIdList(ids.map(String)),
      { label: 'bản ghi' },
    );
  }
}
`

const INDEX_TS = `${CRUD_BANNER}/** Barrel CRUD runtime — kế thừa local trong template NestJS. */
export { BaseStandardAdminCrudService } from './base-standard-admin-crud.service';
export type {
  StandardAdminListParams,
  StandardAdminListResult,
} from './base-standard-admin-crud.service';
export { BaseAdminHttpController } from './base-admin-http.controller';
export {
  BaseAdminCrudController,
  type AdminCrudControllerConfig,
  type IAdminCrudControllerService,
} from './base-admin-crud.controller';
export { buildAdminListCrudParams, type AdminListQueryInput } from './build-admin-list-params';
export { BaseCrudService } from './base-crud.service';
export {
  BaseCrudController,
  type ICrudControllerService,
} from './base-crud.controller';
export type {
  CrudRowDto,
  ListCrudParams,
  BulkOperationResult,
} from './crud.types';
`

function syncCrudRuntime(templateRoot = resolveTemplateRoot(), options = {}) {
  const log = options.log ?? createLogger(options)
  const moduleTypesDir = path.join(templateRoot, 'src/common/module-types')
  if (!fs.existsSync(moduleTypesDir)) {
    throw new Error(
      '[sync:crud] Thiếu src/common/module-types — gọi syncModuleTypes trước syncCrudRuntime',
    )
  }

  writeCrudFile(templateRoot, 'crud.types.ts', CRUD_TYPES_STUB)
  writeCrudFile(templateRoot, 'common.types.ts', COMMON_TYPES_STUB)
  writeCrudFile(templateRoot, 'crud-date.ts', CRUD_DATE_STUB)

  const applyColumnFilters = withCrudBanner(
    fs.readFileSync(path.join(PKG_COMMON, 'apply-column-filters.ts'), 'utf8'),
  )
  writeCrudFile(templateRoot, 'crud-apply-column-filters.ts', applyColumnFilters)

  const baseCrudService = rewriteBaseCrudService(
    fs.readFileSync(path.join(PKG_BASES, 'base-crud.service.ts'), 'utf8'),
  )
  writeCrudFile(templateRoot, 'base-crud.service.ts', baseCrudService)

  const adminHttp = withCrudBanner(
    fs
      .readFileSync(path.join(PKG_BASES, 'base-admin-http.controller.ts'), 'utf8')
      .replace("from '../config'", "from '../../config/constants'")
      .replace("from '../common'", "from '../api-response'"),
  )

  const adminCrud = withCrudBanner(
    fs
      .readFileSync(path.join(PKG_BASES, 'base-admin-crud.controller.ts'), 'utf8')
      .replace(
        /import \{\s*isBulkAction,\s*buildAdminListCrudParams,\s*type AdminListQueryInput,\s*(?:type BulkAction,\s*)?type BulkResult,\s*\} from '\.\.\/common';/,
        `import { isBulkAction, type BulkResult } from '../bulk-actions';
import { buildAdminListCrudParams, type AdminListQueryInput } from './build-admin-list-params';`,
      )
      .replace("from '../common'", "from '../bulk-actions'"),
  )

  const buildParams = withCrudBanner(
    fs
      .readFileSync(path.join(PKG_COMMON, 'build-admin-list-params.ts'), 'utf8')
      .replace("from '../types/crud.types'", "from './crud.types'")
      .replace("from './parse-column-filters'", "from '../parse-column-filters'")
      .replace("from './parse-list-query'", "from '../parse-list-query'"),
  )

  writeCrudFile(templateRoot, 'base-admin-http.controller.ts', adminHttp)
  writeCrudFile(templateRoot, 'base-admin-crud.controller.ts', adminCrud)

  const baseCrudController = rewriteBaseCrudController(
    fs.readFileSync(path.join(PKG_BASES, 'base-crud.controller.ts'), 'utf8'),
  )
  writeCrudFile(templateRoot, 'base-crud.controller.ts', baseCrudController)

  writeCrudFile(templateRoot, 'build-admin-list-params.ts', buildParams)
  writeCrudFile(templateRoot, 'base-standard-admin-crud.service.ts', BASE_STANDARD_ADMIN_SERVICE)
  writeCrudFile(templateRoot, 'index.ts', INDEX_TS)

  const removed = pruneStaleCrudRuntimeFiles(templateRoot, { log, ...options })
  log.step('sync:crud', `runtime ← packages/api-server/src (stale removed=${removed})`)
}

module.exports = { syncCrudRuntime, CRUD_RUNTIME_FILES, pruneStaleCrudRuntimeFiles }
