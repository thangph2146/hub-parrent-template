/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** CRUD runtime — template local (pnpm api:sync-template). */
/** CRUD admin chuẩn — kế thừa trong template, không import package. */
import { Injectable } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { toEntityId, toEntityIdList } from '../entity-id';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
} from '../pagination';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../bulk-actions';
import {
  buildStandardAdminWhere,
  type AdminColumnFiltersConfig,
} from './crud-apply-column-filters';

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
  TListResult extends StandardAdminListResult<TRow> =
    StandardAdminListResult<TRow>,
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
    where.$or = fields.map((field) => ({ [field]: { $like: `%${q}%` } }));
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

  async bulk(
    action: BulkAction,
    ids: Array<number | string>,
  ): Promise<BulkResult> {
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
