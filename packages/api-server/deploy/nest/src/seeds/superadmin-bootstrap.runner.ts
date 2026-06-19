import type { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import {
  SUPERADMIN_ROLES_DATA,
  SUPERADMIN_USERS_DATA,
  SUPERADMIN_USER_ROLES_DATA,
} from './superadmin-bootstrap.data';

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
 * Đảm bảo các cặp (user, role) trong seed tồn tại trong user_roles nếu user + role đã có.
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

/** Sau import role (TRUNCATE user_roles), gán lại role cho admin đang thao tác import. */
export async function ensureActingUserRoleAfterImport(
  em: EntityManager,
  actingUserId?: number,
): Promise<void> {
  if (actingUserId == null) return;
  const existing = await em.count(UserRole, { user: actingUserId });
  if (existing > 0) return;

  const user = await em.findOne(User, { id: actingUserId });
  if (!user) return;

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
 * Idempotent: giống `pnpm run seed:superadmin` (roles, users, user_roles).
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
