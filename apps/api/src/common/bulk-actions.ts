import { toEntityIdList } from './entity-id';
import {
  type EntityManager,
  type EntityName,
  type FilterQuery,
} from '@mikro-orm/core';

export type BulkAction = 'delete' | 'restore' | 'hard-delete';

export interface BulkResult {
  affected: number;
  message: string;
}

export interface BulkOptions {
  /** Vietnamese singular label used in success messages, e.g. "thẻ", "khoa". */
  label: string;
  /** Field name used for soft-delete; default `deletedAt`. */
  deletedAtField?: string;
}

export const BULK_ACTIONS: ReadonlySet<BulkAction> = new Set<BulkAction>([
  'delete',
  'restore',
  'hard-delete',
]);

export function isBulkAction(action: string): action is BulkAction {
  return BULK_ACTIONS.has(action as BulkAction);
}

/**
 * Apply a bulk action (delete / restore / hard-delete) to an entity by id list.
 * Reused by every admin resource that exposes `POST /admin/<resource>/bulk`.
 */
export async function applyBulkAction<T extends object>(
  em: EntityManager,
  entity: EntityName<T>,
  action: BulkAction,
  ids: string[],
  options: BulkOptions,
): Promise<BulkResult> {
  if (!ids.length) {
    return { affected: 0, message: 'Không có bản ghi nào' };
  }
  const trimmed = toEntityIdList(ids);
  if (!trimmed.length) {
    return { affected: 0, message: 'Không có bản ghi nào' };
  }
  const field = options.deletedAtField ?? 'deletedAt';
  const { label } = options;

  if (action === 'delete') {
    const result = await em.nativeUpdate(
      entity,
      { id: { $in: trimmed }, [field]: null } as unknown as FilterQuery<T>,
      { [field]: new Date() } as object,
    );
    const affected = result ?? 0;
    return { affected, message: `Đã xóa ${affected} ${label}` };
  }

  if (action === 'restore') {
    const result = await em.nativeUpdate(
      entity,
      {
        id: { $in: trimmed },
        [field]: { $ne: null },
      } as unknown as FilterQuery<T>,
      { [field]: null } as object,
    );
    const affected = result ?? 0;
    return { affected, message: `Đã khôi phục ${affected} ${label}` };
  }

  // hard-delete
  const rows = await em.find(entity, {
    id: { $in: trimmed },
  } as unknown as FilterQuery<T>);
  if (rows.length) {
    await em.removeAndFlush(rows);
  }
  return {
    affected: rows.length,
    message: `Đã xóa vĩnh viễn ${rows.length} ${label}`,
  };
}
