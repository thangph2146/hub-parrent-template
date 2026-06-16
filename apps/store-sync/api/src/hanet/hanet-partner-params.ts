/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Body/query Hub (camelCase) → form partner.hanet.ai (placeID, aliasID, …). */
export type HanetPersonHubInput = Record<string, unknown> & {
  placeId?: string;
  aliasId?: string;
  personId?: string;
  /** Danh sách alias — map `listAliasID` trên HANET. */
  aliasIds?: string[] | string;
};

const HUB_TO_HANET_KEY: Record<string, string> = {
  placeId: 'placeID',
  aliasId: 'aliasID',
  personId: 'personID',
  deviceId: 'deviceID',
};

function appendScalar(
  target: Record<string, string | number>,
  key: string,
  value: unknown,
): void {
  if (value == null || value === '') return;
  const hanetKey = HUB_TO_HANET_KEY[key] ?? key;
  if (typeof value === 'number' && Number.isFinite(value)) {
    target[hanetKey] = value;
    return;
  }
  if (typeof value === 'boolean') {
    target[hanetKey] = value ? 1 : 0;
    return;
  }
  const text = String(value).trim();
  if (text) target[hanetKey] = text;
}

/** Gộp field Hub vào params HANET; `resolvedPlaceId` đã qua resolvePlaceId. */
export function buildHanetPersonParams(
  input: HanetPersonHubInput,
  resolvedPlaceId?: string,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (resolvedPlaceId) params.placeID = resolvedPlaceId;

  if (input.aliasIds != null) {
    const list = Array.isArray(input.aliasIds)
      ? input.aliasIds
      : String(input.aliasIds).split(',');
    const joined = list
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(',');
    if (joined) params.listAliasID = joined;
  }

  for (const [key, value] of Object.entries(input)) {
    if (
      key === 'placeId' ||
      key === 'aliasIds' ||
      value == null ||
      value === ''
    ) {
      continue;
    }
    appendScalar(params, key, value);
  }

  return params;
}
