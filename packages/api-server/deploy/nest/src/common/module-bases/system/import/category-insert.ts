import type { EntityManager, EntityName } from '@mikro-orm/core';
import {
  isSkippableImportRowError,
  orderCategoryRowsForImport,
  type ImportRow,
} from './helpers';
import { getErrorMessage } from './row-schema';
import type { LegacyImportIdMap } from './legacy-id-map';
import { exportLegacyKey } from './legacy-id-map';

/** Category: insert theo thứ tự cha→con, map legacy parentId sau từng dòng. */
export async function insertCategoriesWithLegacyParents(
  em: EntityManager,
  categoryEntity: EntityName<any>,
  rawRecords: Record<string, unknown>[],
  sanitized: Record<string, unknown>[],
  idMap: LegacyImportIdMap,
  onRowError?: (index: number, message: string) => void,
): Promise<{ imported: number; skipped: number }> {
  const sanitizedBySlug = new Map<string, Record<string, unknown>>();
  for (const row of sanitized) {
    const slug = typeof row.slug === 'string' ? row.slug.trim() : '';
    if (slug) sanitizedBySlug.set(slug, row);
  }

  const orderedRaw = orderCategoryRowsForImport(
    rawRecords.map((raw) => ({
      ...raw,
      parent: raw.parent ?? raw.parentId,
    })) as ImportRow[],
  );
  let imported = 0;
  let skipped = 0;

  for (let index = 0; index < orderedRaw.length; index++) {
    const raw = orderedRaw[index];
    const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
    if (!slug || !sanitizedBySlug.has(slug)) {
      skipped++;
      continue;
    }
    const row = { ...sanitizedBySlug.get(slug)! };
    if (row.type == null || row.type === '') row.type = 'post';
    if (row.sortOrder == null) row.sortOrder = 0;

    const parentLegacy = exportLegacyKey(raw.parent ?? raw.parentId);
    if (parentLegacy) {
      const parentId = await idMap.resolve(em, 'category', parentLegacy);
      if (parentId != null) {
        row.parentId = parentId;
      }
    }

    try {
      await em.insert(categoryEntity, row as object);
      imported++;
      if (raw) {
        const legacy = exportLegacyKey(raw.id);
        if (legacy && slug) {
          const inserted = await em.findOne(
            categoryEntity,
            { slug },
            { fields: ['id'] },
          );
          if (inserted?.id) {
            await idMap.persist(em, 'category', legacy, inserted.id);
          }
        }
      }
    } catch (err: unknown) {
      skipped++;
      const errMsg = getErrorMessage(err);
      if (!isSkippableImportRowError(errMsg)) {
        onRowError?.(index, errMsg);
        throw err;
      }
    }
  }

  await em.flush();
  return { imported, skipped };
}
