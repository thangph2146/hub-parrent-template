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
