import { pickHanetString } from './hanet-payload';

export type HanetPlaceRow = {
  placeId: string;
  name: string;
};

export function parseHanetPlaceRecord(raw: unknown): HanetPlaceRow | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  const placeId = pickHanetString(record, [
    'placeID',
    'placeId',
    'place_id',
    'id',
  ]);
  if (!placeId) return null;

  const name = pickHanetString(record, [
    'placeName',
    'place_name',
    'name',
    'title',
  ]);

  return {
    placeId,
    name: name || `Place ${placeId}`,
  };
}

function collectPlaceArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  for (const key of ['list', 'places', 'placeList', 'items', 'rows', 'data']) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested;
  }

  return [];
}

export function parseHanetPlaceList(data: unknown): HanetPlaceRow[] {
  const rawItems = collectPlaceArray(data);
  return rawItems
    .map((row) => parseHanetPlaceRecord(row))
    .filter((row): row is HanetPlaceRow => row != null);
}
