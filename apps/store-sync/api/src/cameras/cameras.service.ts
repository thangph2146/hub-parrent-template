import { toEntityId, toEntityIdList } from '../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Camera } from '../entities/camera.entity';
import { Event } from '../entities/event.entity';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../common/bulk-actions';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';
import { buildStandardAdminWhere } from '../common/apply-column-filters';
import { CAMERA_COLUMN_FILTERS } from '../common/admin-filter-configs';

export interface CameraRowDto {
  id: number;
  name: string;
  code: string | null;
  linkedEventId: number | null;
  linkedEventTitle: string | null;
  linkedEventSlug: string | null;
  ipAddress: string | null;
  port: number | null;
  username: string | null;
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

function mapRow(r: Camera): CameraRowDto {
  return {
    id: r.id,
    name: r.name,
    code: r.code ?? null,
    linkedEventId: r.linkedEvent?.id ?? null,
    linkedEventTitle: r.linkedEvent?.title ?? null,
    linkedEventSlug: r.linkedEvent?.slug ?? null,
    ipAddress: r.ipAddress ?? null,
    port: r.port ?? null,
    username: r.username ?? null,
    status: r.status,
    createdAt: toIso(r.createdAt) ?? '',
    updatedAt: toIso(r.updatedAt) ?? '',
    deletedAt: toIso(r.deletedAt),
  };
}

@Injectable()
export class CamerasService {
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
      searchFields: ['name', 'ipAddress', 'code'],
      filterConfig: CAMERA_COLUMN_FILTERS,
    });
    const [rows, total] = await Promise.all([
      this.em.find(Camera, where as FilterQuery<Camera>, {
        populate: ['linkedEvent'],
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.em.count(Camera, where as FilterQuery<Camera>),
    ]);
    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: string): Promise<CameraRowDto | null> {
    const r = await this.em.findOne(
      Camera,
      { id: toEntityId(id) },
      { populate: ['linkedEvent'] },
    );
    return r ? mapRow(r) : null;
  }

  private applyLinkedEvent(target: Camera, linkedEventId: unknown): void {
    if (linkedEventId === undefined) return;
    if (linkedEventId === null || linkedEventId === '') {
      target.linkedEvent = null;
      return;
    }
    const id = String(linkedEventId).trim();
    target.linkedEvent = id
      ? this.em.getReference(Event, toEntityId(id))
      : null;
  }

  async create(data: Record<string, unknown>): Promise<CameraRowDto> {
    const created = new Camera();
    const fields = [
      'name',
      'code',
      'ipAddress',
      'port',
      'username',
      'password',
      'status',
    ] as const;
    for (const f of fields) {
      if (data[f] !== undefined)
        (created as unknown as Record<string, unknown>)[f] = data[f];
    }
    this.applyLinkedEvent(created, data.linkedEventId);
    await this.em.persistAndFlush(created);
    return mapRow(created);
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<CameraRowDto | null> {
    const existing = await this.em.findOne(Camera, { id: toEntityId(id) });
    if (!existing) return null;
    const fields = [
      'name',
      'code',
      'ipAddress',
      'port',
      'username',
      'password',
      'status',
    ] as const;
    for (const f of fields) {
      if (data[f] !== undefined)
        (existing as unknown as Record<string, unknown>)[f] = data[f];
    }
    this.applyLinkedEvent(existing, data.linkedEventId);
    await this.em.persistAndFlush(existing);
    return mapRow(existing);
  }

  async softDelete(id: string): Promise<boolean> {
    const r = await this.em.findOne(Camera, { id: toEntityId(id) });
    if (!r || r.deletedAt) return false;
    r.deletedAt = new Date();
    await this.em.persistAndFlush(r);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const r = await this.em.findOne(Camera, { id: toEntityId(id) });
    if (!r || !r.deletedAt) return false;
    r.deletedAt = null;
    await this.em.persistAndFlush(r);
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const r = await this.em.findOne(Camera, { id: toEntityId(id) });
    if (!r) return false;
    await this.em.removeAndFlush(r);
    return true;
  }
  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    return applyBulkAction(this.em, Camera, action, ids, { label: 'camera' });
  }
}
