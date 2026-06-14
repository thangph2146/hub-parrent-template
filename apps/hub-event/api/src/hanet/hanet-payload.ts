/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { HanetCameraRole, HanetWebhookBody } from './hanet.types';

/** Mã thiết bị / camera trên payload HANET thực tế. */
export const HANET_DEVICE_ID_KEYS = [
  'camera_id',
  'cameraId',
  'deviceID',
  'deviceId',
  'device_id',
] as const;

export const HANET_PERSON_NAME_KEYS = [
  'person_name',
  'personName',
  'name',
  'fullName',
] as const;

export const HANET_PERSON_ID_KEYS = [
  'person_id',
  'personID',
  'personId',
  'aliasID',
  'aliasId',
] as const;

/**
 * Chuỗi `time` kiểu HANET: DDMMYYYYHHmmss (vd. `03042025172611` = 03/04/2025 17:26:11).
 */
export function parseHanetCompactTime(value: string): Date | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14) return null;

  const day = Number.parseInt(digits.slice(0, 2), 10);
  const month = Number.parseInt(digits.slice(2, 4), 10) - 1;
  const year = Number.parseInt(digits.slice(4, 8), 10);
  const hour = Number.parseInt(digits.slice(8, 10), 10);
  const minute = Number.parseInt(digits.slice(10, 12), 10);
  const second = Number.parseInt(digits.slice(12, 14), 10);

  const date = new Date(year, month, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function pickHanetString(
  body: HanetWebhookBody,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

export function pickHanetTimestamp(body: HanetWebhookBody): Date {
  const dateTime = body.date_time ?? body.dateTime;
  if (typeof dateTime === 'number' && Number.isFinite(dateTime)) {
    const ms = dateTime > 1e12 ? dateTime : dateTime * 1000;
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const timeStr = pickHanetString(body, ['time']);
  if (timeStr) {
    const compact = parseHanetCompactTime(timeStr);
    if (compact) return compact;
    const parsed = new Date(timeStr);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const rawTime = body.timestamp;
  if (typeof rawTime === 'number' && Number.isFinite(rawTime)) {
    const ms = rawTime > 1e12 ? rawTime : rawTime * 1000;
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const dateText = pickHanetString(body, [
    'date',
    'date_time',
    'checkinTime',
    'checkoutTime',
  ]);
  if (dateText) {
    const compact = parseHanetCompactTime(dateText);
    if (compact) return compact;
    const parsed = new Date(dateText);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return new Date();
}

/**
 * Suy check-in / check-out theo [Webhook Push Data HANET](https://documenter.getpostman.com/view/13088306/TVmFmMEx):
 * `person_type` (0 = vào, 1 = ra), `action_type` / `data_type`, hoặc từ khóa trong chuỗi.
 */
export function pickHanetAttendanceKind(
  body: HanetWebhookBody,
): HanetCameraRole | null {
  const personType = body.person_type ?? body.personType;
  if (personType === 0 || personType === '0') return 'checkin';
  if (personType === 1 || personType === '1') return 'checkout';

  const action = pickHanetString(body, [
    'action_type',
    'actionType',
    'type',
    'data_type',
    'dataType',
    'event_type',
    'eventType',
  ]).toLowerCase();

  if (!action) return null;

  if (
    action.includes('checkout') ||
    action.includes('check-out') ||
    action.includes('check_out') ||
    action === '1' ||
    action === 'out' ||
    action === 'exit'
  ) {
    return 'checkout';
  }
  if (
    action.includes('checkin') ||
    action.includes('check-in') ||
    action.includes('check_in') ||
    action === '0' ||
    action === 'in' ||
    action === 'entry'
  ) {
    return 'checkin';
  }
  return null;
}

export function pickHanetDeviceId(body: HanetWebhookBody): string {
  const direct = pickHanetString(body, HANET_DEVICE_ID_KEYS);
  if (direct) return direct;

  const msgId = pickHanetString(body, ['msg_id', 'msgId']);
  if (msgId.includes('-')) {
    return msgId.split('-')[0] ?? '';
  }
  return '';
}

/** Gỡ bọc JSON trong `message` / body string (một số gateway HANET gửi dạng PHP `$message`). */
export function normalizeHanetBody(raw: unknown): HanetWebhookBody {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    try {
      return normalizeHanetBody(JSON.parse(trimmed));
    } catch {
      return {};
    }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) return {};

  const obj = raw as Record<string, unknown>;
  const wrapped = obj.message ?? obj.Message ?? obj.data ?? obj.payload;
  if (typeof wrapped === 'string' && wrapped.trim()) {
    try {
      const inner = normalizeHanetBody(JSON.parse(wrapped));
      return { ...obj, ...inner } as HanetWebhookBody;
    } catch {
      // keep outer object
    }
  }
  if (wrapped && typeof wrapped === 'object' && !Array.isArray(wrapped)) {
    return { ...obj, ...(wrapped as HanetWebhookBody) } as HanetWebhookBody;
  }

  return obj as HanetWebhookBody;
}
