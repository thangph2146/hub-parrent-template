/**
 * Sessions admin service — logic dùng chung; app binding entity.
 */
import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  resolveRelationFilters,
  type RelationFiltersConfig,
} from '../../resolve-relation-filters';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../pagination';
import {
  toEntityId,
  toEntityIdList,
  relationEntityId,
} from '../../entity-id';
import { safeIsoString, safeIsoStringNow } from '../../date-utils';

export interface AuthRoleNamesBinding {
  USER: string;
  ADMIN: string;
  SUPER_ADMIN: string;
}

export interface SessionRowDto {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string;
  accessToken: string;
  refreshToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  isActive: boolean;
  expiresAt: string;
  lastActivity: string;
  createdAt: string;
  deletedAt: null;
}

export interface ListSessionsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  filters?: Record<string, string>;
}

export interface ListSessionsResult {
  data: SessionRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AccountWithSessionStatusDto {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  deletedAt: string | null;
  hasActiveSession: boolean;
  isSuperAdmin?: boolean;
}

export interface ListAccountsWithSessionStatusParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
}

export interface ListAccountsWithSessionStatusResult {
  data: AccountWithSessionStatusDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SessionWithUser = Record<string, unknown> & {
  id: number;
  accessToken: string;
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isActive: boolean;
  expiresAt: Date | string;
  lastActivity: Date | string;
  createdAt: Date | string;
  user?: { id?: number; name?: string | null; email?: string | null } | string | null;
};

function mapRow(s: SessionWithUser): SessionRowDto {
  const userId = relationEntityId(s.user);
  const userName =
    s.user && typeof s.user === 'object' && 'name' in s.user
      ? ((s.user as { name?: string | null }).name ?? null)
      : null;
  const userEmail =
    s.user && typeof s.user === 'object' && 'email' in s.user
      ? ((s.user as { email?: string | null }).email ?? '')
      : '';
  return {
    id: s.id,
    userId: userId ?? 0,
    userName,
    userEmail,
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    userAgent: s.userAgent ?? null,
    ipAddress: s.ipAddress ?? null,
    isActive: s.isActive,
    expiresAt: safeIsoStringNow(s.expiresAt),
    lastActivity: safeIsoStringNow(s.lastActivity),
    createdAt: safeIsoStringNow(s.createdAt),
    deletedAt: null,
  };
}

function buildWhere(params: ListSessionsParams): FilterQuery<object> {
  const where: Record<string, unknown> = {};
  const status = params.status ?? 'active';
  if (status === 'active') where.isActive = true;
  else if (status === 'deleted') where.isActive = false;

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (!value?.trim()) continue;
      const v = value.trim();
      if (key === 'userAgent') where.userAgent = { $like: `%${v}%` };
      else if (key === 'ipAddress') where.ipAddress = { $like: `%${v}%` };
      else if (key === 'userId') where.user = v;
      else if (key === 'isActive') where.isActive = value === 'true';
    }
  }

  if (params.search?.trim()) {
    const q = { $like: `%${params.search.trim()}%` };
    return [
      { ...where, accessToken: q },
      { ...where, refreshToken: q },
      { ...where, userAgent: q },
      { ...where, ipAddress: q },
      { ...where, user: { name: q } },
      { ...where, user: { email: q } },
    ] as FilterQuery<object>;
  }

  return where as FilterQuery<object>;
}

const SESSION_RELATION_FILTERS: RelationFiltersConfig = {
  userId: { model: 'user', nameField: 'email', softDelete: true },
};

@Injectable()
export abstract class BaseSessionsService {
  protected abstract getEm(): EntityManager;
  protected abstract getSessionEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getUserRoleEntity(): new () => Record<string, unknown>;
  protected abstract getRoleEntity(): new () => Record<string, unknown>;
  protected abstract getAuthRoleNames(): AuthRoleNamesBinding;

  protected resolveRelationEntity(model: string): (new () => object) | undefined {
    if (model === 'user') return this.getUserEntity();
    return undefined;
  }

  private readonly optionColumns = new Set<string>([
    'accessToken',
    'refreshToken',
    'userAgent',
    'ipAddress',
  ]);

  private async getOrCreateRole(
    name: string,
    displayName: string,
  ): Promise<{ id: number }> {
    let role = await this.getEm().findOne(this.getRoleEntity(), { name });
    if (!role) {
      role = new (this.getRoleEntity())();
      role.name = name;
      role.displayName = displayName;
      role.isActive = true;
      this.getEm().persist(role);
      await this.getEm().flush();
    }
    return { id: role.id };
  }

  async list(params: ListSessionsParams): Promise<ListSessionsResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const filters = await resolveRelationFilters(
      this.getEm(),
      params.filters,
      SESSION_RELATION_FILTERS,
      (model) => this.resolveRelationEntity(model),
    );
    const where = buildWhere({ ...params, filters });

    const [rows, total] = await Promise.all([
      this.getEm().find(this.getSessionEntity(), where, {
        populate: ['user'],
        orderBy: { createdAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(this.getSessionEntity(), where),
    ]);

    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    if (!this.optionColumns.has(column)) {
      return [];
    }
    const optionColumn = column;
    const where: Record<string, unknown> = { isActive: true };
    if (search?.trim()) {
      where[optionColumn] = { $like: `%${search.trim()}%` };
    }
    const rows = await this.getEm().find(this.getSessionEntity(), where as FilterQuery<object>, {
      fields: [optionColumn] as never,
      limit,
    });
    const seen = new Set<string>();
    return rows
      .map((r) => (r as Record<string, unknown>)[optionColumn])
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      .filter((v) => {
        if (seen.has(v)) return false;
        seen.add(v);
        return true;
      })
      .map((value) => ({ label: value, value }));
  }

  async create(data: {
    userId: number;
    email?: string | null;
    name?: string | null;
    avatar?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<SessionRowDto | null> {
    let user = await this.getEm().findOne(this.getUserEntity(), { id: data.userId });

    if (!user && data.email) {
      const userRole = await this.getOrCreateRole(this.getAuthRoleNames().USER, 'User');
      const adminRole = await this.getOrCreateRole(
        this.getAuthRoleNames().ADMIN,
        'Admin',
      );
      user = new (this.getUserEntity())();
      user.id = data.userId;
      user.email = data.email;
      user.name = data.name ?? null;
      user.avatar = data.avatar ?? null;
      user.password = `oauth_${randomBytes(16).toString('hex')}`;
      user.isActive = true;
      this.getEm().persist(user);
      await this.getEm().flush();

      const ur1 = new (this.getUserRoleEntity())();
      ur1.user = user;
      ur1.role = this.getEm().getReference(this.getRoleEntity(), userRole.id);
      this.getEm().persist(ur1);

      const ur2 = new (this.getUserRoleEntity())();
      ur2.user = user;
      ur2.role = this.getEm().getReference(this.getRoleEntity(), adminRole.id);
      this.getEm().persist(ur2);
      await this.getEm().flush();
    }

    if (!user) return null;

    const accessToken = `at_${randomBytes(32).toString('hex')}`;
    const refreshToken = `rt_${randomBytes(32).toString('hex')}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const sessionObj = new (this.getSessionEntity())();
    sessionObj.user = this.getEm().getReference(this.getUserEntity(), toEntityId(data.userId));
    sessionObj.accessToken = accessToken;
    sessionObj.refreshToken = refreshToken;
    sessionObj.userAgent = data.userAgent?.trim() ?? null;
    sessionObj.ipAddress = data.ipAddress?.trim() ?? null;
    sessionObj.isActive = true;
    sessionObj.expiresAt = expiresAt;
    sessionObj.lastActivity = new Date();
    this.getEm().persist(sessionObj);
    await this.getEm().flush();

    const savedSession = await this.getEm().findOne(
      this.getSessionEntity(),
      { id: sessionObj.id },
      { populate: ['user'] },
    );

    return savedSession ? mapRow(savedSession as SessionWithUser) : null;
  }

  async getById(id: string): Promise<SessionRowDto | null> {
    const s = await this.getEm().findOne(
      this.getSessionEntity(),
      { id: toEntityId(id) },
      { populate: ['user'] },
    );
    return s ? mapRow(s as SessionWithUser) : null;
  }

  async update(
    id: string,
    data: {
      isActive?: boolean;
      userAgent?: string | null;
      ipAddress?: string | null;
    },
  ): Promise<SessionRowDto | null> {
    const existing = await this.getEm().findOne(this.getSessionEntity(), { id: toEntityId(id) });
    if (!existing) return null;

    if (data.isActive !== undefined) existing.isActive = data.isActive;
    if (data.userAgent !== undefined)
      existing.userAgent = data.userAgent?.trim() ?? null;
    if (data.ipAddress !== undefined)
      existing.ipAddress = data.ipAddress?.trim() ?? null;

    this.getEm().persist(existing);
    await this.getEm().flush();
    return this.getById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const s = await this.getEm().findOne(this.getSessionEntity(), { id: toEntityId(id) });
    if (!s || !s.isActive) return false;
    s.isActive = false;
    this.getEm().persist(s);
    await this.getEm().flush();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const s = await this.getEm().findOne(this.getSessionEntity(), { id: toEntityId(id) });
    if (!s || s.isActive) return false;
    s.isActive = true;
    this.getEm().persist(s);
    await this.getEm().flush();
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const s = await this.getEm().findOne(this.getSessionEntity(), { id: toEntityId(id) });
    if (!s) return false;
    this.getEm().remove(s);
    await this.getEm().flush();
    return true;
  }

  async bulk(
    action: 'delete' | 'restore' | 'hard-delete',
    ids: string[],
  ): Promise<{ success: boolean; message: string; affectedCount?: number }> {
    if (!ids.length) {
      return {
        success: true,
        message: 'Không có session nào',
        affectedCount: 0,
      };
    }

    if (action === 'delete') {
      const result = await this.getEm().nativeUpdate(this.getSessionEntity(),
        { id: { $in: toEntityIdList(ids) }, isActive: true },
        { isActive: false },
      );
      return {
        success: true,
        message: `Đã xóa ${result ?? 0} session`,
        affectedCount: result ?? 0,
      };
    }

    if (action === 'restore') {
      const result = await this.getEm().nativeUpdate(this.getSessionEntity(),
        { id: { $in: toEntityIdList(ids) }, isActive: false },
        { isActive: true },
      );
      return {
        success: true,
        message: `Đã khôi phục ${result ?? 0} session`,
        affectedCount: result ?? 0,
      };
    }

    if (action === 'hard-delete') {
      const result = await this.getEm().nativeDelete(this.getSessionEntity(), {
        id: { $in: toEntityIdList(ids) },
      });
      return {
        success: true,
        message: `Đã xóa vĩnh viễn ${result ?? 0} session`,
        affectedCount: result ?? 0,
      };
    }

    return { success: false, message: 'Action không hợp lệ' };
  }

  async getActiveSessionUserIds(): Promise<number[]> {
    const rows = await this.getEm().find(
      this.getSessionEntity(),
      { isActive: true },
      { fields: ['user'] },
    );
    return [
      ...new Set(
        rows
          .map((r) => relationEntityId(r.user))
          .filter((id): id is number => id != null),
      ),
    ];
  }

  async getSuperAdminUserIds(): Promise<number[]> {
    const rows = await this.getEm().find(
      this.getUserRoleEntity(),
      { role: { name: this.getAuthRoleNames().SUPER_ADMIN } },
      { populate: ['role', 'user'], fields: ['user'] },
    );
    return [
      ...new Set(
        rows
          .map((r) => relationEntityId(r.user))
          .filter((id): id is number => id != null),
      ),
    ];
  }

  async listAccountsWithSessionStatus(
    params: ListAccountsWithSessionStatusParams,
  ): Promise<ListAccountsWithSessionStatusResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: Record<string, unknown> = {};
    const status = params.status ?? 'active';
    if (status === 'deleted') where.deletedAt = { $ne: null };
    else if (status === 'active') where.deletedAt = null;
    if (params.search?.trim()) {
      const q = `%${params.search.trim()}%`;
      where.$or = [{ email: { $like: q } }, { name: { $like: q } }];
    }
    const whereQuery = where as FilterQuery<object>;
    const [users, total, activeUserIds, superAdminUserIds] = await Promise.all([
      this.getEm().find(this.getUserEntity(), whereQuery, {
        orderBy: { email: 'ASC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(this.getUserEntity(), whereQuery),
      this.getActiveSessionUserIds(),
      this.getSuperAdminUserIds(),
    ]);

    const activeSet = new Set(activeUserIds);
    const superAdminSet = new Set(superAdminUserIds);
    const data: AccountWithSessionStatusDto[] = users.map((u) => ({
      id: u.id,
      email: u.email ?? '',
      name: u.name ?? null,
      isActive: u.isActive,
      deletedAt: safeIsoString(u.deletedAt),
      hasActiveSession: activeSet.has(u.id),
      isSuperAdmin: superAdminSet.has(u.id),
    }));

    return {
      data,
      pagination: paginationMeta(page, limit, total),
    };
  }

  async revokeAllSessionsByUserId(
    userId: string,
  ): Promise<{ count: number; sessionIds: number[] }> {
    const sessions = await this.getEm().find(
      this.getSessionEntity(),
      { user: toEntityId(userId), isActive: true },
      { fields: ['id'] },
    );
    if (!sessions.length) return { count: 0, sessionIds: [] };
    const ids = sessions.map((s) => s.id);
    await this.getEm().nativeUpdate(this.getSessionEntity(),
      { id: { $in: toEntityIdList(ids) } },
      { isActive: false },
    );
    return { count: ids.length, sessionIds: ids };
  }

  async userHasSuperAdminRole(userId: string): Promise<boolean> {
    const count = await this.getEm().count(this.getUserRoleEntity(), {
      user: toEntityId(userId),
      role: { name: this.getAuthRoleNames().SUPER_ADMIN },
    });
    return count > 0;
  }
}
