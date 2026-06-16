export type HanetPlaceOption = {
  placeId: string;
  name: string;
};

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function parsePlaceRecord(raw: unknown): HanetPlaceOption | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const placeId = pickString(record, [
    'placeID',
    'placeId',
    'place_id',
    'id',
  ]);
  if (!placeId) return null;
  const name = pickString(record, ['placeName', 'place_name', 'name', 'title']);
  return { placeId, name: name || `Place ${placeId}` };
}

/** Parse chi tiết từ `getPlaceInfo` hoặc payload place đơn lẻ. */
export function parseHanetPlaceDetail(data: unknown): {
  placeName: string;
  address: string;
  type?: number;
} {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { placeName: "", address: "" };
  }
  const record = data as Record<string, unknown>;
  const typeValue = record.type ?? record.placeType;
  return {
    placeName: pickString(record, ["placeName", "place_name", "name", "title"]),
    address: pickString(record, ["address", "placeAddress", "place_address"]),
    type:
      typeof typeValue === "number" && Number.isFinite(typeValue)
        ? typeValue
        : undefined,
  };
}

function collectArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  for (const key of ['list', 'places', 'placeList', 'items', 'rows', 'data']) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

/** Parse payload từ `GET /admin/hanet/places`. */
export function parseHanetPlacesResponse(data: unknown): HanetPlaceOption[] {
  return collectArray(data)
    .map((row) => parsePlaceRecord(row))
    .filter((row): row is HanetPlaceOption => row != null);
}
