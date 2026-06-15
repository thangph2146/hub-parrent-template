/** Hợp đồng Socket.IO dùng chung giữa @api và admin clients (@backend). */

export type SocketNotificationKind =
  | "message"
  | "system"
  | "announcement"
  | "alert"
  | "warning"
  | "success"
  | "info"

export type SocketNotificationPayload = {
  id: string | number
  kind: SocketNotificationKind
  title: string
  description?: string | null
  fromUserId?: string | number
  toUserId?: string | number
  replyToId?: string | number
  timestamp: number
  read?: boolean
  actionUrl?: string | null
  metadata?: Record<string, unknown> | null
  userEmail?: string | null
  userName?: string | null
}

export type SocketAuthData = {
  userId: string
  role?: string
  sessionId?: string
}

/** Invalidate React Query cache sau mutation CRUD admin. */
export type AdminCacheInvalidatePayload = {
  resource: string
  action:
    | "create"
    | "update"
    | "delete"
    | "restore"
    | "purge"
    | "bulk"
    | "mutate"
  id?: string
}

/** Duyệt / đổi trạng thái — đồng bộ list giữa nhiều tài khoản admin. */
export type AdminStatusChangePayload = {
  resource: string
  id: string
  status: string
  previousStatus?: string
  title?: string
  description?: string | null
  actionUrl?: string | null
  actorUserId?: string
}

/** Admin duyệt/từ chối liên kết phụ huynh – học sinh. */
export type ParentStudentReviewSocketPayload = {
  id: string
  parentId: string
  studentCode: string
  studentName: string | null
  status: "approved" | "rejected"
  reviewedAt: string
  reviewedBy?: string
}

export type EventAttendanceSocketPayload = {
  kind: "checkin" | "checkout"
  eventId: string
  at: string
  email: string
  fullName: string
  source: "hanet" | "manual"
  deviceId?: string | null
  deviceName?: string | null
  registrationId?: string | null
  checkinId?: string | null
  duplicate?: boolean
  hasCheckin?: boolean
  hasCheckout?: boolean
}

/** Log webhook HANET trên tab theo dõi realtime admin. */
export type EventHanetSyncSocketPayload = {
  kind:
    | "device"
    | "place"
    | "person"
    | "checkin"
    | "checkout"
    | "unknown"
  action?: string
  eventId?: number | string | null
  at: string
  summary: string
  deviceId?: string
  placeId?: string
  personId?: string
  personName?: string
  entityId?: number
  linkedUserId?: number
  linkedRegistrations?: number
  email?: string
  fullName?: string
  registrationId?: number | string | null
  duplicate?: boolean
  acknowledged: boolean
  error?: string
}
