/**
 * Auth Service — login / OAuth / dev options (materialize → apps/main/api module-bases).
 */
import type { EntityManager } from '@mikro-orm/core';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { parseEntityId } from '../../index';
import {
  filterDevLoginOptions,
  mapUserToDevLoginOption,
  type DevLoginOptionDto,
  type DevLoginOptionsQuery,
} from '../../app/dev-login-options';
import { AUTH_ROLE_NAMES } from '../../../config/constants';;

export type { DevLoginOptionDto } from '../../app/dev-login-options';

export type AuthRolePayload = {
  id: number;
  name: string;
  displayName: string;
};

export type GoogleProfileDto = {
  email: string;
  name?: string | null;
  image?: string | null;
};

export type AuthLoginPayload = {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  permissions: string[];
  roles: AuthRolePayload[];
};

type UserRoleRecord = {
  role?: {
    id?: number | string | null;
    name?: string | null;
    displayName?: string | null;
    permissions?: unknown;
    deletedAt?: unknown;
  } | null;
};

function normalizePermissionValues(value: unknown): string[] {
  const visit = (input: unknown): string[] => {
    if (Array.isArray(input)) {
      return input.flatMap((item) => visit(item));
    }
    if (typeof input !== 'string') {
      return [];
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }

    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  };

  return [...new Set(visit(value))];
}

const IMPORT_NULL_MARKER = '__HUB_NULL__';

function isEntitySoftDeleted(deletedAt: unknown): boolean {
  if (deletedAt == null) return false;
  if (
    typeof deletedAt === 'string' &&
    deletedAt.trim() === IMPORT_NULL_MARKER
  ) {
    return false;
  }
  return true;
}

export abstract class BaseAuthService {
  protected abstract getEm(): EntityManager;

  protected abstract getUserEntity(): new () => Record<string, unknown>;

  protected getRoleEntity(): (new () => Record<string, unknown>) | null {
    return null;
  }

  protected getUserRoleEntity(): (new () => Record<string, unknown>) | null {
    return null;
  }

  protected getSettingEntity(): (new () => Record<string, unknown>) | null {
    return null;
  }

  protected listUserRoles(user: Record<string, unknown>): UserRoleRecord[] {
    const userRoles = user.userRoles;
    if (!userRoles) return [];
    if (Array.isArray(userRoles)) return userRoles as UserRoleRecord[];
    if (
      typeof userRoles === 'object' &&
      userRoles !== null &&
      'getItems' in userRoles &&
      typeof (userRoles as { getItems: () => unknown }).getItems === 'function'
    ) {
      return (userRoles as { getItems: () => UserRoleRecord[] }).getItems();
    }
    return [];
  }

  protected mapUserToPayload(user: Record<string, unknown>): AuthLoginPayload {
    const activeRoles = this.listUserRoles(user).filter(
      (entry) => entry.role && !isEntitySoftDeleted(entry.role.deletedAt),
    );
    const roles = activeRoles
      .map((entry) => {
        const role = entry.role;
        if (!role?.id || !role.name) return null;
        return {
          id: typeof role.id === 'number' ? role.id : Number.parseInt(String(role.id), 10),
          name: String(role.name),
          displayName: String(role.displayName ?? role.name),
        };
      })
      .filter((value): value is AuthRolePayload => Boolean(value));

    const permissions = [
      ...new Set(
        activeRoles.flatMap((entry) => normalizePermissionValues(entry.role?.permissions)),
      ),
    ];

    return {
      id: parseEntityId(user.id as string | number),
      email: String(user.email ?? ''),
      name: (user.name as string | null | undefined) ?? null,
      image: (user.avatar as string | null | undefined) ?? null,
      permissions,
      roles,
    };
  }

  async login(dto: {
    email?: string;
    password?: string;
  }): Promise<AuthLoginPayload | null> {
    const email = dto.email?.trim().toLowerCase();
    if (!email || !dto.password) {
      return null;
    }

    const user = await this.getEm().findOne(
      this.getUserEntity(),
      { email } as never,
      { populate: ['userRoles', 'userRoles.role'] },
    );

    const row = user as Record<string, unknown> | null;
    if (!row || row.isActive !== true || row.deletedAt != null) {
      return null;
    }

    const storedPassword = String(row.password ?? '');
    if (!storedPassword) {
      return null;
    }

    const isValid = await compare(dto.password, storedPassword);
    if (!isValid) {
      return null;
    }

    const payload = this.mapUserToPayload(row);
    return payload.roles.length ? payload : null;
  }

  async tryAuthPayloadByUserId(userId: string): Promise<{
    payload: AuthLoginPayload | null;
    reason?: 'not_found' | 'inactive' | 'no_roles';
  }> {
    if (!userId?.trim()) {
      return { payload: null, reason: 'not_found' };
    }

    let parsedId: number;
    try {
      parsedId = parseEntityId(userId);
    } catch {
      return { payload: null, reason: 'not_found' };
    }

    const user = await this.getEm().findOne(
      this.getUserEntity(),
      { id: parsedId } as never,
      { populate: ['userRoles', 'userRoles.role'] },
    );

    const row = user as Record<string, unknown> | null;
    if (!row) {
      return { payload: null, reason: 'not_found' };
    }
    if (row.isActive !== true || row.deletedAt != null) {
      return { payload: null, reason: 'inactive' };
    }

    const payload = this.mapUserToPayload(row);
    if (!payload.roles.length) {
      return { payload: null, reason: 'no_roles' };
    }

    return { payload };
  }

  async tryAuthPayloadByEmail(email: string): Promise<{
    payload: AuthLoginPayload | null;
    reason?: 'not_found' | 'inactive' | 'no_roles';
  }> {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) {
      return { payload: null, reason: 'not_found' };
    }

    const user = await this.getEm().findOne(
      this.getUserEntity(),
      { email: normalized } as never,
      { populate: ['userRoles', 'userRoles.role'] },
    );

    const row = user as Record<string, unknown> | null;
    if (!row) {
      return { payload: null, reason: 'not_found' };
    }
    if (row.isActive !== true || row.deletedAt != null) {
      return { payload: null, reason: 'inactive' };
    }

    const payload = this.mapUserToPayload(row);
    if (!payload.roles.length) {
      return { payload: null, reason: 'no_roles' };
    }

    return { payload };
  }

  async getAuthPayloadByUserId(userId: string): Promise<AuthLoginPayload | null> {
    const { payload } = await this.tryAuthPayloadByUserId(userId);
    return payload;
  }

  logout(_userId?: string): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }

  async loginAsDevelopmentUser(userId: string): Promise<AuthLoginPayload | null> {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    return this.getAuthPayloadByUserId(userId.trim());
  }

  async verifyGoogleToken(credential: string): Promise<GoogleProfileDto | null> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return null;
    }
    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        return null;
      }
      return {
        email: payload.email,
        name: payload.name ?? null,
        image: payload.picture ?? null,
      };
    } catch {
      return null;
    }
  }

  async loginWithGoogleAsStudent(profile: GoogleProfileDto): Promise<AuthLoginPayload | null> {
    const Role = this.getRoleEntity();
    const UserRole = this.getUserRoleEntity();
    if (!Role || !UserRole) {
      return null;
    }

    const payload = await this.loginWithGoogle(profile);
    if (!payload) return null;

    const hasStudent = payload.roles.some((role) => role.name === AUTH_ROLE_NAMES.STUDENT);
    if (hasStudent) return payload;

    const roleId = await this.getOrCreateRole(AUTH_ROLE_NAMES.STUDENT, 'Sinh viên');
    await this.assignRoleIfMissing(payload.id, roleId);
    return await this.getAuthPayloadByUserId(String(payload.id));
  }

  protected async getDefaultNewUserRole(): Promise<{ name: string; displayName: string }> {
    const Setting = this.getSettingEntity();
    if (Setting) {
      const setting = (await this.getEm().findOne(Setting, {
        key: 'default_new_user_role',
      } as never)) as Record<string, unknown> | null;
      if (setting?.value && typeof setting.value === 'string') {
        const roleName = setting.value.trim().toLowerCase().replace(/^"|"$/g, '');
        if (roleName) return { name: roleName, displayName: roleName };
      }
    }
    return { name: AUTH_ROLE_NAMES.PARENT, displayName: 'Phu huynh' };
  }

  protected async getOrCreateRole(name: string, displayName: string): Promise<number> {
    const Role = this.getRoleEntity();
    if (!Role) {
      throw new Error('Role entity not configured');
    }
    const em = this.getEm() as unknown as {
      findOne: (...args: unknown[]) => Promise<unknown>;
      persist: (entity: unknown) => void;
      flush: () => Promise<void>;
    };

    const existing = (await em.findOne(Role, { name } as never)) as Record<string, unknown> | null;
    if (existing?.id != null) {
      return parseEntityId(existing.id as string | number);
    }

    const created = new Role() as Record<string, unknown>;
    created.name = name;
    created.displayName = displayName;
    created.isActive = true;
    em.persist(created);
    await em.flush();
    return parseEntityId(created.id as string | number);
  }

  protected async assignRoleIfMissing(userId: number, roleId: number): Promise<void> {
    const UserRole = this.getUserRoleEntity();
    const Role = this.getRoleEntity();
    const User = this.getUserEntity();
    if (!UserRole || !Role) {
      throw new Error('UserRole/Role entity not configured');
    }

    const emAny = this.getEm() as unknown as {
      findOne: (...args: unknown[]) => Promise<unknown>;
      persist: (entity: unknown) => void;
      flush: () => Promise<void>;
      getReference?: (Entity: unknown, id: unknown) => unknown;
    };

    const existing = await emAny.findOne(UserRole, {
      user: userId,
      role: roleId,
    } as never);
    if (existing) return;

    const ur = new UserRole() as Record<string, unknown>;
    const userRef = emAny.getReference ? emAny.getReference(User, userId) : ({ id: userId } as unknown);
    const roleRef = emAny.getReference ? emAny.getReference(Role, roleId) : ({ id: roleId } as unknown);
    ur.user = userRef as never;
    ur.role = roleRef as never;
    emAny.persist(ur);
    await emAny.flush();
  }

  async loginWithGoogle(profile: GoogleProfileDto): Promise<AuthLoginPayload | null> {
    const email = profile.email?.trim().toLowerCase();
    if (!email) return null;

    const emAny = this.getEm() as unknown as {
      findOne: (...args: unknown[]) => Promise<unknown>;
      persist: (entity: unknown) => void;
      flush: () => Promise<void>;
    };
    const User = this.getUserEntity();

    let user = (await emAny.findOne(
      User,
      { email } as never,
      { populate: ['userRoles', 'userRoles.role'] },
    )) as Record<string, unknown> | null;

    if (user) {
      if (user.isActive !== true || user.deletedAt != null) return null;
      const payload = this.mapUserToPayload(user);
      if (payload.roles.length) return payload;
    }

    const Role = this.getRoleEntity();
    const UserRole = this.getUserRoleEntity();
    if (!Role || !UserRole) {
      return null;
    }

    const defaultRole = await this.getDefaultNewUserRole();
    const roleId = await this.getOrCreateRole(defaultRole.name, defaultRole.displayName);

    const password = await hash(randomBytes(16).toString('hex'), 10);
    const newUser = new User() as Record<string, unknown>;
    newUser.email = email;
    newUser.name = profile.name ?? null;
    newUser.password = password;
    newUser.isActive = true;
    emAny.persist(newUser);
    await emAny.flush();

    await this.assignRoleIfMissing(parseEntityId(newUser.id as string | number), roleId);

    user = (await emAny.findOne(
      User,
      { email } as never,
      { populate: ['userRoles', 'userRoles.role'] },
    )) as Record<string, unknown> | null;

    if (!user) return null;
    const payload = this.mapUserToPayload(user);
    return payload.roles.length ? payload : null;
  }

  async register(dto: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<AuthLoginPayload> {
    const Role = this.getRoleEntity();
    const UserRole = this.getUserRoleEntity();
    if (!Role || !UserRole) {
      throw new Error('Auth entities not configured');
    }

    const fullName = dto.fullName?.trim();
    const email = dto.email?.trim().toLowerCase();
    const password = dto.password?.trim();
    if (!fullName || !email || !password) {
      throw new Error('Vui long dien day du ho ten, email va mat khau.');
    }

    const emAny = this.getEm() as unknown as {
      findOne: (...args: unknown[]) => Promise<unknown>;
      persist: (entity: unknown) => void;
      flush: () => Promise<void>;
    };
    const User = this.getUserEntity();

    const existing = (await emAny.findOne(User, { email } as never)) as
      | Record<string, unknown>
      | null;
    if (existing) {
      throw new Error('Email da ton tai.');
    }

    const role = await this.getDefaultNewUserRole();
    const roleId = await this.getOrCreateRole(role.name, role.displayName);

    const newUser = new User() as Record<string, unknown>;
    newUser.email = email;
    newUser.name = fullName;
    newUser.password = await hash(password, 10);
    newUser.phone = dto.phone?.trim() ? dto.phone.trim() : null;
    newUser.address = dto.address?.trim() ? dto.address.trim() : null;
    newUser.isActive = true;
    emAny.persist(newUser);
    await emAny.flush();

    const userId = parseEntityId(newUser.id as string | number);
    await this.assignRoleIfMissing(userId, roleId);

    const payload = await this.getAuthPayloadByUserId(String(userId));
    if (!payload) {
      throw new Error('Khong the tao tai khoan.');
    }
    return payload;
  }

  async listDevelopmentLoginOptions(
    query: DevLoginOptionsQuery = {},
  ): Promise<DevLoginOptionDto[]> {
    const rows = (await this.getEm().find(
      this.getUserEntity(),
      { deletedAt: null } as never,
      {
        populate: ['userRoles', 'userRoles.role'] as never,
        orderBy: [{ name: 'ASC' }, { email: 'ASC' }],
      },
    )) as Parameters<typeof mapUserToDevLoginOption>[0][];

    const options = rows
      .map((user) => mapUserToDevLoginOption(user))
      .filter((value): value is DevLoginOptionDto => Boolean(value));

    return filterDevLoginOptions(options, query);
  }
}
