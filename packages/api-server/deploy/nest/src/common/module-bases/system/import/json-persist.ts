import {
  coerceImportPrimaryKey,
  toEntityId,
} from '../../../entity-id';
import type { EntityManager, EntityName } from '@mikro-orm/core';
import { isSkippableImportRowError } from './helpers';
import {
  coerceImportDate,
  coerceManyToOneScalar,
  normalizeContentJsonForImport,
  plainJsonRecord,
} from './value-coerce';

export type JsonPersistInsertContext = {
  em: EntityManager;
  createEntityInstance: (modelKey: string) => Record<string, unknown>;
  modelEntity: (modelKey: string) => EntityName<any>;
  onRowError?: (index: number, message: string) => void;
  reportImportRowError: (
    onRowError: ((index: number, message: string) => void) | undefined,
    rowIndex: number,
    errMsg: string,
  ) => void;
  getErrorMessage: (error: unknown) => string;
};

/** pageContent: persist + flush — tránh insertMany + cột JSON trên MySQL. */
export async function insertPageContentsWithPersist(
  ctx: JsonPersistInsertContext,
  rows: Record<string, unknown>[],
): Promise<{ imported: number; skipped: number }> {
  const { em, createEntityInstance } = ctx;
  const now = new Date();
  const seenKeys = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (const r of rows) {
    const pageKey =
      r.pageKey != null ? String(r.pageKey as string | number).trim() : '';
    const sectionKey =
      r.sectionKey != null
        ? String(r.sectionKey as string | number).trim()
        : '';
    if (!pageKey || !sectionKey) {
      skipped++;
      continue;
    }
    const dedupeKey = `${pageKey}\0${sectionKey}`;
    if (seenKeys.has(dedupeKey)) {
      skipped++;
      continue;
    }
    seenKeys.add(dedupeKey);

    const content = plainJsonRecord(normalizeContentJsonForImport(r.content));
    const e = createEntityInstance('pageContent');
    const pk = coerceImportPrimaryKey(r.id);
    if (pk != null) e.id = pk;
    e.pageKey = pageKey;
    e.sectionKey = sectionKey;
    e.content = content;
    e.isVisible = Boolean(r.isVisible ?? true);
    e.createdAt = coerceImportDate(r.createdAt, now);
    e.updatedAt = coerceImportDate(r.updatedAt, now);
    em.persist(e);
    imported++;
  }

  if (imported === 0 && rows.length > 0) {
    throw new Error(
      'pageContent import: không có dòng hợp lệ (thiếu pageKey/sectionKey)',
    );
  }

  if (imported > 0) await em.flush();
  return { imported, skipped };
}

/** post: persist + flush theo lô — tránh insertMany + cột JSON lớn trên MySQL. */
export async function insertPostsWithPersist(
  ctx: JsonPersistInsertContext,
  rows: Record<string, unknown>[],
  onRowError?: (index: number, message: string) => void,
): Promise<{ imported: number; skipped: number }> {
  const { em, createEntityInstance, modelEntity, reportImportRowError, getErrorMessage } =
    ctx;
  const batchSize = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_POST_BATCH_SIZE || '5', 10) || 5,
  );
  const now = new Date();
  let imported = 0;
  let skipped = 0;

  for (let index = 0; index < rows.length; index++) {
    const r = rows[index]!;
    try {
      const content = plainJsonRecord(normalizeContentJsonForImport(r.content));
      const e = createEntityInstance('post');
      const pk = coerceImportPrimaryKey(r.id);
      if (pk != null) e.id = pk;
      const fallbackId = pk ?? index + 1;
      e.title = String(r.title ?? '').trim() || `post-${fallbackId}`;
      e.content = content;
      if (r.excerpt !== undefined) e.excerpt = r.excerpt;
      e.slug =
        r.slug != null && String(r.slug).trim()
          ? String(r.slug).trim()
          : `post-${fallbackId}`;
      if (r.image !== undefined) e.image = r.image;
      e.published = Boolean(r.published ?? false);
      if (r.publishedAt !== undefined) e.publishedAt = r.publishedAt;
      if (r.eventStartAt !== undefined) e.eventStartAt = r.eventStartAt;
      if (r.eventEndAt !== undefined) e.eventEndAt = r.eventEndAt;
      e.createdAt = coerceImportDate(r.createdAt, now);
      e.updatedAt = coerceImportDate(r.updatedAt, now);
      if (r.deletedAt !== undefined) e.deletedAt = r.deletedAt;
      const authorId = coerceManyToOneScalar(r.authorId ?? r.author);
      if (authorId != null) {
        e.author = em.getReference(modelEntity('user'), toEntityId(String(authorId)));
      }
      em.persist(e);
      imported++;
      const contentBytes = JSON.stringify(content).length;
      const largeFlushBytes = Math.max(
        256 * 1024,
        parseInt(
          process.env.SYSTEM_IMPORT_POST_LARGE_FLUSH_BYTES || '524288',
          10,
        ) || 524288,
      );
      if (imported % batchSize === 0 || contentBytes >= largeFlushBytes) {
        await em.flush();
        if (contentBytes >= largeFlushBytes) {
          em.clear();
        }
      }
    } catch (err: unknown) {
      skipped++;
      const errMsg = getErrorMessage(err);
      if (!isSkippableImportRowError(errMsg)) {
        reportImportRowError(onRowError, index, errMsg);
        throw err;
      }
    }
  }

  if (imported > 0) await em.flush();
  return { imported, skipped };
}
