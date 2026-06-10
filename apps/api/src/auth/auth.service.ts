import { Injectable, Logger } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Collection, EntityManager } from '@mikro-orm/core';
import { AUTH_ROLE_NAMES } from '../config/constants';
import { parseEntityId, toEntityId } from '../common/entity-id';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleProfileDto {
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface AuthUserPayload {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  permissions: string[];
  roles: Array<{ id: number; name: string; displayName: string }>;
}

/** MikroORM populate trả Collection — chuẩn hóa về mảng trước khi dùng .some/.filter. */
function listUserRoles(
  userRoles: UserRole[] | Collection<UserRole> | undefined,
): UserRole[] {
  if (!userRoles) return [];
  if (Array.isArray(userRoles)) return userRoles;
  if (userRoles instanceof Collection) return userRoles.getItems();
  return Array.from(userRoles as Iterable<UserRole>);
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly em: EntityManager) {}

  async verifyGoogleToken(credential: string): Promise<{
    email: string;
    name?: string | null;
    image?: string | null;
  } | null> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      this.logger.warn('GOOGLE_CLIENT_ID not configured');
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
        this.logger.warn('Google token missing email');
        return null;
      }
      return {
        email: payload.email,
        name: payload.name ?? null,
        image: payload.picture ?? null,
      };
    } catch (err) {
      this.logger.error('Google token verification failed', err);
      return null;
    }
  }

  private async getOrCreateRole(
    name: string,
    displayName: string,
  ): Promise<{ id: number }> {
    let role = await this.em.findOne(Role, { name });
    if (!role) {
      role = new Role();
      role.name = name;
      role.displayName = displayName;
      role.isActive = true;
      this.em.persist(role);
      await this.em.flush();
    }
    return { id: role.id };
  }

  private async getDefaultNewUserRole(): Promise<{
    name: string;
    displayName: string;
  }> {
    const setting = await this.em.findOne(Setting, {
      key: 'default_new_user_role',
    });
    if (setting?.value && typeof setting.value === 'string') {
      const roleName = setting.value.trim().toLowerCase().replace(/^"|"$/g, '');
      if (roleName) return { name: roleName, displayName: roleName };
    }
    return { name: AUTH_ROLE_NAMES.PARENT, displayName: 'Phụ huynh' };
  }

  private async assignRoleIfMissing(
    userId: number,
    roleId: number,
  ): Promise<void> {
    const exists = await this.em.findOne(UserRole, {
      user: toEntityId(userId),
      role: roleId,
    });
    if (exists) return;

    const link = new UserRole();
    link.user = this.em.getReference(User, userId);
    link.role = this.em.getReference(Role, roleId);
    this.em.persist(link);
    await this.em.flush();
    this.em.clear();
  }

  private mapUserToPayload(user: User): AuthUserPayload {
    const activeUserRoles = listUserRoles(user.userRoles).filter(
      (ur) => ur.role && ur.role.deletedAt == null,
    );
    const permissions = activeUserRoles.flatMap((ur) => {
      const raw = ur.role.permissions;
      if (raw == null) return [];
      if (Array.isArray(raw))
        return raw.filter((p): p is string => typeof p === 'string');
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('{') && trimmed.endsWith('}'))
        ) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed))
              return parsed.filter((p): p is string => typeof p === 'string');
          } catch {
            // not a JSON string
          }
        }
        return [raw];
      }
      return [];
    });
    const roles = activeUserRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
    }));
    return {
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? null,
      image: user.avatar ?? null,
      permissions,
      roles,
    };
  }

  async login(dto: LoginDto): Promise<AuthUserPayload | null> {
    const email = dto.email?.trim()?.toLowerCase();
    if (!email || !dto.password) {
      return null;
    }

    const user = await this.em.findOne(
      User,
      { email },
      { populate: ['userRoles', 'userRoles.role'] },
    );

    if (!user || !user.isActive || user.deletedAt != null) {
      this.logger.warn(
        `Login failed: user not found, inactive, or deleted for email=${email}`,
      );
      return null;
    }

    const isValid = await compare(dto.password, user.password);

    if (!isValid) {
      this.logger.warn(`Login failed: password mismatch for email=${email}`);
      return null;
    }

    if (!listUserRoles(user.userRoles).length) {
      this.logger.warn(
        `Login failed: user has no roles assigned for email=${email}`,
      );
      return null;
    }

    return this.mapUserToPayload(user);
  }

  async loginAsDevelopmentUser(
    userId: string,
  ): Promise<AuthUserPayload | null> {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    const { payload } = await this.tryAuthPayloadByUserId(userId.trim());
    return payload;
  }

  async loginWithGoogleAsParent(
    profile: GoogleProfileDto,
  ): Promise<AuthUserPayload | null> {
    const email = profile.email?.trim()?.toLowerCase();
    if (!email) return null;

    const defaultRole = await this.getDefaultNewUserRole();
    const parentRole = await this.getOrCreateRole(
      defaultRole.name,
      defaultRole.displayName,
    );

    let user = await this.em.findOne(
      User,
      { email },
      { populate: ['userRoles', 'userRoles.role'] },
    );

    if (user) {
      if (!user.isActive || user.deletedAt != null) return null;
      const hasAnyRole = listUserRoles(user.userRoles).length > 0;
      if (!hasAnyRole) {
        const ur = new UserRole();
        ur.user = user;
        ur.role = this.em.getReference(Role, parentRole.id);
        this.em.persist(ur);
        await this.em.flush();
        user = await this.em.findOne(
          User,
          { email },
          { populate: ['userRoles', 'userRoles.role'] },
        );
      }
      if (!user || !listUserRoles(user.userRoles).length) return null;
      return this.mapUserToPayload(user);
    }

    const password = await hash(randomBytes(16).toString('hex'), 10);
    const newUserObj = new User();
    newUserObj.email = email;
    newUserObj.name = profile.name ?? null;
    // không set avatar từ Google — user tự chọn sau để tránh mất quyền upload (student chỉ upload 1 lần)
    newUserObj.password = password;
    newUserObj.isActive = true;
    this.em.persist(newUserObj);
    await this.em.flush();

    const ur1 = new UserRole();
    ur1.user = newUserObj;
    ur1.role = this.em.getReference(Role, parentRole.id);
    this.em.persist(ur1);
    await this.em.flush();

    const created = await this.em.findOne(
      User,
      { email },
      { populate: ['userRoles', 'userRoles.role'] },
    );
    return created ? this.mapUserToPayload(created) : null;
  }

  async loginWithGoogleAsStudent(
    profile: GoogleProfileDto,
  ): Promise<AuthUserPayload | null> {
    const email = profile.email?.trim()?.toLowerCase();
    if (!email) return null;

    const studentRole = await this.getOrCreateRole(
      AUTH_ROLE_NAMES.STUDENT,
      'Sinh viên',
    );

    let user = await this.em.findOne(
      User,
      { email },
      { populate: ['userRoles', 'userRoles.role'] },
    );

    if (user) {
      if (!user.isActive || user.deletedAt != null) return null;
      const hasStudentRole = listUserRoles(user.userRoles).some(
        (ur) => ur.role?.name === AUTH_ROLE_NAMES.STUDENT,
      );
      if (!hasStudentRole) {
        await this.assignRoleIfMissing(user.id, studentRole.id);
        user = await this.em.findOne(
          User,
          { email },
          { populate: ['userRoles', 'userRoles.role'] },
        );
      }
      if (!user || !listUserRoles(user.userRoles).length) return null;
      return this.mapUserToPayload(user);
    }

    const password = await hash(randomBytes(16).toString('hex'), 10);
    const newUserObj = new User();
    newUserObj.email = email;
    newUserObj.name = profile.name ?? null;
    // không set avatar từ Google — sinh viên tự upload một lần ở hồ sơ
    newUserObj.password = password;
    newUserObj.isActive = true;
    this.em.persist(newUserObj);
    await this.em.flush();

    const newUserId = newUserObj.id;
    await this.assignRoleIfMissing(newUserId, studentRole.id);

    const created = await this.em.findOne(
      User,
      { id: newUserId },
      { populate: ['userRoles', 'userRoles.role'] },
    );
    return created ? this.mapUserToPayload(created) : null;
  }

  async loginWithGoogle(
    profile: GoogleProfileDto,
  ): Promise<AuthUserPayload | null> {
    const email = profile.email?.trim()?.toLowerCase();
    if (!email) return null;

    const defaultRole = await this.getDefaultNewUserRole();
    let user = await this.em.findOne(
      User,
      { email },
      { populate: ['userRoles', 'userRoles.role'] },
    );

    if (user) {
      if (!user.isActive || user.deletedAt != null) return null;
      if (!listUserRoles(user.userRoles).length) {
        const role = await this.getOrCreateRole(
          defaultRole.name,
          defaultRole.displayName,
        );
        const ur = new UserRole();
        ur.user = user;
        ur.role = this.em.getReference(Role, role.id);
        this.em.persist(ur);
        await this.em.flush();
        user = await this.em.findOne(
          User,
          { email },
          { populate: ['userRoles', 'userRoles.role'] },
        );
      }
      if (!user || !listUserRoles(user.userRoles).length) return null;
      return this.mapUserToPayload(user);
    }

    const role = await this.getOrCreateRole(
      defaultRole.name,
      defaultRole.displayName,
    );

    const password = await hash(randomBytes(16).toString('hex'), 10);
    const newUserObj = new User();
    newUserObj.email = email;
    newUserObj.name = profile.name ?? null;
    // không set avatar từ Google — user tự chọn sau để tránh mất quyền upload (student chỉ upload 1 lần)
    newUserObj.password = password;
    newUserObj.isActive = true;
    this.em.persist(newUserObj);
    await this.em.flush();

    const ur1 = new UserRole();
    ur1.user = newUserObj;
    ur1.role = this.em.getReference(Role, role.id);
    this.em.persist(ur1);
    await this.em.flush();

    const created = await this.em.findOne(
      User,
      { email },
      { populate: ['userRoles', 'userRoles.role'] },
    );
    return created ? this.mapUserToPayload(created) : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout(_userId?: string): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }

  /**
   * Giống getAuthPayloadByUserId nhưng trả `reason` để API /me báo lỗi rõ
   * (vd. sau import user mà chưa có user_roles).
   */
  async tryAuthPayloadByUserId(userId: string): Promise<{
    payload: AuthUserPayload | null;
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

    const user = await this.em.findOne(
      User,
      { id: parsedId },
      { populate: ['userRoles', 'userRoles.role'] },
    );

    if (!user) {
      return { payload: null, reason: 'not_found' };
    }

    if (!user.isActive || user.deletedAt != null) {
      return { payload: null, reason: 'inactive' };
    }

    const activeUserRoles = listUserRoles(user.userRoles).filter(
      (ur) => ur.role && ur.role.deletedAt == null,
    );
    if (!activeUserRoles.length) {
      this.logger.warn(
        `User ${userId} tồn tại nhưng không có user_roles / role hợp lệ — /auth/admin/me và đăng nhập sẽ thất bại cho đến khi gán role.`,
      );
      return { payload: null, reason: 'no_roles' };
    }

    return { payload: this.mapUserToPayload(user) };
  }

  async getAuthPayloadByUserId(
    userId: string,
  ): Promise<AuthUserPayload | null> {
    const { payload } = await this.tryAuthPayloadByUserId(userId);
    return payload;
  }
}
