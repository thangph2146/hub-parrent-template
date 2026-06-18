/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Date Utilities.
 *
 * Bám sát pattern `apps/main/api/src/common/date-utils.ts` + mở rộng
 * một số helper (parseDate, isValidDate, formatDate, formatDateTime)
 * tiện cho client UI.
 */

/** Convert Date/string/number sang ISO string hoặc null. */
export function toIso(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : v.toISOString();
  }
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

/** Convert Date/string/number sang ISO string hoặc fallback to current time. */
export function toIsoNow(v: unknown): string {
  return toIso(v) ?? new Date().toISOString();
}

/** Parse string/number input thành Date hoặc null. */
export function parseDateInput(value: string | number | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Normalize ngày nhập dạng text (YYYY-MM-DD hoặc ISO) → YYYY-MM-DD hoặc null. */
export function normalizeDateInput(value: string | null | undefined): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

// ────────────────────────────────────────────────────────────
// Backward-compat helpers (kept cho tests / downstream apps)
// ────────────────────────────────────────────────────────────

/**
 * Convert Date/string → ISO string, null nếu input null/undefined.
 * Alias của `toIso()`.
 */
export function safeIsoString(
  date: Date | string | null | undefined,
): string | null {
  return toIso(date);
}

/**
 * Convert Date/string → ISO string, fallback `now()` nếu null.
 * Alias của `toIsoNow()`.
 */
export function safeIsoStringNow(
  date: Date | string | null | undefined,
): string {
  return toIsoNow(date);
}

/**
 * Parse date từ string|Date → Date hoặc null.
 * Alias của `parseDateInput()`.
 */
export function parseDate(
  input: string | Date | null | undefined,
): Date | null {
  if (!input) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  return parseDateInput(input);
}

/** Check date có hợp lệ không. */
export function isValidDate(
  date: Date | string | null | undefined,
): boolean {
  if (!date) return false;
  if (date instanceof Date) return !Number.isNaN(date.getTime());
  const parsed = new Date(date);
  return !Number.isNaN(parsed.getTime());
}

/** Format date theo locale (mặc định `vi-VN`). */
export function formatDate(
  date: Date | string | null | undefined,
  locale = 'vi-VN',
): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return parsed.toLocaleDateString(locale);
}

/** Format datetime theo locale (mặc định `vi-VN`). */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale = 'vi-VN',
): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return parsed.toLocaleString(locale);
}
