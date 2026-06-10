import { toEntityId, toEntityIdList } from '../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { AcademicYear } from '../entities/academic-year.entity';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
} from '../common/pagination';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../common/bulk-actions';
import { buildStandardAdminWhere } from '../common/apply-column-filters';
import { ACADEMIC_YEAR_COLUMN_FILTERS } from '../common/admin-filter-configs';
import {
  backfillLegacyAuditTimestampsIfMissing,
  touchLegacyAuditTimestamps,
} from '../common/legacy-audit-timestamps';

export interface AcademicYearRowDto {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: number;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListAcademicYearsParams {
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

export interface ListAcademicYearsResult {
  data: AcademicYearRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toIso(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

/** Chuẩn hóa ngày nhập dạng text (YYYY-MM-DD hoặc ISO) → YYYY-MM-DD hoặc null. */
function normalizeAcademicYearDateInput(
  value: string | null | undefined,
): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function mapRow(r: AcademicYear): AcademicYearRowDto {
  return {
    id: r.id,
    name: r.name,
    startDate: r.startDate ?? null,
    endDate: r.endDate ?? null,
    status: r.status,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
    deletedAt: toIso(r.deletedAt),
  };
}

@Injectable()
export class AcademicYearsService {
  constructor(private readonly em: EntityManager) {}

  async list(
    params: ListAcademicYearsParams,
  ): Promise<ListAcademicYearsResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildStandardAdminWhere({
      ...params,
      searchFields: ['name'],
      filterConfig: ACADEMIC_YEAR_COLUMN_FILTERS,
    });
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

    if (params.search?.trim()) {
      where.$or = [{ name: { $like: `%${params.search.trim()}%` } }];
    }

    const qb = where as FilterQuery<AcademicYear>;
    const [rows, total] = await Promise.all([
      this.em.find(AcademicYear, qb, {
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.em.count(AcademicYear, qb),
    ]);

    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<AcademicYearRowDto | null> {
    const row = await this.em.findOne(AcademicYear, { id: toEntityId(id) });
    if (!row) return null;
    if (backfillLegacyAuditTimestampsIfMissing(row)) {
      await this.em.persistAndFlush(row);
    }
    return mapRow(row);
  }

  async create(data: {
    name: string;
    startDate?: string | null;
    endDate?: string | null;
    status?: number;
  }): Promise<AcademicYearRowDto> {
    const entity = new AcademicYear();
    entity.name = data.name;
    entity.startDate = normalizeAcademicYearDateInput(data.startDate);
    entity.endDate = normalizeAcademicYearDateInput(data.endDate);
    if (data.status != null) entity.status = data.status;
    touchLegacyAuditTimestamps(entity, true);
    await this.em.persistAndFlush(entity);
    return mapRow(entity);
  }

  async update(
    id: number,
    data: {
      name?: string;
      startDate?: string | null;
      endDate?: string | null;
      status?: number;
    },
  ): Promise<AcademicYearRowDto | null> {
    const existing = await this.em.findOne(AcademicYear, { id: toEntityId(id) });
    if (!existing) return null;
    if (data.name != null) existing.name = data.name;
    if (data.startDate !== undefined) {
      existing.startDate = normalizeAcademicYearDateInput(data.startDate);
    }
    if (data.endDate !== undefined) {
      existing.endDate = normalizeAcademicYearDateInput(data.endDate);
    }
    if (data.status != null) existing.status = data.status;
    touchLegacyAuditTimestamps(existing);
    await this.em.persistAndFlush(existing);
    return mapRow(existing);
  }

  async softDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(AcademicYear, { id: toEntityId(id) });
    if (!row || row.deletedAt) return false;
    row.deletedAt = new Date();
    touchLegacyAuditTimestamps(row);
    await this.em.persistAndFlush(row);
    return true;
  }

  async restore(id: number): Promise<boolean> {
    const row = await this.em.findOne(AcademicYear, { id: toEntityId(id) });
    if (!row || !row.deletedAt) return false;
    row.deletedAt = null;
    await this.em.persistAndFlush(row);
    return true;
  }

  async hardDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(AcademicYear, { id: toEntityId(id) });
    if (!row) return false;
    await this.em.removeAndFlush(row);
    return true;
  }

  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    return applyBulkAction(this.em, AcademicYear, action, ids, {
      label: 'niên khóa',
    });
  }
}
