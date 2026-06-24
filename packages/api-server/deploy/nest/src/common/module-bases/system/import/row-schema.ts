import type { EntityProperty } from '@mikro-orm/core';
import { normalizeImportScalar as coerceImportScalar } from './value-coerce';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

/** Bỏ qua quan hệ không map trực tiếp ra cột (MikroORM v6: `EntityProperty.reference`). */
export function shouldSkipImportProperty(prop: EntityProperty): boolean {
  if (prop.persist === false) return true;
  const kind = String((prop as { kind?: unknown }).kind ?? '');
  if (kind === '1:m' || kind === 'm:n') {
    return true;
  }
  if (kind === '1:1' && prop.mappedBy) {
    return true;
  }
  return false;
}

export function isManyToOneImportProperty(prop: EntityProperty): boolean {
  const kind = String((prop as { kind?: string }).kind ?? '');
  return (
    kind === 'm:1' ||
    (kind === '1:1' && !(prop as { mappedBy?: string }).mappedBy)
  );
}

const IMPORT_DATE_SCALAR_PROP_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'readAt',
  'expiresAt',
  'lastActivity',
  'emailVerified',
]);

/** Cột date/time trên MySQL không chấp nhận literal ISO (`...T...Z`); cần Date để driver format đúng. */
export function isTemporalColumn(prop: EntityProperty): boolean {
  const col = prop.columnTypes?.[0]?.toLowerCase() ?? '';
  if (
    col === 'date' ||
    col === 'datetime' ||
    col === 'timestamp' ||
    col === 'time' ||
    col === 'timestamptz' ||
    col.includes('datetime') ||
    col.includes('timestamp')
  ) {
    return true;
  }
  const t = String(prop.type ?? '').toLowerCase();
  if (t.includes('date') || t.includes('time')) {
    return true;
  }
  return IMPORT_DATE_SCALAR_PROP_NAMES.has(prop.name);
}

export function normalizeImportScalar(
  prop: EntityProperty,
  raw: unknown,
): unknown {
  return coerceImportScalar(prop, raw, isTemporalColumn);
}

/** Excel ô trống → thiếu key; NOT NULL không default → lỗi MySQL khi insert. */
export function fillRequiredImportScalarDefaults(
  meta: { properties: Record<string, EntityProperty> },
  row: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...row };
  for (const prop of Object.values(meta.properties)) {
    if (shouldSkipImportProperty(prop)) continue;
    if (isManyToOneImportProperty(prop)) continue;
    if (prop.primary && (prop as { autoincrement?: boolean }).autoincrement) {
      continue;
    }
    if (prop.nullable) continue;
    if (prop.default != null) continue;

    const key = prop.name;
    const current = out[key];
    if (current !== undefined && current !== null) continue;

    const typeStr = String(prop.type ?? '').toLowerCase();
    const colType = String(prop.columnTypes?.[0] ?? '').toLowerCase();
    if (
      typeStr.includes('string') ||
      typeStr.includes('text') ||
      colType.includes('char') ||
      colType.includes('text')
    ) {
      out[key] = '';
    }
  }
  return out;
}

/** Khóa export chuẩn: property name (scalar) hoặc FK column tiếng Anh (`authorId`, …). */
export function getExportFieldKey(prop: EntityProperty): string {
  if (isManyToOneImportProperty(prop)) {
    return prop.fieldNames?.[0] ?? `${prop.name}Id`;
  }
  return prop.name;
}
