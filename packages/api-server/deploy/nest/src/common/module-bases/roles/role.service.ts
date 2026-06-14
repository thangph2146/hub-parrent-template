/**
 * Roles Service — domain logic (materialize → apps/main/api module-bases).
 */
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  getOptionsFromModel,
  normalizePageLimit,
  paginationMeta,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
  toEntityIdList,
  type GetOptionsConfig,
} from '../../index';
import { isSystemSuperAdminRoleName } from '../../../config/system-role';

export interface RolesRowDto {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  permissions: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ListRolesParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  filters?: Record<string, string>;
}

export interface ListRolesResult {
  data: RolesRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RolesCreateData {
  name: string;
  displayName: string;
  description?: string | null;
  permissions?: unknown;
  isActive?: boolean;
}

export interface RolesUpdateData {
  name?: string;
  displayName?: string;
  description?: string | null;
  permissions?: unknown;
  isActive?: boolean;
}

const ROLE_OPTIONS_CONFIG: GetOptionsConfig = {
  name: { valueField: 'name', searchField: 'name' },
  displayName: { valueField: 'displayName', searchField: 'displayName' },
  '*': { valueField: 'name', searchField: 'name' },
};

function mapRow(r: Record<string, unknown>): RolesRowDto {
  return {
    id: r.id as number,
    name: String(r.name ?? ''),
    displayName: String(r.displayName ?? ''),
    description: (r.description as string | null | undefined) ?? null,
    permissions: r.permissions,
    isActive: Boolean(r.isActive),
    createdAt: safeIsoStringNow(r.createdAt as Date | string | null | undefined),
    updatedAt: safeIsoStringNow(r.updatedAt as Date | string | null | undefined),
    deletedAt: safeIsoString(r.deletedAt as Date | string | null | undefined),
  };
}

function buildWhere(params: ListRolesParams): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  const status = params.status ?? 'active';
  if (status === 'deleted') where.deletedAt = { $ne: null };
  else if (status === 'active') where.deletedAt = null;

  if (params.search?.trim()) {
    const q = params.search.trim();
    where.$or = [
      { name: { $like: `%${q}%` } },
      { displayName: { $like: `%${q}%` } },
      { description: { $like: `%${q}%` } },
    ];
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (!value?.trim()) continue;
      const v = value.trim();
      if (key === 'name') where.name = { $like: `%${v}%` };
      else if (key === 'displayName') where.displayName = { $like: `%${v}%` };
      else if (key === 'description') where.description = { $like: `%${v}%` };
      else if (key === 'isActive') where.isActive = v === 'true';
    }
  }

  return where;
}

@Injectable()
export abstract class BaseRolesService {
  protected readonly logger = new Logger(BaseRolesService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract isProtectedAdminEmail(
    email: string | null | undefined,
  ): boolean;

  async resolveActorEmail(userId: string): Promise<string | null> {
    const em = this.getEm();
    const User = this.getUserEntity();
    const user = await em.findOne(User, { id: toEntityId(userId) });
    const email = (user as Record<string, unknown> | null)?.email;
    return typeof email === 'string' ? email.trim().toLowerCase() : null;
  }

  private assertSuperAdminRoleEditable(
    role: Record<string, unknown>,
    actorEmail: string | null | undefined,
  ): void {
    if (!isSystemSuperAdminRoleName(String(role.name ?? ''))) return;
    if (!this.isProtectedAdminEmail(actorEmail)) {
      throw new ForbiddenException(
        'Chỉ tài khoản quản trị hệ thống (PROTECTED_ADMIN_EMAILS) được phép chỉnh sửa vai trò Super Admin.',
      );
    }
  }

  private assertSuperAdminRoleNotDeletable(role: Record<string, unknown>): void {
    if (isSystemSuperAdminRoleName(String(role.name ?? ''))) {
      throw new ForbiddenException(
        'Vai trò Super Admin là vai trò hệ thống, không thể xóa.',
      );
    }
  }

  async list(params: ListRolesParams): Promise<ListRolesResult> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildWhere(params) as FilterQuery<Record<string, unknown>>;
    const [rows, total] = await Promise.all([
      em.find(Entity, where, {
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      em.count(Entity, where),
    ]);
    return {
      data: rows.map((row) => mapRow(row as Record<string, unknown>)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    const em = this.getEm();
    const Entity = this.getEntity();
    return getOptionsFromModel(
      em.getRepository(Entity),
      { deletedAt: null },
      column,
      ROLE_OPTIONS_CONFIG,
      search,
      limit,
    );
  }

  async getById(id: string): Promise<RolesRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    return r ? mapRow(r as Record<string, unknown>) : null;
  }

  async create(data: RolesCreateData): Promise<RolesRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const created = new Entity() as Record<string, unknown>;
    created.name = data.name;
    created.displayName = data.displayName;
    created.description = data.description ?? null;
    created.permissions = data.permissions;
    created.isActive = data.isActive ?? true;
    await em.persistAndFlush(created);
    return mapRow(created);
  }

  async update(
    id: string,
    data: RolesUpdateData,
    actorEmail?: string | null,
  ): Promise<RolesRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const existing = await em.findOne(Entity, { id: toEntityId(id) });
    if (!existing) return null;

    const row = existing as Record<string, unknown>;
    this.assertSuperAdminRoleEditable(row, actorEmail);
    if (
      isSystemSuperAdminRoleName(String(row.name ?? '')) &&
      data.name != null &&
      data.name.trim().toLowerCase() !== String(row.name ?? '').trim().toLowerCase()
    ) {
      throw new ForbiddenException('Không thể đổi mã vai trò Super Admin.');
    }

    if (data.name != null) row.name = data.name;
    if (data.displayName != null) row.displayName = data.displayName;
    if (data.description !== undefined) row.description = data.description;
    if (data.permissions !== undefined) row.permissions = data.permissions;
    if (data.isActive !== undefined) row.isActive = data.isActive;
    await em.persistAndFlush(existing);
    return mapRow(row);
  }

  async softDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    if (!r) return false;
    const row = r as Record<string, unknown>;
    if (row.deletedAt) return false;
    this.assertSuperAdminRoleNotDeletable(row);
    row.deletedAt = new Date();
    await em.persistAndFlush(r);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    if (!r) return false;
    const row = r as Record<string, unknown>;
    if (!row.deletedAt) return false;
    row.deletedAt = null;
    await em.persistAndFlush(r);
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    if (!r) return false;
    this.assertSuperAdminRoleNotDeletable(r as Record<string, unknown>);
    await em.removeAndFlush(r);
    return true;
  }

  async bulk(
    action: 'delete' | 'restore' | 'hard-delete',
    ids: string[],
  ): Promise<{ affected: number; message: string }> {
    const em = this.getEm();
    const Entity = this.getEntity();
    if (!ids.length) return { affected: 0, message: 'Không có bản ghi nào' };

    if (action === 'delete' || action === 'hard-delete') {
      const targets = await em.find(Entity, {
        id: { $in: toEntityIdList(ids) },
      });
      for (const role of targets) {
        this.assertSuperAdminRoleNotDeletable(role as Record<string, unknown>);
      }
    }

    if (action === 'delete') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null },
        { deletedAt: new Date() },
      );
      return {
        affected: result ?? 0,
        message: `Đã xóa ${result ?? 0} vai trò`,
      };
    }

    if (action === 'restore') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} vai trò`,
      };
    }

    if (action === 'hard-delete') {
      const entities = await em.find(Entity, {
        id: { $in: toEntityIdList(ids) },
      });
      await em.removeAndFlush(entities);
      return {
        affected: entities.length,
        message: `Đã xóa vĩnh viễn ${entities.length} vai trò`,
      };
    }

    return { affected: 0, message: 'Action không hợp lệ' };
  }
}
