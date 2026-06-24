import type { EntityManager, EntityName } from '@mikro-orm/core';
import { parseEntityId, toEntityId } from '../../../entity-id';

export function parseImportActingUserId(
  actingUserIdHeader?: string,
): number | undefined {
  const raw = actingUserIdHeader?.trim();
  if (!raw) return undefined;
  try {
    return parseEntityId(raw);
  } catch {
    return undefined;
  }
}

export function parseImportActingUserEmail(
  actingUserEmailHeader?: string,
): string | undefined {
  const email = actingUserEmailHeader?.trim().toLowerCase();
  return email || undefined;
}

/** Giữ user đang import để các lô HTTP tiếp theo không bị 401 (PermissionsGuard). */
export function resolvePreserveUserIdForImport(
  skipClear: boolean,
  clearsUserTable: boolean,
  actingUserIdHeader?: string,
): number | undefined {
  if (skipClear || !clearsUserTable) return undefined;
  return parseImportActingUserId(actingUserIdHeader);
}

export async function filterUserRowsForActingUserPreserve(
  em: EntityManager,
  userEntity: EntityName<any>,
  rows: Record<string, unknown>[],
  preserveUserId?: number,
  onFiltered?: (skipped: number, preserveUserId: number) => void,
): Promise<Record<string, unknown>[]> {
  if (preserveUserId == null) return rows;

  const preserved = await em.findOne(
    userEntity,
    { id: preserveUserId },
    { fields: ['id', 'email'] },
  );
  const preservedEmail = preserved?.email?.trim().toLowerCase() ?? '';

  const filtered = rows.filter((row) => {
    if (row.id != null && row.id !== '') {
      try {
        if (toEntityId(row.id as string | number) === preserveUserId) {
          return false;
        }
      } catch {
        /* id legacy (UUID) — kiểm tra email bên dưới */
      }
    }
    if (preservedEmail) {
      const email =
        typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';
      if (email && email === preservedEmail) return false;
    }
    return true;
  });

  if (filtered.length < rows.length) {
    onFiltered?.(rows.length - filtered.length, preserveUserId);
  }
  return filtered;
}
