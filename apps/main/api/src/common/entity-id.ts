/**
 * Entity ID Utilities.
 *
 * Bám sát pattern `apps/main/api/src/common/entity-id.ts`.
 */
import { BadRequestException } from '@nestjs/common';

export type EntityId = number;

/** Parse id từ route param / query (luôn là chuỗi trên HTTP). */
export function parseEntityId(
  value: string | number | null | undefined,
): number {
  if (value == null || value === '') {
    throw new BadRequestException('Thiếu id.');
  }
  const n =
    typeof value === 'number'
      ? value
      : Number.parseInt(String(value).trim(), 10);
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
export function coerceImportPrimaryKey(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (isEntityId(trimmed)) return parseEntityId(trimmed);
  }
  return undefined;
}
