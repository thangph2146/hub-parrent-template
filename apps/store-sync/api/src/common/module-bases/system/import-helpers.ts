/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Hàng import category: cha phải insert trước con (trùng logic seed-full-export). */
export type ImportRow = Record<string, unknown>;

/**
 * Bundle export cũ có key `heroSlide` (bảng legacy đã bỏ). Luôn xóa khỏi payload import.
 * Trả về số bản ghi đã bỏ (0 nếu không có key).
 */
export function stripLegacyHeroSlideFromBundle(
  data: Record<string, unknown>,
): number {
  const raw = data.heroSlide;
  delete data.heroSlide;
  return Array.isArray(raw) ? raw.length : 0;
}

/** Lỗi insert từng dòng có thể bỏ qua (trùng khóa / ràng buộc) thay vì fail cả request. */
export function isSkippableImportRowError(errMsg: string): boolean {
  const lower = errMsg.toLowerCase();
  return (
    lower.includes('duplicate') ||
    lower.includes('unique') ||
    lower.includes('constraint') ||
    lower.includes('out of range')
  );
}

/** Bỏ quyền `hero_slides:*` khỏi mảng permissions (resource đã gỡ khỏi hệ thống). */
export function stripHeroSlidesPermissions(permissions: unknown): unknown {
  if (!Array.isArray(permissions)) return permissions;
  return permissions.filter(
    (p) => typeof p !== 'string' || !String(p).startsWith('hero_slides:'),
  );
}

/** FK pivot: file cũ dùng postId/categoryId; export MikroORM serialize dùng post/category/tag (scalar hoặc { id }). */
export function pivotFk(
  row: ImportRow,
  idProp: string,
  relProp: string,
): string {
  const direct = row[idProp];
  if (direct != null && direct !== '') return String(direct as string | number);
  const rel = row[relProp];
  if (rel == null || rel === '') return '';
  if (typeof rel === 'string' || typeof rel === 'number') return String(rel);
  if (typeof rel === 'object' && rel !== null && 'id' in rel) {
    const id = (rel as { id: unknown }).id;
    return id == null ? '' : String(id as string | number);
  }
  return '';
}

function collectIds(rows: unknown): Set<string> {
  const ids = new Set<string>();
  if (!Array.isArray(rows)) return ids;
  for (const row of rows) {
    const id = (row as ImportRow).id;
    if (id != null && id !== '') ids.add(String(id as string | number));
  }
  return ids;
}

function filterPivotRows(
  pivotRows: unknown,
  checks: Array<(row: ImportRow) => boolean>,
): { next: ImportRow[]; dropped: number } {
  if (!Array.isArray(pivotRows)) return { next: [], dropped: 0 };
  const before = pivotRows.length;
  const next = pivotRows.filter((row) =>
    checks.every((check) => check(row as ImportRow)),
  );
  return { next: next as ImportRow[], dropped: before - next.length };
}

/** Lọc pivot / bảng liên kết trỏ tới id không có trong cùng bundle (export/import JSON tự nhất quán). */
export function sanitizePivotRowsInExportJson(data: Record<string, unknown>): {
  droppedPostCategory: number;
  droppedPostTag: number;
  droppedEventSpeaker: number;
  droppedEventRegistration: number;
  droppedEventCheckin: number;
  droppedGroupMember: number;
  droppedMessageRead: number;
  droppedUserRole: number;
} {
  let droppedPostCategory = 0;
  let droppedPostTag = 0;
  let droppedEventSpeaker = 0;
  let droppedEventRegistration = 0;
  let droppedEventCheckin = 0;
  let droppedGroupMember = 0;
  let droppedMessageRead = 0;
  let droppedUserRole = 0;

  const postIds = collectIds(data.post);
  const categoryIds = collectIds(data.category);
  const tagIds = collectIds(data.tag);
  const eventIds = collectIds(data.event);
  const speakerIds = collectIds(data.speaker);
  const groupIds = collectIds(data.group);
  const userIds = collectIds(data.user);
  const messageIds = collectIds(data.message);
  const roleIds = collectIds(data.role);

  if (
    postIds.size > 0 &&
    categoryIds.size > 0 &&
    Array.isArray(data.postCategory)
  ) {
    const { next, dropped } = filterPivotRows(data.postCategory, [
      (row) => {
        const pid = pivotFk(row, 'postId', 'post');
        const cid = pivotFk(row, 'categoryId', 'category');
        return Boolean(pid && cid && postIds.has(pid) && categoryIds.has(cid));
      },
    ]);
    data.postCategory = next;
    droppedPostCategory = dropped;
  }

  if (postIds.size > 0 && tagIds.size > 0 && Array.isArray(data.postTag)) {
    const { next, dropped } = filterPivotRows(data.postTag, [
      (row) => {
        const pid = pivotFk(row, 'postId', 'post');
        const tid = pivotFk(row, 'tagId', 'tag');
        return Boolean(pid && tid && postIds.has(pid) && tagIds.has(tid));
      },
    ]);
    data.postTag = next;
    droppedPostTag = dropped;
  }

  if (
    eventIds.size > 0 &&
    speakerIds.size > 0 &&
    Array.isArray(data.eventSpeaker)
  ) {
    const { next, dropped } = filterPivotRows(data.eventSpeaker, [
      (row) => {
        const eid = pivotFk(row, 'eventId', 'event');
        const sid = pivotFk(row, 'speakerId', 'speaker');
        return Boolean(eid && sid && eventIds.has(eid) && speakerIds.has(sid));
      },
    ]);
    data.eventSpeaker = next;
    droppedEventSpeaker = dropped;
  }

  if (eventIds.size > 0 && Array.isArray(data.eventRegistration)) {
    const { next, dropped } = filterPivotRows(data.eventRegistration, [
      (row) => {
        const eid = pivotFk(row, 'eventId', 'event');
        return Boolean(eid && eventIds.has(eid));
      },
    ]);
    data.eventRegistration = next;
    droppedEventRegistration = dropped;
  }

  if (eventIds.size > 0 && Array.isArray(data.eventCheckin)) {
    const { next, dropped } = filterPivotRows(data.eventCheckin, [
      (row) => {
        const eid = pivotFk(row, 'eventId', 'event');
        return Boolean(eid && eventIds.has(eid));
      },
    ]);
    data.eventCheckin = next;
    droppedEventCheckin = dropped;
  }

  if (
    groupIds.size > 0 &&
    userIds.size > 0 &&
    Array.isArray(data.groupMember)
  ) {
    const { next, dropped } = filterPivotRows(data.groupMember, [
      (row) => {
        const gid = pivotFk(row, 'groupId', 'group');
        const uid = pivotFk(row, 'userId', 'user');
        return Boolean(gid && uid && groupIds.has(gid) && userIds.has(uid));
      },
    ]);
    data.groupMember = next;
    droppedGroupMember = dropped;
  }

  if (
    messageIds.size > 0 &&
    userIds.size > 0 &&
    Array.isArray(data.messageRead)
  ) {
    const { next, dropped } = filterPivotRows(data.messageRead, [
      (row) => {
        const mid = pivotFk(row, 'messageId', 'message');
        const uid = pivotFk(row, 'userId', 'user');
        return Boolean(mid && uid && messageIds.has(mid) && userIds.has(uid));
      },
    ]);
    data.messageRead = next;
    droppedMessageRead = dropped;
  }

  if (userIds.size > 0 && roleIds.size > 0 && Array.isArray(data.userRole)) {
    const { next, dropped } = filterPivotRows(data.userRole, [
      (row) => {
        const uid = pivotFk(row, 'userId', 'user');
        const rid = pivotFk(row, 'roleId', 'role');
        return Boolean(uid && rid && userIds.has(uid) && roleIds.has(rid));
      },
    ]);
    data.userRole = next;
    droppedUserRole = dropped;
  }

  return {
    droppedPostCategory,
    droppedPostTag,
    droppedEventSpeaker,
    droppedEventRegistration,
    droppedEventCheckin,
    droppedGroupMember,
    droppedMessageRead,
    droppedUserRole,
  };
}

/** Khóa ổn định khi PK legacy (UUID) đã bị strip trước insert — tránh Map chỉ còn 1 dòng \`""\`. */
function categoryImportPoolKey(row: ImportRow): string {
  if (row.id != null && String(row.id).trim() !== '') {
    return String(row.id).trim();
  }
  if (row.slug != null && String(row.slug).trim() !== '') {
    return `slug:${String(row.slug).trim()}`;
  }
  const name = row.name != null ? String(row.name).trim() : '';
  return name ? `name:${name}` : `row:${JSON.stringify(row)}`;
}

function categoryParentLegacyRef(row: ImportRow): string | null {
  const parent = row.parent ?? row.parentId;
  if (parent == null || parent === '') return null;
  return String(parent).trim();
}

export function orderCategoryRowsForImport(rows: ImportRow[]): ImportRow[] {
  const pool = new Map<string, ImportRow>();
  for (const row of rows) {
    pool.set(categoryImportPoolKey(row), { ...row });
  }
  const result: ImportRow[] = [];
  const inserted = new Set<string>();
  let guard = 0;
  while (pool.size && guard++ < rows.length + 10) {
    let added = 0;
    for (const [key, row] of [...pool.entries()]) {
      const parentRef = categoryParentLegacyRef(row);
      if (!parentRef || inserted.has(parentRef)) {
        result.push(row);
        if (row.id != null && String(row.id).trim() !== '') {
          inserted.add(String(row.id).trim());
        }
        inserted.add(key);
        pool.delete(key);
        added++;
      }
    }
    if (added === 0) break;
  }
  for (const row of pool.values()) {
    row.parent = null;
    row.parentId = null;
    result.push(row);
  }
  return result;
}
