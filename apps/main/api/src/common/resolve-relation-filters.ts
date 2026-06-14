import { EntityManager } from '@mikro-orm/core';
import { isEntityId } from './entity-id';

export interface RelationFilterConfig {
  model: string;
  nameField: string;
  softDelete?: boolean;
}

export type RelationFiltersConfig = Record<string, RelationFilterConfig>;

export type RelationEntityResolver = (
  model: string,
) => (new () => object) | undefined;

async function batchFindByEntity(
  em: EntityManager,
  rel: RelationFilterConfig,
  values: string[],
  resolveEntity: RelationEntityResolver,
): Promise<Map<string, string>> {
  const entity = resolveEntity(rel.model);
  if (!entity) return new Map();

  const result = new Map<string, string>();
  const cols: string[] = [];

  if (rel.softDelete) {
    cols.push('deletedAt IS NULL');
  }

  const idValues = values.filter((v) => isEntityId(v));
  if (idValues.length > 0) {
    const idCols = cols.length ? cols.join(' AND ') : '1=1';
    const numericIds = idValues.map((v) => Number.parseInt(v.trim(), 10));
    const idRows = (await em
      .getConnection()
      .execute(
        `SELECT id FROM ${em.getMetadata(entity).tableName} WHERE id IN (?) AND ${idCols}`,
        [numericIds],
      )) as Array<{ id: number }>;
    const idSet = new Set(idRows.map((r) => String(r.id)));
    for (const val of idValues) {
      if (idSet.has(val.trim())) {
        result.set(val, val.trim());
      }
    }
  }

  const nameValues = values.filter((v) => !result.has(v));
  if (nameValues.length > 0 && rel.nameField) {
    const nameCols = cols.length ? cols.join(' AND ') : '1=1';
    const nameRows = (await em
      .getConnection()
      .execute(
        `SELECT id, \`${rel.nameField}\` FROM ${em.getMetadata(entity).tableName} WHERE \`${rel.nameField}\` IN (?) AND ${nameCols}`,
        [nameValues],
      )) as Array<{ id: number; [key: string]: unknown }>;

    for (const row of nameRows) {
      const inputVal = String(row[rel.nameField] ?? '');
      if (inputVal && !result.has(inputVal)) {
        result.set(inputVal, String(row.id));
      }
    }
  }

  return result;
}

export async function resolveRelationFilters(
  em: EntityManager,
  filters: Record<string, string> | undefined,
  config: RelationFiltersConfig,
  resolveEntity: RelationEntityResolver,
): Promise<Record<string, string> | undefined> {
  if (!filters) return undefined;
  let output = { ...filters };

  for (const [key, rel] of Object.entries(config)) {
    const raw = output[key];
    if (!raw?.trim()) continue;

    const value = raw.trim();
    const parts = value.includes(',')
      ? value
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : [value];

    const resolvedMap = await batchFindByEntity(em, rel, parts, resolveEntity);
    const resolved = parts
      .map((p) => resolvedMap.get(p))
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (resolved.length > 0) {
      output = { ...output, [key]: resolved.join(',') };
    } else {
      delete (output as Record<string, unknown>)[key];
    }
  }

  return output;
}
