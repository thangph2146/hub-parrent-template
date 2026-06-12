/** Payload webhook HANET (linh hoạt theo tài liệu developers.hanet.ai). */
export type HanetWebhookBody = Record<string, unknown>;

export type HanetCameraRole = 'checkin' | 'checkout';

export type HanetResolveContext = {
  eventId: number;
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
  duplicate?: boolean;
};

export type HanetAttendanceApplyResult = {
  email: string;
  fullName: string;
  registrationId: number;
  at: string;
  duplicate?: boolean;
};
