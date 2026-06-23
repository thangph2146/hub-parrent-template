/** AUTO-GENERATED ? materialize t? @workspace/api-server/deploy/nest. Ch?y: pnpm api:render */
import type { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import {
  SUPERADMIN_ROLES_DATA,
  SUPERADMIN_USERS_DATA,
  SUPERADMIN_USER_ROLES_DATA,
} from './superadmin-bootstrap.data';
import { ACTIVE_ROLE_PRESETS } from '../config/active-permissions';

const ACTIVE_ROLE_PRESET_SET = new Set<string>(ACTIVE_ROLE_PRESETS);

function listUserRoleLinks(user: User): UserRole[] {
  const userRoles = user.userRoles;
  if (!userRoles) return [];
  if (Array.isArray(userRoles)) return userRoles;
  if (
    typeof userRoles === 'object' &&
    userRoles !== null &&
    'getItems' in userRoles &&
    typeof (userRoles as { getItems: () => unknown }).getItems === 'function'
  ) {
    return (userRoles as { getItems: () => UserRole[] }).getItems();
  }
  return [];
}

async function resolveUserRoleLink(
  em: EntityManager,
  link: { userEmail: string; roleName: string },
): Promise<UserRole | null> {
  const user = await em.findOne(User, {
    email: link.userEmail.trim().toLowerCase(),
  });
  const role = await em.findOne(Role, { name: link.roleName.trim() });
  if (!user || !role) return null;

  const existing = await em.findOne(UserRole, { user: user.id, role: role.id });
  if (existing) return existing;

  const ur = new UserRole();
  ur.user = user;
  ur.role = role;
  em.persist(ur);
  return ur;
}

/**
 * ??m b?o c?c c?p (user, role) trong seed t?n t?i trong user_roles n?u user + role ?? c?.
 */
export async function ensureSeedUserRoleLinks(
  em: EntityManager,
): Promise<void> {
  for (const link of SUPERADMIN_USER_ROLES_DATA) {
    await resolveUserRoleLink(em, link);
  }

  const conn = em.getConnection();
  const driverName = em.getDriver().constructor.name;
  const isMysql = /mysql|mariadb/i.test(driverName);
  if (isMysql) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  await em.flush();
  if (isMysql) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
}

function isPopulatedImportRole(role: Role | null | undefined): role is Role {
  return (
    role != null &&
    typeof role === 'object' &&
    typeof role.name === 'string' &&
    role.name.trim().length > 0
  );
}

/** Kh?p mapUserToPayload ? role ph?i c? id + name v? ch?a x?a m?m. */
function isAuthUsableImportRole(role: Role | null | undefined): role is Role {
  if (!isPopulatedImportRole(role)) return false;
  if (isEntitySoftDeleted(role.deletedAt)) return false;
  return role.id != null && String(role.id).trim() !== '';
}

function isEntitySoftDeleted(deletedAt: unknown): boolean {
  if (deletedAt == null) return false;
  if (
    typeof deletedAt === 'string' &&
    deletedAt.trim() === '__HUB_NULL__'
  ) {
    return false;
  }
  return true;
}

async function resolveActingUserForImport(
  em: EntityManager,
  actingUserId?: number,
  actingUserEmail?: string,
): Promise<User | null> {
  const email = actingUserEmail?.trim().toLowerCase();
  if (email) {
    const byEmail = await em.findOne(User, { email });
    if (byEmail) return byEmail;
  }
  if (actingUserId != null) {
    return em.findOne(User, { id: actingUserId });
  }
  return null;
}

/** Sau import role (TRUNCATE user_roles), g?n l?i role cho admin ?ang thao t?c import. */
export async function ensureActingUserRoleAfterImport(
  em: EntityManager,
  actingUserId?: number,
  actingUserEmail?: string,
): Promise<void> {
  const user = await resolveActingUserForImport(
    em,
    actingUserId,
    actingUserEmail,
  );
  if (!user) return;

  const roleLinks = await em.find(
    UserRole,
    { user: user.id },
    { populate: ['role'] },
  );
  const authUsableLinks = roleLinks.filter((link) =>
    isAuthUsableImportRole(link.role),
  );

  if (authUsableLinks.length > 0) return;

  for (const link of roleLinks) {
    if (!isAuthUsableImportRole(link.role)) {
      em.remove(link);
    }
  }
  if (roleLinks.length > authUsableLinks.length) {
    await em.flush();
  }

  const role =
    (await em.findOne(Role, { name: 'super_admin' })) ??
    (await em.findOne(Role, { isActive: true }, { orderBy: { id: 'ASC' } }));
  if (!role) return;

  const ur = new UserRole();
  ur.user = user;
  ur.role = role;
  em.persist(ur);
  await em.flush();
}

export type SuperadminBootstrapResult = {
  rolesInserted: number;
  rolesUpdated: number;
  rolesSkipped: number;
  usersInserted: number;
  usersUpdated: number;
  usersSkipped: number;
  userRolesInserted: number;
  userRolesSkipped: number;
  pageContentsInserted: number;
  pageContentsSkipped: number;
};

/**
 * Idempotent: gi?ng `pnpm run seed:superadmin` (roles, users, user_roles).
 */
export async function runSuperadminBootstrap(
  em: EntityManager,
  log?: (message: string) => void,
): Promise<SuperadminBootstrapResult> {
  const out: SuperadminBootstrapResult = {
    rolesInserted: 0,
    rolesUpdated: 0,
    rolesSkipped: 0,
    usersInserted: 0,
    usersUpdated: 0,
    usersSkipped: 0,
    userRolesInserted: 0,
    userRolesSkipped: 0,
    pageContentsInserted: 0,
    pageContentsSkipped: 0,
  };

  const L = log ?? (() => undefined);

  L('Seeding roles...');
  for (const roleData of SUPERADMIN_ROLES_DATA) {
    const existing = await em.findOne(Role, { name: roleData.name });
    if (!existing) {
      const role = new Role();
      role.name = roleData.name;
      role.displayName = roleData.displayName;
      role.description = roleData.description;
      role.permissions = roleData.permissions;
      role.isActive = roleData.isActive;
      em.persist(role);
      out.rolesInserted++;
      L(`Created role: ${roleData.name}`);
    } else {
      existing.displayName = roleData.displayName;
      existing.description = roleData.description;
      existing.permissions = roleData.permissions;
      existing.isActive = roleData.isActive;
      em.persist(existing);
      out.rolesUpdated++;
      L(`Updated role: ${roleData.name}`);
    }
  }

  await em.flush();
  L('Roles committed.');

  L('Deactivating roles outside product-line presets...');
  const orphanRoles = await em.find(Role, {
    name: { $nin: [...ACTIVE_ROLE_PRESET_SET] },
    isActive: true,
  });
  for (const role of orphanRoles) {
    role.isActive = false;
    em.persist(role);
    L(`Deactivated orphan role: ${role.name}`);
  }
  await em.flush();

  L('Seeding users...');
  for (const userData of SUPERADMIN_USERS_DATA) {
    const email = userData.email.trim().toLowerCase();
    const existing = await em.findOne(User, { email });
    if (!existing) {
      const user = new User();
      user.email = email;
      user.name = userData.name;
      user.password = userData.password;
      user.bio = userData.bio;
      user.avatar = userData.avatar;
      user.emailVerified = userData.emailVerified;
      user.phone = userData.phone;
      user.address = userData.address;
      user.isActive = userData.isActive;
      em.persist(user);
      out.usersInserted++;
      L(`Created user: ${email}`);
    } else {
      existing.name = userData.name;
      existing.password = userData.password;
      existing.bio = userData.bio;
      existing.avatar = userData.avatar;
      existing.emailVerified = userData.emailVerified;
      existing.phone = userData.phone;
      existing.address = userData.address;
      existing.isActive = userData.isActive;
      em.persist(existing);
      out.usersUpdated++;
      L(`Updated user: ${email}`);
    }
  }

  await em.flush();
  L('Users committed.');

  L('Seeding user roles...');
  for (const link of SUPERADMIN_USER_ROLES_DATA) {
    const before = await em.findOne(UserRole, {
      user: { email: link.userEmail.trim().toLowerCase() },
      role: { name: link.roleName.trim() },
    });
    if (before) {
      out.userRolesSkipped++;
      L(`User role already exists: ${link.userEmail} -> ${link.roleName}`);
      continue;
    }
    const created = await resolveUserRoleLink(em, link);
    if (created) {
      out.userRolesInserted++;
      L(`Created user role: ${link.userEmail} -> ${link.roleName}`);
    }
  }

  await em.flush();
  L('User roles committed.');

  return out;
}
