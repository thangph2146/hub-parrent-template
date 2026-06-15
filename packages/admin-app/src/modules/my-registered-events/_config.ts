export type CheckinPortalRole = "student" | "guest"

export type MyRegisteredEventsPageConfig = {
  role: CheckinPortalRole
  /** Prefix path trang chi tiết sự kiện công khai — mặc định `/su-kien`. */
  eventDetailPathPrefix?: string
  tableScope?: string
  exportAudienceLabel?: string
  registrantColumnLabel?: string
}

export const CHECKIN_STUDENT_MY_EVENTS_CONFIG: MyRegisteredEventsPageConfig = {
  role: "student",
  tableScope: "student-my-registered-events",
  exportAudienceLabel: "sinh viên",
  registrantColumnLabel: "Sinh viên",
}

export const CHECKIN_GUEST_MY_EVENTS_CONFIG: MyRegisteredEventsPageConfig = {
  role: "guest",
  tableScope: "guest-my-registered-events",
  exportAudienceLabel: "khách",
  registrantColumnLabel: "Người đăng ký",
}
