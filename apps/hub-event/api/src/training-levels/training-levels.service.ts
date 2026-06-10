import { toEntityId, toEntityIdList } from '../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { TrainingLevel } from '../entities/training-level.entity';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../common/bulk-actions';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';
import { buildStandardAdminWhere } from '../common/apply-column-filters';
import { TRAINING_LEVEL_COLUMN_FILTERS } from '../common/admin-filter-configs';
import {
  backfillLegacyAuditTimestampsIfMissing,
  touchLegacyAuditTimestamps,
} from '../common/legacy-audit-timestamps';

export interface TrainingLevelRowDto {
  id: number;
  name: string;
  code: string | null;
  status: number;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListTrainingLevelsParams {
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
}

export interface ListTrainingLevelsResult {
  data: TrainingLevelRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toIsoString(
  value: Date | string | number | undefined | null,
): string | null {
  if (value == null) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === 'number')
    return Number.isNaN(value) ? null : new Date(value).toISOString();
  if (typeof value === 'string' && value.trim()) {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  }
  return null;
}

function mapRow(r: TrainingLevel): TrainingLevelRowDto {
  return {
    id: r.id,
    name: r.name,
    code: r.code ?? null,
    status: r.status,
    createdAt: toIsoString(r.createdAt),
    updatedAt: toIsoString(r.updatedAt),
    deletedAt: toIsoString(r.deletedAt),
  };
}

@Injectable()
export class TrainingLevelsService {
  constructor(private readonly em: EntityManager) {}

  async list(
    params: ListTrainingLevelsParams,
  ): Promise<ListTrainingLevelsResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildStandardAdminWhere({
      ...params,
      searchFields: ['name', 'code'],
      filterConfig: TRAINING_LEVEL_COLUMN_FILTERS,
    });
    const whereQuery = where as FilterQuery<TrainingLevel>;
    const [rows, total] = await Promise.all([
      this.em.find(TrainingLevel, whereQuery, {
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.em.count(TrainingLevel, whereQuery),
    ]);
    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<TrainingLevelRowDto | null> {
    const r = await this.em.findOne(TrainingLevel, { id: toEntityId(id) });
    if (!r) return null;
    if (backfillLegacyAuditTimestampsIfMissing(r)) {
      await this.em.persistAndFlush(r);
    }
    return mapRow(r);
  }

  async create(data: {
    name: string;
    code?: string | null;
    status?: number;
  }): Promise<TrainingLevelRowDto> {
    const created = new TrainingLevel();
    created.name = data.name;
    if (data.code !== undefined) created.code = data.code;
    if (data.status !== undefined) created.status = data.status;
    touchLegacyAuditTimestamps(created, true);
    await this.em.persistAndFlush(created);
    return mapRow(created);
  }

  async update(
    id: number,
    data: { name?: string; code?: string | null; status?: number },
  ): Promise<TrainingLevelRowDto | null> {
    const existing = await this.em.findOne(TrainingLevel, { id: toEntityId(id) });
    if (!existing) return null;
    if (data.name !== undefined) existing.name = data.name;
    if (data.code !== undefined) existing.code = data.code;
    if (data.status !== undefined) existing.status = data.status;
    touchLegacyAuditTimestamps(existing);
    await this.em.persistAndFlush(existing);
    return mapRow(existing);
  }

  async softDelete(id: number): Promise<boolean> {
    const r = await this.em.findOne(TrainingLevel, { id: toEntityId(id) });
    if (!r || r.deletedAt) return false;
    r.deletedAt = new Date();
    touchLegacyAuditTimestamps(r);
    await this.em.persistAndFlush(r);
    return true;
  }

  async restore(id: number): Promise<boolean> {
    const r = await this.em.findOne(TrainingLevel, { id: toEntityId(id) });
    if (!r || !r.deletedAt) return false;
    r.deletedAt = null;
    await this.em.persistAndFlush(r);
    return true;
  }

  async hardDelete(id: number): Promise<boolean> {
    const r = await this.em.findOne(TrainingLevel, { id: toEntityId(id) });
    if (!r) return false;
    await this.em.removeAndFlush(r);
    return true;
  }
  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    return applyBulkAction(this.em, TrainingLevel, action, ids, {
      label: 'bac hoc',
    });
  }
}
