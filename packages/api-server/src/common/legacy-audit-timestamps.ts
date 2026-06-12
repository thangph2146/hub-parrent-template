/**
 * Legacy Audit Timestamps.
 *
 * Bám sát pattern `apps/main/api/src/common/legacy-audit-timestamps.ts`.
 *
 * Helper tự động set `createdAt` / `updatedAt` cho các entity legacy
 * (import từ JSON cũ / DB cũ) mà timestamps có thể null.
 */

/** Bản ghi legacy có created_at / updated_at nullable. */
export type LegacyAuditEntity = {
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export function touchLegacyAuditTimestamps(
  entity: LegacyAuditEntity,
  isCreate = false,
): void {
  const now = new Date();
  if (isCreate || !entity.createdAt) {
    entity.createdAt = entity.createdAt ?? now;
  }
  entity.updatedAt = now;
}

export function backfillLegacyAuditTimestampsIfMissing(
  entity: LegacyAuditEntity,
): boolean {
  const now = new Date();
  let changed = false;
  if (!entity.createdAt) {
    entity.createdAt = now;
    changed = true;
  }
  if (!entity.updatedAt) {
    entity.updatedAt = entity.createdAt ?? now;
    changed = true;
  }
  return changed;
}
