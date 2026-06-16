/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Payload webhook HANET (linh hoạt theo tài liệu developers.hanet.ai). */
export type HanetWebhookBody = Record<string, unknown>;

export type HanetCameraRole = 'checkin' | 'checkout';

export type HanetResolveContext = {
  eventId: number;
  /** Suy từ camera check-in/out của sự kiện khi có deviceID. */
  cameraRole: HanetCameraRole | null;
};

export type HanetWebhookResult = {
  kind: 'checkin' | 'checkout';
  eventId: number;
  email: string;
  fullName: string;
  registrationId: number | null;
  checkinId: string | null;
  at: string;
  /** Đã có trạng thái trước đó — vẫn emit socket để đồng bộ UI. */
  duplicate?: boolean;
};

/** Push sync webhook: device / place / person (add|update|delete). */
export type HanetSyncResult = {
  kind: 'device' | 'place' | 'person' | 'unknown';
  action?: string;
  dataType?: string;
  deviceId?: string;
  placeId?: string;
  personId?: string;
  personName?: string;
  avatar?: string;
  entityId?: number;
  acknowledged: boolean;
  error?: string;
  note?: string;
  linkedRegistrations?: number;
  linkedUserId?: number;
};

export type HanetWebhookHandleResult = HanetWebhookResult | HanetSyncResult;
