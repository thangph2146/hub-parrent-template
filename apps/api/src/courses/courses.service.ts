import { toEntityId, toEntityIdList } from '../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Course } from '../entities/course.entity';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../common/bulk-actions';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';
import { buildStandardAdminWhere } from '../common/apply-column-filters';
import { COURSE_COLUMN_FILTERS } from '../common/admin-filter-configs';
import {
  backfillLegacyAuditTimestampsIfMissing,
  touchLegacyAuditTimestamps,
} from '../common/legacy-audit-timestamps';

export interface CourseRowDto {
  id: number;
  name: string;
  startYear: number | null;
  endYear: number | null;
  departmentId: number | null;
  status: number;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListCoursesParams {
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

export interface ListCoursesResult {
  data: CourseRowDto[];
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

function mapRow(r: Course): CourseRowDto {
  return {
    id: r.id,
    name: r.name,
    startYear: r.startYear ?? null,
    endYear: r.endYear ?? null,
    departmentId: r.departmentId ?? null,
    status: r.status,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
    deletedAt: toIso(r.deletedAt),
  };
}

@Injectable()
export class CoursesService {
  constructor(private readonly em: EntityManager) {}

  async list(params: ListCoursesParams): Promise<ListCoursesResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildStandardAdminWhere({
      ...params,
      searchFields: ['name', 'code'],
      filterConfig: COURSE_COLUMN_FILTERS,
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

    const qb = where as FilterQuery<Course>;
    const [rows, total] = await Promise.all([
      this.em.find(Course, qb, {
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.em.count(Course, qb),
    ]);

    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<CourseRowDto | null> {
    const row = await this.em.findOne(Course, { id: toEntityId(id) });
    if (!row) return null;
    if (backfillLegacyAuditTimestampsIfMissing(row)) {
      await this.em.persistAndFlush(row);
    }
    return mapRow(row);
  }

  async create(data: {
    name: string;
    startYear?: number | null;
    endYear?: number | null;
    departmentId?: number | null;
  }): Promise<CourseRowDto> {
    const entity = new Course();
    entity.name = data.name;
    if (data.startYear !== undefined) entity.startYear = data.startYear;
    if (data.endYear !== undefined) entity.endYear = data.endYear;
    if (data.departmentId !== undefined)
      entity.departmentId = data.departmentId;
    touchLegacyAuditTimestamps(entity, true);
    await this.em.persistAndFlush(entity);
    return mapRow(entity);
  }

  async update(
    id: number,
    data: {
      name?: string;
      startYear?: number | null;
      endYear?: number | null;
      departmentId?: number | null;
      status?: number;
    },
  ): Promise<CourseRowDto | null> {
    const existing = await this.em.findOne(Course, { id: toEntityId(id) });
    if (!existing) return null;
    if (data.name != null) existing.name = data.name;
    if (data.startYear !== undefined) existing.startYear = data.startYear;
    if (data.endYear !== undefined) existing.endYear = data.endYear;
    if (data.departmentId !== undefined)
      existing.departmentId = data.departmentId;
    if (data.status != null) existing.status = data.status;
    touchLegacyAuditTimestamps(existing);
    await this.em.persistAndFlush(existing);
    return mapRow(existing);
  }

  async softDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(Course, { id: toEntityId(id) });
    if (!row || row.deletedAt) return false;
    row.deletedAt = new Date();
    touchLegacyAuditTimestamps(row);
    await this.em.persistAndFlush(row);
    return true;
  }

  async restore(id: number): Promise<boolean> {
    const row = await this.em.findOne(Course, { id: toEntityId(id) });
    if (!row || !row.deletedAt) return false;
    row.deletedAt = null;
    await this.em.persistAndFlush(row);
    return true;
  }

  async hardDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(Course, { id: toEntityId(id) });
    if (!row) return false;
    await this.em.removeAndFlush(row);
    return true;
  }
  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    return applyBulkAction(this.em, Course, action, ids, { label: 'khoa hoc' });
  }
}
