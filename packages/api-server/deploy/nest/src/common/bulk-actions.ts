/**
 * Bulk Actions.
 *
 * Bám sát pattern `apps/main/api/src/common/bulk-actions.ts`.
 *
 * Cung cấp `applyBulkAction<T>()` - helper chung để xử lý bulk delete /
 * restore / hard-delete cho MỌI entity.
 */
import { type EntityManager, type EntityName, type FilterQuery } from '@mikro-orm/core';
import { isEntityId } from './entity-id';

export type BulkAction = 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive';

export interface BulkResult {
  affected: number;
  message: string;
}

export interface BulkOptions {
  /** Vietnamese singular label used in success messages, e.g. "thẻ", "khoa". */
  label: string;
  /** Field name used for soft-delete; default `deletedAt`. */
  deletedAtField?: string;
  /** Field used for active state. Default `isActive`. Set to null to disable active/unactive. */
  activeField?: string | null;
}

export const BULK_ACTIONS: ReadonlySet<BulkAction> = new Set<BulkAction>([
  'delete',
  'restore',
  'hard-delete',
  'active',
  'unactive',
]);

export function isBulkAction(action: string): action is BulkAction {
  return BULK_ACTIONS.has(action as BulkAction);
}

/**
 * Apply a bulk action (delete / restore / hard-delete / active / unactive)
 * to an entity by id list. Reused by every admin resource that exposes
 * `POST /admin/<resource>/bulk`.
 */
export async function applyBulkAction<T extends object>(
  em: EntityManager,
  entity: EntityName<T>,
  action: BulkAction,
  ids: Array<string | number>,
  options: BulkOptions,
): Promise<BulkResult> {
  if (!ids.length) {
    return { affected: 0, message: 'Không có bản ghi nào' };
  }

  // Lọc IDs: giữ lại số nguyên dương HOẶC CUID/string identifier hợp lệ.
  // Tự động nhận biết numeric id vs string id để hỗ trợ cả 2 loại entity.
  const numericIds: number[] = [];
  const stringIds: string[] = [];
  for (const id of ids) {
    if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      numericIds.push(id);
    } else if (typeof id === 'string') {
      const trimmed = id.trim();
      if (trimmed) {
        if (isEntityId(trimmed)) {
          // Numeric-looking string → giữ nguyên dạng số
          const n = parseInt(trimmed, 10);
          if (!numericIds.includes(n)) numericIds.push(n);
        } else {
          // CUID hoặc non-numeric identifier → giữ nguyên dạng string
          if (!stringIds.includes(trimmed)) stringIds.push(trimmed);
        }
      }
    }
  }
  if (!numericIds.length && !stringIds.length) {
    return { affected: 0, message: 'Không có bản ghi nào' };
  }

  // Build $in filter hỗn hợp numeric + string
  const idFilter = { id: { $in: [...numericIds, ...stringIds] } };

  const field = options.deletedAtField ?? 'deletedAt';
  const activeField = options.activeField === undefined ? 'isActive' : options.activeField;
  const { label } = options;

  if (action === 'delete') {
    const result = await em.nativeUpdate(
      entity,
      { ...idFilter, [field]: null } as unknown as FilterQuery<T>,
      { [field]: new Date() } as object,
    );
    const affected = result ?? 0;
    return { affected, message: `Đã xóa ${affected} ${label}` };
  }

  if (action === 'restore') {
    const result = await em.nativeUpdate(
      entity,
      {
        ...idFilter,
        [field]: { $ne: null },
      } as unknown as FilterQuery<T>,
      { [field]: null } as object,
    );
    const affected = result ?? 0;
    return { affected, message: `Đã khôi phục ${affected} ${label}` };
  }

  if (action === 'active' && activeField) {
    const result = await em.nativeUpdate(
      entity,
      idFilter as unknown as FilterQuery<T>,
      { [activeField]: true } as object,
    );
    const affected = result ?? 0;
    return { affected, message: `Đã kích hoạt ${affected} ${label}` };
  }

  if (action === 'unactive' && activeField) {
    const result = await em.nativeUpdate(
      entity,
      idFilter as unknown as FilterQuery<T>,
      { [activeField]: false } as object,
    );
    const affected = result ?? 0;
    return { affected, message: `Đã hủy kích hoạt ${affected} ${label}` };
  }

  // hard-delete
  const rows = await em.find(entity, idFilter as unknown as FilterQuery<T>);
  if (rows.length) {
    await em.removeAndFlush(rows);
  }
  return {
    affected: rows.length,
    message: `Đã xóa vĩnh viễn ${rows.length} ${label}`,
  };
}
