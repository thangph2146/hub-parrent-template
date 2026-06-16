import type { HanetWebhookBody } from './hanet.types';

export type HanetSyncAction = 'add' | 'update' | 'delete';

/** Payload giống webhook Place Data — dùng sau Partner API mutation. */
export function buildHanetPlaceSyncBody(
  action: HanetSyncAction,
  placeId: string,
  placeName?: string,
): HanetWebhookBody {
  return {
    action_type: action,
    data_type: 'place',
    placeID: placeId,
    placeName: placeName?.trim() || `Place ${placeId}`,
    id: `hub-place-${action}-${placeId}-${Date.now()}`,
  };
}

/** Payload giống webhook Device Data — dùng sau ensureCamera / webhook. */
export function buildHanetDeviceSyncBody(
  action: HanetSyncAction,
  deviceId: string,
  deviceName: string,
  placeId: string,
  placeName?: string,
): HanetWebhookBody {
  return {
    action_type: action,
    data_type: 'device',
    deviceID: deviceId,
    deviceName: deviceName.trim() || deviceId,
    placeID: placeId,
    placeName: placeName?.trim() || '',
    id: `hub-device-${action}-${deviceId}-${Date.now()}`,
  };
}
