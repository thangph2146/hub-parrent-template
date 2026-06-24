import { type EntityManager, wrap } from '@mikro-orm/core';
import {
  getExportFieldKey,
  isManyToOneImportProperty,
  shouldSkipImportProperty,
} from '../import/row-schema';

/**
 * Export theo property entity (tiếng Anh, camelCase):
 * - scalar → `name`, `startDate`, …
 * - ManyToOne → FK column (`authorId`, `academicYearId`, …)
 */
export function flattenEntityRowForExport(
  em: EntityManager,
  entityKey: string,
  row: object,
): Record<string, unknown> {
  const meta = em.getMetadata().get(entityKey);
  const entityRow = row as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const prop of Object.values(meta.properties)) {
    if (shouldSkipImportProperty(prop)) continue;
    const exportKey = getExportFieldKey(prop);
    const dbField = prop.fieldNames?.[0] ?? prop.name;

    if (isManyToOneImportProperty(prop)) {
      const rel = entityRow[prop.name] ?? entityRow[dbField];
      let pk: unknown = null;
      if (typeof rel === 'string' || typeof rel === 'number') {
        pk = rel;
      } else if (rel && typeof rel === 'object') {
        pk =
          'id' in rel
            ? (rel as { id: unknown }).id
            : wrap(rel, true).getPrimaryKey();
      }
      out[exportKey] = pk;
      continue;
    }

    const val = entityRow[prop.name] ?? entityRow[dbField];
    if (val === undefined) continue;
    const encoded = val instanceof Date ? val.toISOString() : (val as unknown);
    out[exportKey] = encoded;
  }

  return out;
}
