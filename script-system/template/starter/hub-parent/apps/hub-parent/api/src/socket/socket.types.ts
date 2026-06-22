/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Socket.IO event types tương thích với tuyen-sinh-admin
 */

export type SocketNotificationKind =
  | 'message'
  | 'system'
  | 'announcement'
  | 'alert'
  | 'warning'
  | 'success'
  | 'info';

export interface SocketNotificationPayload {
  id: number;
  kind: SocketNotificationKind;
  title: string;
  description?: string | null;
  fromUserId?: string;
  toUserId?: string | number;
  replyToId?: string;
  timestamp: number;
  read?: boolean;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  userEmail?: string | null;
  userName?: string | null;
}

export interface SocketData {
  userId: number;
  role?: string;
  /** Id phiên đăng nhập (admin); có thì server join client vào room session:${sessionId} để nhận session:revoked */
  sessionId?: string;
}

export interface SessionRowDto {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string;
  accessToken: string;
  refreshToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  isActive: boolean;
  expiresAt: string;
  lastActivity: string;
  createdAt: string;
  deletedAt: null;
}

export const MAX_HTTP_BUFFER_SIZE = 5 * 1024 * 1024; // 5MB
export const SOCKET_PATH = '/api/socket';

export function userRoom(userId: string | number): string {
  return `user:${userId}`;
}

export function conversationRoom(
  a: string | number,
  b: string | number,
): string {
  const sa = String(a);
  const sb = String(b);
  const [minId, maxId] = sa < sb ? [sa, sb] : [sb, sa];
  return `conversation:${minId}:${maxId}`;
}

export function sessionRoom(sessionId: string): string {
  return `session:${sessionId}`;
}

export function roleRoom(role: string): string {
  return `role:${role}`;
}

export function eventRoom(eventId: string | number): string {
  return `event:${eventId}`;
}

export type EventAttendanceSocketPayload = {
  kind: 'checkin' | 'checkout';
  eventId: number;
  at: string;
  email: string;
  fullName: string;
  source: 'hanet' | 'manual';
  deviceId?: string | null;
  deviceName?: string | null;
  registrationId?: string | number | null;
  checkinId?: string | null;
  duplicate?: boolean;
  /** Trạng thái sau cập nhật — client patch cache chính xác kể cả reset thủ công. */
  hasCheckin?: boolean;
  hasCheckout?: boolean;
};

/** Log webhook HANET (sync device/place/person + check-in/out) trên admin realtime. */
export type EventHanetSyncSocketPayload = {
  kind: 'device' | 'place' | 'person' | 'checkin' | 'checkout' | 'unknown';
  action?: string;
  eventId?: number | null;
  at: string;
  summary: string;
  deviceId?: string;
  deviceName?: string;
  placeId?: string;
  personId?: string;
  personName?: string;
  entityId?: number;
  linkedUserId?: number;
  linkedRegistrations?: number;
  email?: string;
  fullName?: string;
  registrationId?: number | null;
  duplicate?: boolean;
  acknowledged: boolean;
  error?: string;
};

/** Invalidate React Query cache trên admin clients sau mutation CRUD. */
export type AdminCacheInvalidatePayload = {
  resource: string;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'restore'
    | 'purge'
    | 'bulk'
    | 'mutate';
  id?: string | number;
};

/** Duyệt / đổi trạng thái — đồng bộ giữa nhiều tài khoản admin (hợp đồng @workspace/api-client/realtime). */
export type AdminStatusChangePayload = {
  resource: string;
  id: number;
  status: string;
  previousStatus?: string;
  title?: string;
  description?: string | null;
  actionUrl?: string | null;
  actorUserId?: string;
};

/** Admin duyệt/từ chối liên kết phụ huynh – học sinh. */
export type ParentStudentReviewSocketPayload = {
  id: number;
  parentId: number;
  studentCode: string;
  studentName: string | null;
  status: 'approved' | 'rejected';
  reviewedAt: string;
  reviewedBy?: string;
};
