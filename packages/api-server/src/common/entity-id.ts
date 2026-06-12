/**
 * Entity ID Utilities.
 *
 * Bám sát pattern `apps/main/api/src/common/entity-id.ts` + mở rộng
 * `isValidEntityId()` để hỗ trợ UUID/CUID legacy.
 */
import { BadRequestException } from '@nestjs/common';

export type EntityId = number;

/** Parse id từ route param / query (luôn là chuỗi trên HTTP). */
export function parseEntityId(value: string | number | null | undefined): number {
  if (value == null || value === '') {
    throw new BadRequestException('Thiếu id.');
  }
  const n =
    typeof value === 'number' ? value : Number.parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new BadRequestException('Id không hợp lệ.');
  }
  return n;
}

export function isEntityId(value: string): boolean {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n > 0 && String(n) === value.trim();
}

/** Route param / body — chấp nhận string hoặc number. */
export function toEntityId(value: string | number): number {
  return typeof value === 'number' ? value : parseEntityId(value);
}

export function toEntityIdList(values: Array<string | number>): number[] {
  return values.map((v) => toEntityId(v));
}

/** Chỉ giữ id hợp lệ — bỏ UUID/CUID legacy khi lọc FK import. */
export function toEntityIdListSafe(values: Array<string | number>): number[] {
  const out: number[] = [];
  for (const v of values) {
    const id = relationEntityId(v);
    if (id != null) out.push(id);
  }
  return out;
}

/** Lấy id số từ relation đã populate hoặc scalar (DTO / mapRow). */
export function relationEntityId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    if (isEntityId(trimmed)) return parseEntityId(trimmed);
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return relationEntityId((value as { id?: unknown }).id);
  }
  return null;
}

/**
 * PK import: chỉ giữ id số nguyên dương hợp lệ (không nhận UUID/CUID legacy).
 * Trả về undefined để caller bỏ qua field → DB autoincrement.
 */
export function coerceImportPrimaryKey(
  value: unknown,
): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (isEntityId(trimmed)) return parseEntityId(trimmed);
  }
  return undefined;
}

// ────────────────────────────────────────────────────────────
// Backward-compat helpers (kept cho tests / downstream apps)
// ────────────────────────────────────────────────────────────

/** Backward-compat alias - returns number or throws Error. */
export function toEntityIdStrict(id: string | number): number {
  if (typeof id === 'number') return id;
  const trimmed = id.trim();
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid entity ID: ${id}`);
  }
  return parsed;
}

export function toEntityIdOrDefault(
  id: string | number,
  defaultValue: number = 0,
): number {
  try {
    return toEntityId(id);
  } catch {
    return defaultValue;
  }
}

export function isNumericId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

/**
 * Parse ID từ nhiều format: numeric string / number / UUID.
 * Trả về number nếu parse được, ngược lại trả về string.
 */
export function parseEntityIdLoose(
  id: string | number,
): number | string {
  if (typeof id === 'number') return id;
  const trimmed = id.trim();
  if (isNumericId(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }
  return trimmed;
}

/**
 * Validate entity ID format: number dương, numeric string, hoặc UUID.
 */
export function isValidEntityId(id: string | number): boolean {
  if (typeof id === 'number') return id > 0;
  const trimmed = id.trim();
  return isNumericId(trimmed) || isUuid(trimmed);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
