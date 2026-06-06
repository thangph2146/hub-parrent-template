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
  id: string;
  kind: SocketNotificationKind;
  title: string;
  description?: string | null;
  fromUserId?: string;
  toUserId?: string;
  replyToId?: string;
  timestamp: number;
  read?: boolean;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  userEmail?: string | null;
  userName?: string | null;
}

export interface SocketData {
  userId: string;
  role?: string;
  /** Id phiên đăng nhập (admin); có thì server join client vào room session:${sessionId} để nhận session:revoked */
  sessionId?: string;
}

export interface SessionRowDto {
  id: string;
  userId: string;
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

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function conversationRoom(a: string, b: string): string {
  const [minId, maxId] = a < b ? [a, b] : [b, a];
  return `conversation:${minId}:${maxId}`;
}

export function sessionRoom(sessionId: string): string {
  return `session:${sessionId}`;
}

export function roleRoom(role: string): string {
  return `role:${role}`;
}

export function eventRoom(eventId: string): string {
  return `event:${eventId}`;
}

export type EventAttendanceSocketPayload = {
  kind: 'checkin' | 'checkout';
  eventId: string;
  at: string;
  email: string;
  fullName: string;
  source: 'hanet' | 'manual';
  deviceId?: string | null;
  deviceName?: string | null;
  registrationId?: string | null;
  checkinId?: string | null;
  duplicate?: boolean;
  /** Trạng thái sau cập nhật — client patch cache chính xác kể cả reset thủ công. */
  hasCheckin?: boolean;
  hasCheckout?: boolean;
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
  id?: string;
};

/** Duyệt / đổi trạng thái — đồng bộ giữa nhiều tài khoản admin (hợp đồng @workspace/api-client/realtime). */
export type AdminStatusChangePayload = {
  resource: string;
  id: string;
  status: string;
  previousStatus?: string;
  title?: string;
  description?: string | null;
  actionUrl?: string | null;
  actorUserId?: string;
};

/** Admin duyệt/từ chối liên kết phụ huynh – học sinh. */
export type ParentStudentReviewSocketPayload = {
  id: string;
  parentId: string;
  studentCode: string;
  studentName: string | null;
  status: 'approved' | 'rejected';
  reviewedAt: string;
  reviewedBy?: string;
};
