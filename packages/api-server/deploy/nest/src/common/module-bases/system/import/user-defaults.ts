import { hashSync } from 'bcryptjs';
import { coerceImportDate } from './value-coerce';

/** bcrypt — chỉ khi bản ghi user thiếu password trong JSON export. */
let importUserFallbackPasswordHash: string | null = null;

export function getImportUserFallbackPasswordHash(): string {
  if (!importUserFallbackPasswordHash) {
    const plain =
      process.env.IMPORT_FALLBACK_PASSWORD_PLAIN?.trim() ||
      'ImportFallback#2026';
    importUserFallbackPasswordHash = hashSync(plain, 10);
  }
  return importUserFallbackPasswordHash;
}

export function applyUserImportRowsDefaults(
  rows: Record<string, unknown>[],
  onMissingPassword?: (count: number) => void,
): Record<string, unknown>[] {
  const now = new Date();
  const fallbackHash = getImportUserFallbackPasswordHash();
  let missingPw = 0;
  const next = rows.map((row) => {
    const r = { ...row };
    const pw = r.password;
    if (pw == null || (typeof pw === 'string' && pw.trim() === '')) {
      r.password = fallbackHash;
      missingPw++;
    }
    r.createdAt = coerceImportDate(r.createdAt, now);
    r.updatedAt = coerceImportDate(r.updatedAt, now);
    if (r.isActive === undefined) r.isActive = true;
    else r.isActive = Boolean(r.isActive);
    return r;
  });
  if (missingPw > 0) {
    onMissingPassword?.(missingPw);
  }
  return next;
}
