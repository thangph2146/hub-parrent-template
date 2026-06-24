import { wrap, type EntityManager, type EntityName } from '@mikro-orm/core';
import { flattenEntityRowForExport } from './row-flatten';

/** Pivot ManyToOne PK — export thủ công khớp bundle import cũ. */
export async function exportPostCategoryRows(
  em: EntityManager,
  entity: EntityName<any>,
): Promise<Array<{ postId: string; categoryId: string }>> {
  const rows = await em.find(entity, {});
  return rows.map((pc) => ({
    postId: String(wrap(pc.post, true).getPrimaryKey()),
    categoryId: String(wrap(pc.category, true).getPrimaryKey()),
  }));
}

export async function exportPostTagRows(
  em: EntityManager,
  entity: EntityName<any>,
): Promise<Array<{ postId: string; tagId: string }>> {
  const rows = await em.find(entity, {});
  return rows.map((pt) => ({
    postId: String(wrap(pt.post, true).getPrimaryKey()),
    tagId: String(wrap(pt.tag, true).getPrimaryKey()),
  }));
}

/** User: đảm bảo export cả password hash (serialize() có thể bỏ hidden fields). */
export async function exportUserRows(
  em: EntityManager,
  entity: EntityName<any>,
  entityKey: string,
): Promise<Record<string, unknown>[]> {
  const rows = await em.find(entity, {});
  return rows.map((u) => {
    const obj = flattenEntityRowForExport(em, entityKey, u);
    obj.password = u.password;
    return obj;
  });
}
