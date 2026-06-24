import { coerceImportPrimaryKey } from '../../../entity-id';
import type { EntityManager, EntityName } from '@mikro-orm/core';
import { insertCategoriesWithLegacyParents } from './category-insert';
import { insertImportModelRows } from './db-batch';
import { stripHeroSlidesPermissions } from './helpers';
import {
  insertPageContentsWithPersist,
  insertPostsWithPersist,
  type JsonPersistInsertContext,
} from './json-persist';
import {
  filterRowsByExistingEventRef,
  filterRowsByExistingManyToOneRefs,
  filterSanitizedFkPivot,
} from './row-filters';
import {
  filterSanitizedPostCategories,
  filterSanitizedUserRoles,
} from './pivot-filters';
import { applyUserImportRowsDefaults } from './user-defaults';
import type { LegacyImportIdMap } from './legacy-id-map';

export type ImportInsertDeps = {
  entityByModelName: Record<string, EntityName<any>>;
  modelEntity: (modelKey: string) => EntityName<any>;
  jsonPersistCtx: (em: EntityManager) => JsonPersistInsertContext;
  onLog: (message: string) => void;
  onWarn: (message: string) => void;
  onDebug: (message: string) => void;
};

export async function insertSanitizedModel(
  em: EntityManager,
  deps: ImportInsertDeps,
  mName: string,
  sanitized: Record<string, unknown>[],
  onRowError?: (index: number, message: string) => void,
  importContext?: {
    rawRecords?: Record<string, unknown>[];
    idMap?: LegacyImportIdMap;
  },
): Promise<{
  imported: number;
  skipped: number;
  total: number;
  insertMs: number;
}> {
  const insertStarted = Date.now();
  const done = (result: {
    imported: number;
    skipped: number;
    total: number;
  }) => ({
    ...result,
    insertMs: Date.now() - insertStarted,
  });

  const entity = deps.entityByModelName[mName];
  const total = sanitized.length;
  if (!entity || sanitized.length === 0)
    return done({ imported: 0, skipped: 0, total });

  if (
    mName === 'category' &&
    importContext?.rawRecords?.length &&
    importContext.idMap
  ) {
    const categoryResult = await insertCategoriesWithLegacyParents(
      em,
      deps.modelEntity('category'),
      importContext.rawRecords,
      sanitized,
      importContext.idMap,
      onRowError,
    );
    return done({
      imported: categoryResult.imported,
      skipped: categoryResult.skipped,
      total,
    });
  }

  let rows = sanitized;
  rows = await filterRowsByExistingManyToOneRefs(
    em,
    mName,
    rows,
    deps.entityByModelName,
    deps.onWarn,
  );
  if (rows.length === 0) return done({ imported: 0, skipped: total, total });

  if (mName === 'postCategory') {
    rows = await filterSanitizedPostCategories(
      em,
      rows,
      deps.modelEntity('post'),
      deps.modelEntity('category'),
      importContext?.idMap,
      deps.onWarn,
    );
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });
  }

  if (mName === 'user') {
    rows = applyUserImportRowsDefaults(rows, (count) =>
      deps.onWarn?.(
        `Import user: ${count} bản ghi thiếu password — dùng fallback hash.`,
      ),
    );
  }

  if (mName === 'userRole') {
    await em.flush();
    rows = await filterSanitizedUserRoles(
      em,
      rows,
      deps.modelEntity('user'),
      deps.modelEntity('role'),
      deps.modelEntity('userRole'),
      deps.onWarn,
      deps.onLog,
    );
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });
  }

  if (mName === 'eventSpeaker') {
    rows = await filterSanitizedFkPivot(
      em,
      rows,
      {
        leftKey: 'eventId',
        leftRel: 'event',
        leftEntity: deps.modelEntity('event'),
        rightKey: 'speakerId',
        rightRel: 'speaker',
        rightEntity: deps.modelEntity('speaker'),
        label: 'eventSpeaker',
      },
      deps.onWarn,
    );
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });
  }

  if (mName === 'groupMember') {
    rows = await filterSanitizedFkPivot(
      em,
      rows,
      {
        leftKey: 'groupId',
        leftRel: 'group',
        leftEntity: deps.modelEntity('group'),
        rightKey: 'userId',
        rightRel: 'user',
        rightEntity: deps.modelEntity('user'),
        label: 'groupMember',
      },
      deps.onWarn,
    );
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });
  }

  if (mName === 'messageRead') {
    rows = await filterSanitizedFkPivot(
      em,
      rows,
      {
        leftKey: 'messageId',
        leftRel: 'message',
        leftEntity: deps.modelEntity('message'),
        rightKey: 'userId',
        rightRel: 'user',
        rightEntity: deps.modelEntity('user'),
        label: 'messageRead',
      },
      deps.onWarn,
    );
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });
  }

  if (mName === 'eventRegistration' || mName === 'eventCheckin') {
    rows = await filterRowsByExistingEventRef(
      em,
      rows,
      deps.modelEntity('event'),
      mName,
      deps.onWarn,
    );
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });
  }

  if (mName === 'role') {
    const beforeDedupe = rows.length;
    const seenKeys = new Set<string>();
    rows = rows
      .filter((r) => {
        const pk = coerceImportPrimaryKey(r.id);
        const name = String(r.name ?? '').trim();
        const key =
          pk != null ? `id:${pk}` : name ? `name:${name}` : undefined;
        if (!key || seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      })
      .map((r) => ({
        ...r,
        permissions: stripHeroSlidesPermissions(r.permissions),
      }));
    if (rows.length < beforeDedupe) {
      deps.onWarn(
        `${mName}: bỏ qua ${beforeDedupe - rows.length} dòng trùng id/name trong file import.`,
      );
    }
  }

  if (mName === 'pageContent') {
    const pageStats = await insertPageContentsWithPersist(
      deps.jsonPersistCtx(em),
      rows,
    );
    return done({
      imported: pageStats.imported,
      skipped: total - pageStats.imported,
      total,
    });
  }

  if (mName === 'post') {
    const postStats = await insertPostsWithPersist(
      deps.jsonPersistCtx(em),
      rows,
      onRowError,
    );
    return done({
      imported: postStats.imported,
      skipped: total - postStats.imported,
      total,
    });
  }

  const preFilterSkipped = total - rows.length;
  const batchResult = await insertImportModelRows(em, {
    modelName: mName,
    entity,
    rows,
    onRowError,
    onDebug: deps.onDebug,
    onWarn: deps.onWarn,
  });
  return done({
    imported: batchResult.imported,
    skipped: preFilterSkipped + batchResult.skipped,
    total,
  });
}
