/** Tên event Socket.IO — giữ đồng bộ với apps/api/src/socket/socket.gateway.ts */

export const ADMIN_SOCKET_EVENTS = {
  adminInvalidate: "admin:invalidate",
  adminStatusChanged: "admin:status-changed",
  roleUpsert: "role:upsert",
  sessionUpsert: "session:upsert",
  sessionRemove: "session:remove",
  sessionRevoked: "session:revoked",
  notificationNew: "notification:new",
  notificationAdmin: "notification:admin",
  notificationUpdated: "notification:updated",
  notificationsSync: "notifications:sync",
  parentStudentReviewed: "parent-student:reviewed",
  eventAttendance: "event:attendance",
} as const

export type AdminSocketEventName =
  (typeof ADMIN_SOCKET_EVENTS)[keyof typeof ADMIN_SOCKET_EVENTS]
