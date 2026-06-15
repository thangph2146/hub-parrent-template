/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { pickHanetString } from './hanet-payload';

/** Một person từ partner API HANET (getListPersonByPlace / webhook). */
export type HanetPersonRow = {
  personId: string;
  displayName: string;
  aliasId: string;
  avatar: string;
};

export function parseHanetPersonRecord(raw: unknown): HanetPersonRow | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  const personId = pickHanetString(record, [
    'personID',
    'personId',
    'person_id',
    'id',
  ]);
  if (!personId) return null;

  const displayName = pickHanetString(record, [
    'personName',
    'person_name',
    'name',
    'fullName',
  ]);
  const aliasId = pickHanetString(record, ['aliasID', 'aliasId', 'alias_id']);
  const avatar = pickHanetString(record, [
    'avatar',
    'image',
    'imageUrl',
    'image_url',
    'faceUrl',
    'face_url',
    'url',
  ]);

  return {
    personId,
    displayName,
    aliasId,
    avatar,
  };
}

function collectPersonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  for (const key of [
    'list',
    'persons',
    'personList',
    'items',
    'rows',
    'data',
  ]) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested;
  }

  return [];
}

/** Parse trang danh sách person từ `data` partner API. */
export function parseHanetPersonListPage(data: unknown): {
  items: HanetPersonRow[];
  total?: number;
} {
  const rawItems = collectPersonArray(data);
  const items = rawItems
    .map((row) => parseHanetPersonRecord(row))
    .filter((row): row is HanetPersonRow => row != null);

  let total: number | undefined;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    const totalRaw = record.total ?? record.totalCount ?? record.count;
    if (typeof totalRaw === 'number' && Number.isFinite(totalRaw)) {
      total = totalRaw;
    } else if (typeof totalRaw === 'string' && totalRaw.trim()) {
      const parsed = Number.parseInt(totalRaw, 10);
      if (Number.isFinite(parsed)) total = parsed;
    }
  }

  if (total == null && items.length > 0) {
    total = items.length;
  }

  return { items, total };
}
