import type { EntityManager, EntityName } from '@mikro-orm/core';
import { filterUserRowsForActingUserPreserve } from './acting-user';
import { exportLegacyKey, type LegacyImportIdMap } from './legacy-id-map';
import { pickImportPayload } from './payload';
import { isManyToOneImportProperty } from './row-schema';

export type ImportLegacyContext = {
  entityByModelName: Record<string, EntityName<any>>;
  modelNameByEntityClass: Record<string, string>;
  getEntityName: (entity: EntityName<any>) => string;
  modelEntity: (modelKey: string) => EntityName<any>;
};

/** Gắn FK legacy (UUID) → id int mới qua map đã lưu khi import user/role/... */
export async function resolveLegacyForeignKeysInRows(
  em: EntityManager,
  ctx: ImportLegacyContext,
  mName: string,
  rows: Record<string, unknown>[],
  idMap: LegacyImportIdMap,
): Promise<void> {
  const entity = ctx.entityByModelName[mName];
  if (!entity || rows.length === 0) return;
  const meta = em.getMetadata().find(ctx.getEntityName(entity));
  if (!meta) return;

  for (const prop of Object.values(meta.properties)) {
    if (!isManyToOneImportProperty(prop)) continue;
    const targetClass = (prop as { targetMeta?: { className?: string } })
      .targetMeta?.className;
    const targetModel = targetClass
      ? ctx.modelNameByEntityClass[targetClass]
      : undefined;
    if (!targetModel) continue;
    const fieldName = prop.fieldNames?.[0] ?? `${prop.name}Id`;

    for (const row of rows) {
      let raw: unknown;
      if (Object.prototype.hasOwnProperty.call(row, fieldName)) {
        raw = row[fieldName];
      } else if (Object.prototype.hasOwnProperty.call(row, prop.name)) {
        raw = row[prop.name];
      }
      if (raw == null || raw === '') continue;
      const resolved = await idMap.resolve(em, targetModel, raw);
      if (resolved != null) {
        row[fieldName] = resolved;
        if (fieldName !== prop.name) delete row[prop.name];
      }
    }
  }
}

/** Sau insert, lưu map id export cũ → id DB (settings) để các lô import sau resolve FK. */
export async function registerLegacyIdsAfterModelImport(
  em: EntityManager,
  ctx: ImportLegacyContext,
  mName: string,
  rawRecords: Record<string, unknown>[],
  idMap: LegacyImportIdMap,
  preserveUserId?: number,
): Promise<void> {
  let wrote = false;
  let preservedUserEmail: string | undefined;
  if (mName === 'user' && preserveUserId != null) {
    const preserved = await em.findOne(
      ctx.modelEntity('user'),
      { id: preserveUserId },
      { fields: ['email'] },
    );
    preservedUserEmail = preserved?.email?.trim().toLowerCase();
  }

  for (const raw of rawRecords) {
    const legacy = exportLegacyKey(raw.id);
    if (!legacy) continue;

    let newId: number | undefined;
    if (mName === 'user') {
      const email =
        typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
      if (!email) continue;
      if (preservedUserEmail && email === preservedUserEmail) {
        newId = preserveUserId;
      } else {
        newId = (await em.findOne(ctx.modelEntity('user'), { email }))?.id;
      }
    } else if (mName === 'role') {
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      if (!name) continue;
      newId = (await em.findOne(ctx.modelEntity('role'), { name }))?.id;
    } else if (mName === 'category') {
      const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
      if (!slug) continue;
      newId = (await em.findOne(ctx.modelEntity('category'), { slug }))?.id;
    } else if (mName === 'tag') {
      const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
      if (!slug) continue;
      newId = (await em.findOne(ctx.modelEntity('tag'), { slug }))?.id;
    } else if (mName === 'post') {
      const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
      if (!slug) continue;
      newId = (await em.findOne(ctx.modelEntity('post'), { slug }))?.id;
    } else {
      continue;
    }

    if (newId != null) {
      await idMap.persist(em, mName, legacy, newId);
      wrote = true;
    }
  }
  if (wrote) await em.flush();
}

export async function buildSanitizedImportRows(
  em: EntityManager,
  ctx: ImportLegacyContext,
  mName: string,
  records: Record<string, unknown>[],
  idMap: LegacyImportIdMap,
  preserveUserId?: number,
  onUserRowsFiltered?: (skipped: number, userId: number) => void,
): Promise<Record<string, unknown>[]> {
  const entity = ctx.entityByModelName[mName];
  if (!entity) return [];

  const rawRows = records.map((r) => ({ ...r }));
  await resolveLegacyForeignKeysInRows(em, ctx, mName, rawRows, idMap);

  let sanitized = rawRows.map((r) => pickImportPayload(em, entity, r));
  if (mName === 'user') {
    sanitized = await filterUserRowsForActingUserPreserve(
      em,
      ctx.modelEntity('user'),
      sanitized,
      preserveUserId,
      onUserRowsFiltered,
    );
  }
  return sanitized;
}
