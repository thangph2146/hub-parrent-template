/**
 * Base Users Service
 *
 * Abstract base service for user management.
 * Extend this class in your app to implement with your specific entities.
 */
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { hash } from 'bcryptjs';

/**
 * Type exports from parent
 */
import type {
  UserRowDto,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  BulkOperationResult,
  PaginatedResult,
  UserOption,
  DevLoginOption,
  DevLoginOptionsQuery,
} from '../../types';

// Re-export types for module barrel exports
export type { UserOption, DevLoginOptionsQuery } from '../../types';

// DevLoginOptionDto is an alias for DevLoginOption
export type DevLoginOptionDto = DevLoginOption;

/**
 * Default admin table export limit
 */
export const ADMIN_TABLE_EXPORT_MAX_LIMIT = 1000;

/**
 * Default pagination settings
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_OPTIONS_LIMIT = 50;

/**
 * WHERE clause builder type
 */
type WhereClause = Record<string, unknown>;

/**
 * Base Users Service
 * Provides common user management operations
 */
@Injectable()
export class BaseUsersService {
  protected readonly logger = new Logger(BaseUsersService.name);

  /**
   * Get the EntityManager
   * Override in subclass to provide app-specific EM
   */
  protected getEm(): EntityManager {
    throw new Error('EntityManager not configured. Override getEm() in subclass.');
  }

  /**
   * Get User entity
   * Override in subclass
   */
  protected getUserEntity(): unknown {
    throw new Error('User entity not configured. Override getUserEntity() in subclass.');
  }

  /**
   * Get Role entity
   * Override in subclass
   */
  protected getRoleEntity(): unknown {
    throw new Error('Role entity not configured. Override getRoleEntity() in subclass.');
  }

  /**
   * Get UserRole entity
   * Override in subclass
   */
  protected getUserRoleEntity(): unknown {
    throw new Error('UserRole entity not configured. Override getUserRoleEntity() in subclass.');
  }

  /**
   * Get Setting entity
   * Override in subclass
   */
  protected getSettingEntity(): unknown {
    return null;
  }

  /**
   * Convert entity ID - trả về số nguyên cho numeric id, 0 nếu invalid.
   * Dùng cho các entity có primary key là số (ví dụ: posts, comments).
   */
  protected toEntityId(id: string | number | null | undefined): number {
    if (typeof id === 'number' && Number.isFinite(id)) return id;
    if (id == null) return 0;
    const trimmed = String(id).trim();
    if (!trimmed) return 0;
    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed)) return 0;
    return parsed;
  }

  /**
   * Convert list of entity IDs (numeric).
   */
  protected toEntityIdList(ids: (string | number)[]): number[] {
    return ids.map((id) => this.toEntityId(id));
  }

  /**
   * Convert entity ID thành string | number nguyên xi (giữ CUID nếu có).
   * Dùng cho các entity có primary key là string CUID (ví dụ: User, Role).
   */
  protected toEntityIdValue(
    id: string | number | null | undefined,
  ): string | number {
    if (typeof id === 'number' && Number.isFinite(id)) return id;
    if (id == null) return 0;
    const trimmed = String(id).trim();
    return trimmed;
  }

  /**
   * Normalize page limit
   */
  protected normalizePageLimit(
    page: number,
    limit: number,
    maxLimit = ADMIN_TABLE_EXPORT_MAX_LIMIT,
  ): { page: number; limit: number; skip: number } {
    const normalizedPage = Math.max(1, Number(page) || DEFAULT_PAGE);
    const normalizedLimit = Math.min(
      maxLimit,
      Math.max(1, Number(limit) || DEFAULT_LIMIT),
    );
    const skip = (normalizedPage - 1) * normalizedLimit;
    return { page: normalizedPage, limit: normalizedLimit, skip };
  }

  /**
   * Build pagination metadata
   */
  protected buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): { page: number; limit: number; total: number; totalPages: number } {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Safe ISO string conversion
   */
  protected safeIsoString(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString();
  }

  /**
   * Safe ISO string with current date fallback
   */
  protected safeIsoStringNow(date: Date | string | null | undefined): string {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return date;
    return date.toISOString();
  }

  /**
   * Map user entity to UserRowDto
   */
  protected mapRow(user: Record<string, unknown>): UserRowDto {
    const userRoles = user.userRoles as Array<{ role: { id: number; name: string; displayName: string } }> | undefined;
    const roles = userRoles ? userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
    })) : [];

    const email = user.email;
    const name = user.name;
    const bio = user.bio;
    const avatar = user.avatar;
    const emailVerified = user.emailVerified;
    const phone = user.phone;
    const address = user.address;
    const citizenId = user.citizenId;

    return {
      id: user.id as number,
      email: email ? String(email) : '',
      name: name as string | null,
      bio: bio as string | null,
      avatar: avatar as string | null,
      emailVerified: this.safeIsoString(emailVerified as Date | string | null),
      phone: phone as string | null,
      address: address as string | null,
      citizenId: citizenId as string | null,
      isActive: user.isActive as boolean,
      createdAt: this.safeIsoStringNow(user.createdAt as Date | string),
      updatedAt: this.safeIsoStringNow(user.updatedAt as Date | string),
      deletedAt: this.safeIsoString(user.deletedAt as Date | string | null | undefined),
      roles,
    };
  }

  /**
   * Build WHERE clause from list parameters
   */
  protected buildWhere(params: ListUsersParams): WhereClause {
    const where: WhereClause = {};
    const status = params.status ?? 'active';

    if (status === 'deleted') {
      where.deletedAt = { $ne: null };
    } else if (status === 'active') {
      where.deletedAt = null;
    }

    if (params.search && params.search.trim()) {
      const search = `%${params.search.trim()}%`;
      where.$or = [
        { email: { $like: search } },
        { name: { $like: search } },
        { phone: { $like: search } },
      ];
    }

    if (params.filters) {
      for (const [key, raw] of Object.entries(params.filters)) {
        let value = '';
        if (Array.isArray(raw)) {
          value = raw.length ? String(raw[0]) : '';
        } else if (raw != null) {
          value = String(raw);
        }
        value = value.trim();
        if (!value) continue;

        if (key === 'email') {
          where.email = { $like: `%${value}%` };
        } else if (key === 'name') {
          where.name = { $like: `%${value}%` };
        } else if (key === 'phone') {
          where.phone = { $like: `%${value}%` };
        } else if (key === 'isActive') {
          where.isActive = value === 'true';
        }
      }
    }

    return where;
  }

  /**
   * Resolve user ID to email
   */
  async resolveActorEmail(userId: string): Promise<string | null> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;
    const entityId = this.toEntityId(userId);
    const found = await em.findOne(User, { id: entityId });
    const user = found as Record<string, unknown> | null;
    if (!user) return null;
    const email = user.email;
    if (!email) return null;
    const emailStr = String(email);
    return emailStr.trim().toLowerCase();
  }

  /**
   * Get user with roles
   */
  protected async getUserWithRoles(
    id: string | number,
  ): Promise<Record<string, unknown> | null> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;
    const found = await em.findOne(
      User,
      { id },
      {
        populate: ['userRoles', 'userRoles.role'],
        orderBy: { userRoles: { role: { name: 'ASC' } } },
      },
    );
    return found as Record<string, unknown> | null;
  }

  /**
   * Get user by ID
   * Public method for fetching user with roles
   */
  async getById(id: string): Promise<UserRowDto | null> {
    const user = await this.getUserWithRoles(id);
    if (!user) return null;
    return this.mapRow(user);
  }

  /**
   * List users with pagination
   */
  async list(params: ListUsersParams): Promise<PaginatedResult<UserRowDto>> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;

    const { page, limit, skip } = this.normalizePageLimit(
      params.page,
      params.limit,
    );

    const where = this.buildWhere(params) as FilterQuery<Record<string, unknown>>;

    const [rows, total] = await Promise.all([
      em.find(User, where, {
        populate: ['userRoles', 'userRoles.role'],
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      em.count(User, where),
    ]);

    const mappedRows = rows.map((row) => this.mapRow(row as Record<string, unknown>));

    return {
      data: mappedRows,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get user options for dropdowns
   */
  async getOptions(
    column: string,
    search?: string,
    limit = DEFAULT_OPTIONS_LIMIT,
  ): Promise<UserOption[]> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;

    const where: WhereClause = { deletedAt: null };
    if (search && search.trim()) {
      where.email = { $like: `%${search.trim()}%` };
    }

    const users = await em.find(User, where, {
      fields: ['id', column] as any,
      limit,
    });

    return users.map((user) => ({
      label: String(user[column] ?? ''),
      value: String(user.id),
    }));
  }

  /**
   * List development login options
   */
  async listDevelopmentLoginOptions(
    query: DevLoginOptionsQuery = {},
  ): Promise<DevLoginOptionDto[]> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;

    const rows = await em.find(
      User,
      { deletedAt: null },
      {
        populate: ['userRoles', 'userRoles.role'],
        orderBy: [{ name: 'ASC' }, { email: 'ASC' }],
      },
    );

    const options = rows
      .map((user) => this.mapUserToDevLoginOption(user as Record<string, unknown>))
      .filter((user): user is DevLoginOptionDto => user != null);

    return this.filterDevLoginOptions(options, query);
  }

  /**
   * Map user to dev login option
   */
  protected mapUserToDevLoginOption(
    user: Record<string, unknown>,
  ): DevLoginOptionDto | null {
    const email = user.email;
    if (!email || !String(email).trim()) return null;

    const userRoles = user.userRoles as Array<{ role: { name: string } }> | undefined;

    return {
      id: user.id as number,
      email: String(email).trim().toLowerCase(),
      name: user.name as string | null,
      roleNames: userRoles ? userRoles.map((ur) => ur.role.name) : [],
    };
  }

  /**
   * Filter dev login options
   */
  protected filterDevLoginOptions(
    options: DevLoginOptionDto[],
    query: DevLoginOptionsQuery,
  ): DevLoginOptionDto[] {
    let filtered = options;

    if (query.role) {
      filtered = filtered.filter((opt) => opt.roleNames.includes(query.role!));
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(
        (opt) =>
          opt.email.toLowerCase().includes(search) ||
          (opt.name && opt.name.toLowerCase().includes(search)),
      );
    }

    return filtered;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<UserRowDto> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;
    const Role = this.getRoleEntity() as new () => Record<string, unknown>;
    const UserRole = this.getUserRoleEntity() as new () => Record<string, unknown>;

    const email = data.email.trim().toLowerCase();
    const passwordHash = await hash(data.password, 10);

    const created = new User() as Record<string, unknown>;
    created.email = email;
    created.name = data.name ? data.name.trim() : null;
    created.password = passwordHash;
    created.bio = data.bio ? data.bio.trim() : null;
    created.avatar = data.avatar ? data.avatar.trim() : null;
    created.phone = data.phone ? data.phone.trim() : null;
    created.address = data.address ? data.address.trim() : null;
    created.citizenId = data.citizenId ? data.citizenId.trim() : null;
    created.isActive = data.isActive ?? true;

    em.persist(created);
    await em.flush();

    if (data.roleIds && data.roleIds.length) {
      for (const roleId of data.roleIds) {
        const userRole = new UserRole() as Record<string, unknown>;
        userRole.user = created;
        userRole.role = em.getReference(Role, this.toEntityId(roleId));
        em.persist(userRole);
      }
      await em.flush();
    } else {
      const Setting = this.getSettingEntity() as (new () => Record<string, unknown>) | null;
      if (Setting) {
        const setting = await em.findOne(Setting, {
          key: 'default_new_user_role',
        });
        const settingRecord = setting as Record<string, unknown> | null;
        let defaultRoleName = 'user';
        if (settingRecord && settingRecord.value && typeof settingRecord.value === 'string') {
          defaultRoleName = settingRecord.value.trim().toLowerCase().replace(/^"|"$/g, '') || 'user';
        }
        const defaultRole = await em.findOne(Role, { name: defaultRoleName });
        const defaultRoleRecord = defaultRole as Record<string, unknown> | null;

        if (defaultRoleRecord) {
          const userRole = new UserRole() as Record<string, unknown>;
          userRole.user = created;
          userRole.role = defaultRoleRecord;
          em.persist(userRole);
          await em.flush();
        }
      }
    }

    const user = await this.getUserWithRoles(created.id as number);
    if (!user) {
      throw new Error(`Failed to refetch user ${created.id}`);
    }

    return this.mapRow(user);
  }

  /**
   * Update existing user
   */
  async update(
    id: string,
    data: UpdateUserData,
    actorEmail?: string | null,
  ): Promise<UserRowDto | null> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;
    const Role = this.getRoleEntity() as new () => Record<string, unknown>;
    const UserRole = this.getUserRoleEntity() as new () => Record<string, unknown>;

    const entityId = this.toEntityId(id);
    const found = await em.findOne(User, { id: entityId });
    const existing = found as Record<string, unknown> | null;
    if (!existing) return null;

    const existingEmail = existing.email as string;
    if (actorEmail && !this.canEditProtectedAdminUser(actorEmail, existingEmail)) {
      throw new ForbiddenException(
        `Tài khoản ${existingEmail} là tài khoản hệ thống. Chỉ chính tài khoản đó mới được chỉnh sửa.`,
      );
    }

    if (this.isProtectedAdminEmail(existingEmail) && data.email != null) {
      const nextEmail = data.email.trim().toLowerCase();
      const existingEmailTrimmed = existingEmail ? existingEmail.trim().toLowerCase() : '';
      if (nextEmail !== existingEmailTrimmed) {
        throw new ForbiddenException(
          'Không thể đổi email tài khoản quản trị hệ thống.',
        );
      }
    }

    if (data.email != null) existing.email = data.email.trim().toLowerCase();
    if (data.name !== undefined) existing.name = data.name ? data.name.trim() : null;
    if (data.password != null && data.password !== '') {
      existing.password = await hash(data.password, 10);
    }
    if (data.bio !== undefined) existing.bio = data.bio ? data.bio.trim() : null;
    if (data.avatar !== undefined) existing.avatar = data.avatar ? data.avatar.trim() : null;
    if (data.phone !== undefined) existing.phone = data.phone ? data.phone.trim() : null;
    if (data.address !== undefined) existing.address = data.address ? data.address.trim() : null;
    if (data.citizenId !== undefined) existing.citizenId = data.citizenId ? data.citizenId.trim() : null;
    if (data.isActive !== undefined) existing.isActive = data.isActive;

    em.persist(existing);
    await em.flush();

    if (data.roleIds !== undefined) {
      const roleIds = Array.isArray(data.roleIds)
        ? data.roleIds.filter((roleId) => String(roleId ?? '').trim() !== '')
        : [];

      await em.nativeDelete(UserRole, { user: entityId });

      if (roleIds.length > 0) {
        for (const roleId of roleIds) {
          const userRole = new UserRole() as Record<string, unknown>;
          userRole.user = existing;
          userRole.role = em.getReference(Role, this.toEntityId(roleId));
          em.persist(userRole);
        }
        await em.flush();
      }
    }

    const user = await this.getUserWithRoles(id);
    return user ? this.mapRow(user) : null;
  }

  /**
   * Check if user can edit protected admin
   */
  protected canEditProtectedAdminUser(
    actorEmail: string,
    targetEmail: string,
  ): boolean {
    const protectedEmails = ['admin@localhost', 'superadmin@localhost'];
    const normalizedActor = actorEmail.trim().toLowerCase();
    const normalizedTarget = targetEmail.trim().toLowerCase();
    return normalizedActor === normalizedTarget || !protectedEmails.includes(normalizedTarget);
  }

  /**
   * Check if email is protected admin
   */
  protected isProtectedAdminEmail(email: string): boolean {
    const protectedEmails = ['admin@localhost', 'superadmin@localhost'];
    return protectedEmails.includes(email.trim().toLowerCase());
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;

    const entityId = this.toEntityId(id);
    const found = await em.findOne(User, { id: entityId });
    const user = found as Record<string, unknown> | null;

    if (!user || user.deletedAt) return false;

    const email = user.email as string;
    if (this.isProtectedAdminEmail(email)) {
      throw new ForbiddenException(
        `Tài khoản ${email} là tài khoản hệ thống, không thể xóa.`,
      );
    }

    user.deletedAt = new Date();
    em.persist(user);
    await em.flush();
    return true;
  }

  /**
   * Restore soft-deleted user
   */
  async restore(id: string): Promise<boolean> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;

    const entityId = this.toEntityId(id);
    const found = await em.findOne(User, { id: entityId });
    const user = found as Record<string, unknown> | null;

    if (!user || !user.deletedAt) return false;

    user.deletedAt = null;
    em.persist(user);
    await em.flush();
    return true;
  }

  /**
   * Hard delete user
   */
  async hardDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;

    const entityId = this.toEntityId(id);
    const found = await em.findOne(User, { id: entityId });
    const user = found as Record<string, unknown> | null;

    if (!user) return false;

    const email = user.email as string;
    if (this.isProtectedAdminEmail(email)) {
      throw new ForbiddenException(
        `Tài khoản ${email} là tài khoản hệ thống, không thể xóa vĩnh viễn.`,
      );
    }

    em.remove(user);
    await em.flush();
    return true;
  }

  /**
   * Bulk operation on users
   */
  async bulk(
    action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive',
    ids: string[],
  ): Promise<BulkOperationResult> {
    if (!ids.length) {
      return { affected: 0, message: 'Không có bản ghi nào' };
    }

    const em = this.getEm();
    const User = this.getUserEntity() as new () => Record<string, unknown>;
    const UserRole = this.getUserRoleEntity() as new () => Record<string, unknown>;

    if (action === 'delete') {
      const users = await em.find(User, {
        id: { $in: this.toEntityIdList(ids) },
        deletedAt: null,
      });

      const filtered = users.filter(
        (u) => !this.isProtectedAdminEmail(u.email as string),
      );
      const skipCount = users.length - filtered.length;

      if (filtered.length > 0) {
        await em.nativeUpdate(
          User,
          { id: { $in: filtered.map((u) => u.id) } },
          { deletedAt: new Date() },
        );
      }

      const msg =
        skipCount > 0
          ? `Đã xóa ${filtered.length} người dùng, bỏ qua ${skipCount} tài khoản hệ thống`
          : `Đã xóa ${filtered.length} người dùng`;
      return { affected: filtered.length, message: msg };
    }

    if (action === 'restore') {
      const result = await em.nativeUpdate(
        User,
        { id: { $in: this.toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} người dùng`,
      };
    }

    if (action === 'hard-delete') {
      const users = await em.find(User, { id: { $in: this.toEntityIdList(ids) } });
      const filtered = users.filter(
        (u) => !this.isProtectedAdminEmail(u.email as string),
      );
      const skipCount = users.length - filtered.length;

      if (filtered.length > 0) {
        for (const user of filtered) {
          em.remove(user);
        }
        await em.flush();
      }

      const msg =
        skipCount > 0
          ? `Đã xóa vĩnh viễn ${filtered.length} người dùng, bỏ qua ${skipCount} tài khoản hệ thống`
          : `Đã xóa vĩnh viễn ${filtered.length} người dùng`;
      return { affected: filtered.length, message: msg };
    }

    if (action === 'active') {
      const result = await em.nativeUpdate(
        User,
        { id: { $in: this.toEntityIdList(ids) } },
        { isActive: true },
      );
      return {
        affected: result ?? 0,
        message: `Đã kích hoạt ${result ?? 0} người dùng`,
      };
    }

    if (action === 'unactive') {
      const superAdminRows = await em.find(
        UserRole,
        { role: { name: 'super_admin' } },
        { populate: ['user', 'role'] },
      );

      const superAdminIds = new Set(
        superAdminRows.map((userRole: Record<string, unknown>) => {
          const user = userRole.user as Record<string, unknown>;
          return user.id;
        }),
      );

      const idsToUnactive = ids.filter(
        (id) => !superAdminIds.has(this.toEntityId(id)),
      );

      if (!idsToUnactive.length) {
        return {
          affected: 0,
          message: 'Không thể hủy kích hoạt tài khoản Super Admin',
          affectedUserIds: [],
        };
      }

      const result = await em.nativeUpdate(
        User,
        { id: { $in: this.toEntityIdList(idsToUnactive) } },
        { isActive: false },
      );

      return {
        affected: result ?? 0,
        message: `Đã hủy kích hoạt ${result ?? 0} người dùng`,
        affectedUserIds: idsToUnactive,
      };
    }

    return { affected: 0, message: 'Action không hợp lệ' };
  }
}
