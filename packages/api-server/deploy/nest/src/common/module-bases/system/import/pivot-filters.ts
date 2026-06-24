import type { EntityManager, EntityName } from '@mikro-orm/core';
import {
  isSkippableImportRowError,
  orderCategoryRowsForImport,
  type ImportRow,
  pivotFk,
} from './helpers';
import { getErrorMessage } from './row-schema';
import type { LegacyImportIdMap } from './legacy-id-map';
import { exportLegacyKey } from './legacy-id-map';
import { relationEntityId } from '../../../entity-id';

export async function filterSanitizedPostCategories(
  em: EntityManager,
  sanitized: Record<string, unknown>[],
  postEntity: EntityName<any>,
  categoryEntity: EntityName<any>,
  idMap?: LegacyImportIdMap,
  onWarn?: (message: string) => void,
): Promise<Record<string, unknown>[]> {
  if (idMap) {
    for (const row of sanitized) {
      for (const [field, model, rel] of [
        ['postId', 'post', 'post'],
        ['categoryId', 'category', 'category'],
      ] as const) {
        const raw = pivotFk(row, field, rel);
        if (!raw) continue;
        const resolved = await idMap.resolve(em, model, raw);
        if (resolved != null) row[field] = resolved;
      }
    }
  }

  const postIds = [
    ...new Set(
      sanitized
        .map((r) => relationEntityId(pivotFk(r, 'postId', 'post')))
        .filter((id): id is number => id != null),
    ),
  ];
  const categoryIds = [
    ...new Set(
      sanitized
        .map((r) => relationEntityId(pivotFk(r, 'categoryId', 'category')))
        .filter((id): id is number => id != null),
    ),
  ];
  const [existingPosts, existingCats] = await Promise.all([
    postIds.length
      ? em.find(postEntity, { id: { $in: postIds } }, { fields: ['id'] })
      : [],
    categoryIds.length
      ? em.find(categoryEntity, { id: { $in: categoryIds } }, { fields: ['id'] })
      : [],
  ]);
  const pSet = new Set(existingPosts.map((p) => (p as { id: number }).id));
  const cSet = new Set(existingCats.map((c) => (c as { id: number }).id));
  const out = sanitized.filter((r) => {
    const pid = relationEntityId(pivotFk(r, 'postId', 'post'));
    const cid = relationEntityId(pivotFk(r, 'categoryId', 'category'));
    return pid != null && cid != null && pSet.has(pid) && cSet.has(cid);
  });
  if (out.length < sanitized.length) {
    onWarn?.(
      `postCategory: bỏ qua ${sanitized.length - out.length} dòng (post/category FK chưa resolve hoặc không có trong DB — import post và category trước).`,
    );
  }
  return out;
}

export async function filterSanitizedUserRoles(
  em: EntityManager,
  sanitized: Record<string, unknown>[],
  userEntity: EntityName<any>,
  roleEntity: EntityName<any>,
  userRoleEntity: EntityName<any>,
  onWarn?: (message: string) => void,
  onLog?: (message: string) => void,
): Promise<Record<string, unknown>[]> {
  const userIds = [
    ...new Set(
      sanitized
        .map((r) => relationEntityId(pivotFk(r, 'userId', 'user')))
        .filter((id): id is number => id != null),
    ),
  ];
  const roleIds = [
    ...new Set(
      sanitized
        .map((r) => relationEntityId(pivotFk(r, 'roleId', 'role')))
        .filter((id): id is number => id != null),
    ),
  ];
  const [users, roles] = await Promise.all([
    userIds.length
      ? em.find(userEntity, { id: { $in: userIds } }, { fields: ['id'] })
      : [],
    roleIds.length
      ? em.find(roleEntity, { id: { $in: roleIds } }, { fields: ['id'] })
      : [],
  ]);
  const uSet = new Set(users.map((u) => (u as { id: number }).id));
  const rSet = new Set(roles.map((ro) => (ro as { id: number }).id));
  let out = sanitized.filter((row) => {
    const uid = relationEntityId(pivotFk(row, 'userId', 'user'));
    const rid = relationEntityId(pivotFk(row, 'roleId', 'role'));
    return uid != null && rid != null && uSet.has(uid) && rSet.has(rid);
  });
  if (out.length < sanitized.length) {
    onWarn?.(
      `userRole: bỏ qua ${sanitized.length - out.length} dòng (userId hoặc roleId không tồn tại — import user và role trước).`,
    );
  }

  if (out.length > 0) {
    const existingLinks = await em.find(
      userRoleEntity,
      {
        user: { $in: userIds },
        role: { $in: roleIds },
      },
      { populate: ['user', 'role'] },
    );
    const existingPairs = new Set(
      existingLinks.map(
        (link) =>
          `${relationEntityId((link as { user: unknown }).user)}:${relationEntityId((link as { role: unknown }).role)}`,
      ),
    );
    const beforeExisting = out.length;
    out = out.filter((row) => {
      const uid = relationEntityId(pivotFk(row, 'userId', 'user'));
      const rid = relationEntityId(pivotFk(row, 'roleId', 'role'));
      if (uid == null || rid == null) return false;
      return !existingPairs.has(`${uid}:${rid}`);
    });
    if (out.length < beforeExisting) {
      onLog?.(
        `userRole: bỏ qua ${beforeExisting - out.length} dòng đã tồn tại (userId, roleId).`,
      );
    }
  }

  return out;
}
