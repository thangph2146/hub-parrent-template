import { EXCEL_NULL_MARKER } from '../value-coerce';

export const EXCEL_META_SHEET = '__meta';
export const EXCEL_MAX_CELL_CHARS = 32767;

/** Xoá ký tự điều khiển XML (0x00–0x08, 0x0B–0x0C, 0x0E–0x1F) có thể làm hỏng XLSX. */
export function sanitizeExcelString(raw: string): string {
  if (!raw) return raw;
  const re = new RegExp(
    '[\x00-\x08\x0B\x0C\x0E-\x1F]', // eslint-disable-line no-control-regex
    'g',
  );
  return raw.replace(re, '');
}

export function encodeExcelCellValue(value: unknown): string | number | boolean {
  if (value === null) return EXCEL_NULL_MARKER;
  if (value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string')
    return sanitizeExcelString(value).slice(0, EXCEL_MAX_CELL_CHARS);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
    return EXCEL_NULL_MARKER;
  }
  try {
    const str = JSON.stringify(value);
    return sanitizeExcelString(str).slice(0, EXCEL_MAX_CELL_CHARS);
  } catch {
    return EXCEL_NULL_MARKER;
  }
}

function parseExcelObjectValue(value: object): unknown {
  if ('result' in value) {
    return parseExcelCellValue((value as { result?: unknown }).result);
  }
  if ('text' in value) {
    return String((value as { text?: unknown }).text ?? '');
  }
  if ('richText' in value) {
    return ((value as { richText?: Array<{ text?: string }> }).richText ?? [])
      .map((item) => item.text ?? '')
      .join('');
  }
  return String(value);
}

export function parseExcelCellValue(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object') {
    return parseExcelObjectValue(value);
  }
  if (typeof value !== 'string') {
    return value;
  }
  if (value === EXCEL_NULL_MARKER) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}
