import { relationEntityId } from '../../../entity-id';
import type { EntityProperty } from '@mikro-orm/core';

export const EXCEL_NULL_MARKER = '__HUB_NULL__';

export function coerceManyToOneScalar(raw: unknown): unknown {
  if (raw === null || raw === undefined) return raw;
  const id = relationEntityId(raw);
  if (id != null) return id;
  if (typeof raw === 'object' && raw !== null && 'id' in raw) {
    const nested = relationEntityId((raw as { id: unknown }).id);
    if (nested != null) return nested;
  }
  return null;
}

export function coerceImportNullMarker(raw: unknown): unknown {
  if (raw === EXCEL_NULL_MARKER) return null;
  if (typeof raw === 'string' && raw.trim() === EXCEL_NULL_MARKER) return null;
  return raw;
}

export function normalizeImportScalar(
  prop: EntityProperty,
  raw: unknown,
  isTemporalColumn: (prop: EntityProperty) => boolean,
): unknown {
  const unmarked = coerceImportNullMarker(raw);
  if (unmarked === null) return null;
  raw = unmarked;
  if (!isTemporalColumn(prop)) return raw;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d;
  }
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return raw;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? raw : d;
  }
  return raw;
}

/** Post / PageContent: `content` là JSON object (Lexical…). */
export function normalizeContentJsonForImport(
  raw: unknown,
): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return {};
    try {
      const parsed = JSON.parse(s) as unknown;
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function plainJsonRecord(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  try {
    return JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function coerceImportDate(val: unknown, fallback: Date): Date {
  if (val instanceof Date && !Number.isNaN(val.getTime())) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return fallback;
}
