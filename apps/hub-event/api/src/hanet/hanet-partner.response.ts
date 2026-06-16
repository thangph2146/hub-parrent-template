/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { BadRequestException } from '@nestjs/common';
import type { HanetPartnerEnvelope } from './hanet-partner.types';

export const HANET_RETURN_SUCCESS = 1;
/** Một số endpoint HANET trả -103 khi token hết hạn. */
export const HANET_RETURN_TOKEN_EXPIRED = -103;
/** `getPlaces` và endpoint khác có thể trả 401 + "Token is expired". */
export const HANET_RETURN_HTTP_TOKEN_EXPIRED = 401;

export function isHanetTokenExpiredEnvelope(
  envelope: HanetPartnerEnvelope,
): boolean {
  if (
    envelope.returnCode === HANET_RETURN_TOKEN_EXPIRED ||
    envelope.returnCode === HANET_RETURN_HTTP_TOKEN_EXPIRED
  ) {
    return true;
  }
  const message = envelope.returnMessage?.toLowerCase() ?? '';
  return (
    message.includes('token is expired') || message.includes('token expired')
  );
}

export function isHanetPartnerEnvelope(
  value: unknown,
): value is HanetPartnerEnvelope {
  return (
    value != null &&
    typeof value === 'object' &&
    'returnCode' in value &&
    typeof (value as HanetPartnerEnvelope).returnCode === 'number'
  );
}

export function assertHanetPartnerOk<T = unknown>(
  envelope: HanetPartnerEnvelope<T>,
  path: string,
): T {
  if (envelope.returnCode === HANET_RETURN_SUCCESS) {
    return envelope.data as T;
  }

  const message =
    envelope.returnMessage?.trim() ||
    `HANET ${path} returnCode=${envelope.returnCode}`;
  throw new BadRequestException(message);
}

/** dd/MM/yyyy — một số endpoint partner (không dùng cho check-in theo ngày). */
export function formatHanetPartnerDayDate(input: string | Date): string {
  const date =
    typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())
      ? new Date(`${input.trim()}T12:00:00`)
      : typeof input === 'string'
        ? new Date(input)
        : input;

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Ngày không hợp lệ (dùng yyyy-mm-dd)');
  }

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** yyyy-MM-dd — getCheckinByPlaceIdInDay / getTotalCheckinByPlaceIdInDay (Postman HANET). */
export function formatHanetCheckinDayDate(input: string | Date): string {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const slash = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;
  }

  const date =
    typeof input === 'string'
      ? new Date(input.includes('T') ? input : `${input.trim()}T12:00:00`)
      : input;

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Ngày không hợp lệ (dùng yyyy-mm-dd)');
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** DDMMYYYYHHmmss — getCheckinByPlaceIdInTimestamp / getTotalCheckinByPlaceIdInTimestamp. */
export function formatHanetCompactTimestamp(
  input: string | number | Date,
): string {
  if (typeof input === 'string') {
    const digits = input.replace(/\D/g, '');
    if (digits.length === 14) return digits;
  }

  if (typeof input === 'number' && Number.isFinite(input)) {
    const ms = input > 1e12 ? input : input * 1000;
    return formatHanetCompactTimestamp(new Date(ms));
  }

  let date: Date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    date = new Date(input.includes('T') ? input : `${input.trim()}T12:00:00`);
  } else {
    throw new BadRequestException(
      'Thời gian không hợp lệ (ISO, unix giây/ms, hoặc DDMMYYYYHHmmss)',
    );
  }

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(
      'Thời gian không hợp lệ (ISO, unix giây/ms, hoặc DDMMYYYYHHmmss)',
    );
  }

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}${mm}${yyyy}${hh}${min}${ss}`;
}

export function normalizeHanetPartnerList(
  data: unknown,
): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(
      (row): row is Record<string, unknown> =>
        row != null && typeof row === 'object' && !Array.isArray(row),
    );
  }
  if (!data || typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;
  for (const key of ['list', 'items', 'rows', 'data', 'persons', 'checkins']) {
    const nested = record[key];
    if (Array.isArray(nested)) return normalizeHanetPartnerList(nested);
  }
  return [];
}

export function normalizeHanetPartnerScalarCount(data: unknown): number {
  if (typeof data === 'number' && Number.isFinite(data)) return data;
  if (typeof data === 'string' && /^\d+$/.test(data.trim())) {
    return Number.parseInt(data.trim(), 10);
  }
  if (!data || typeof data !== 'object') return 0;

  const record = data as Record<string, unknown>;
  for (const key of ['total', 'count', 'value', 'number']) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
      return Number.parseInt(value.trim(), 10);
    }
  }
  return 0;
}
