import { coerceImportPrimaryKey } from '../../../entity-id';
import type { EntityManager, EntityName } from '@mikro-orm/core';
import { normalizeLegacyImportRow } from '../export/schema';
import {
  coerceManyToOneScalar,
  normalizeContentJsonForImport,
} from './value-coerce';
import {
  fillRequiredImportScalarDefaults,
  isManyToOneImportProperty,
  normalizeImportScalar,
  shouldSkipImportProperty,
} from './row-schema';

/** Chỉ giữ field map được tới cột DB, tránh lỗi insert khi JSON export có key thừa. */
export function pickImportPayload(
  em: EntityManager,
  entity: EntityName<any>,
  row: Record<string, unknown>,
): Record<string, unknown> {
  const entityKey =
    typeof entity === 'string'
      ? entity
      : typeof entity === 'function'
        ? entity.name
        : String(entity as unknown as string);
  const normalizedRow = normalizeLegacyImportRow(entityKey, row);
  const meta = em.getMetadata().get(entityKey);
  const out: Record<string, unknown> = {};

  for (const prop of Object.values(meta.properties)) {
    if (shouldSkipImportProperty(prop)) continue;

    let raw: unknown;
    if (Object.prototype.hasOwnProperty.call(normalizedRow, prop.name)) {
      raw = normalizedRow[prop.name];
    } else if (prop.fieldNames?.length) {
      const col = prop.fieldNames[0];
      if (
        col &&
        col !== prop.name &&
        Object.prototype.hasOwnProperty.call(normalizedRow, col)
      ) {
        raw = normalizedRow[col];
      }
    }
    if (
      raw === undefined &&
      isManyToOneImportProperty(prop) &&
      Object.prototype.hasOwnProperty.call(normalizedRow, `${prop.name}Id`)
    ) {
      raw = normalizedRow[`${prop.name}Id`];
    }
    if (raw === undefined) continue;

    if (prop.primary && (prop as { autoincrement?: boolean }).autoincrement) {
      const pk = coerceImportPrimaryKey(raw);
      if (pk === undefined) continue;
      out[prop.name] = pk;
      continue;
    }

    let val = normalizeImportScalar(prop, raw);
    if (isManyToOneImportProperty(prop)) {
      val = coerceManyToOneScalar(val);
      if (val === null && raw !== null && raw !== undefined) continue;
      const fkField = prop.fieldNames?.[0] ?? `${prop.name}Id`;
      out[fkField] = val;
      continue;
    }
    if (
      prop.name === 'content' &&
      (entityKey === 'Post' ||
        entityKey === 'PageContent' ||
        entityKey === 'Event')
    ) {
      val = normalizeContentJsonForImport(val);
    }
    out[prop.name] = val;
  }
  return fillRequiredImportScalarDefaults(meta, out);
}
