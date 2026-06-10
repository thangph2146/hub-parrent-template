import { toEntityId, toEntityIdList } from '../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Template } from '../entities/template.entity';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../common/bulk-actions';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';
import { buildStandardAdminWhere } from '../common/apply-column-filters';
import { TEMPLATE_COLUMN_FILTERS } from '../common/admin-filter-configs';

export interface TemplateRowDto {
  id: number;
  name: string;
  code: string | null;
  content: unknown;
  status: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

function toIso(v: Date | string | number | undefined | null): string | null {
  if (v == null) return null;
  if (v instanceof Date)
    return Number.isNaN(v.getTime()) ? null : v.toISOString();
  return null;
}

function mapRow(r: Template): TemplateRowDto {
  return {
    id: r.id,
    name: r.name,
    code: r.code ?? null,
    content: r.content ?? null,
    status: r.status,
    createdAt: toIso(r.createdAt) ?? '',
    updatedAt: toIso(r.updatedAt) ?? '',
    deletedAt: toIso(r.deletedAt),
  };
}

@Injectable()
export class TemplatesService {
  constructor(private readonly em: EntityManager) {}

  async list(params: {
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
  }) {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildStandardAdminWhere({
      ...params,
      searchFields: ['name', 'code'],
      filterConfig: TEMPLATE_COLUMN_FILTERS,
    });
    const [rows, total] = await Promise.all([
      this.em.find(Template, where as FilterQuery<Template>, {
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.em.count(Template, where as FilterQuery<Template>),
    ]);
    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: string): Promise<TemplateRowDto | null> {
    const r = await this.em.findOne(Template, { id: toEntityId(id) });
    return r ? mapRow(r) : null;
  }

  async create(data: Record<string, unknown>): Promise<TemplateRowDto> {
    const created = new Template();
    const fields = ['name', 'code', 'content', 'status'] as const;
    for (const f of fields) {
      if (data[f] !== undefined) (created as any)[f] = data[f];
    }
    await this.em.persistAndFlush(created);
    return mapRow(created);
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<TemplateRowDto | null> {
    const existing = await this.em.findOne(Template, { id: toEntityId(id) });
    if (!existing) return null;
    const fields = ['name', 'code', 'content', 'status'] as const;
    for (const f of fields) {
      if (data[f] !== undefined) (existing as any)[f] = data[f];
    }
    await this.em.persistAndFlush(existing);
    return mapRow(existing);
  }

  async softDelete(id: string): Promise<boolean> {
    const r = await this.em.findOne(Template, { id: toEntityId(id) });
    if (!r || r.deletedAt) return false;
    r.deletedAt = new Date();
    await this.em.persistAndFlush(r);
    return true;
  }
  async restore(id: string): Promise<boolean> {
    const r = await this.em.findOne(Template, { id: toEntityId(id) });
    if (!r || !r.deletedAt) return false;
    r.deletedAt = null;
    await this.em.persistAndFlush(r);
    return true;
  }
  async hardDelete(id: string): Promise<boolean> {
    const r = await this.em.findOne(Template, { id: toEntityId(id) });
    if (!r) return false;
    await this.em.removeAndFlush(r);
    return true;
  }
  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    return applyBulkAction(this.em, Template, action, ids, { label: 'mau' });
  }
}
