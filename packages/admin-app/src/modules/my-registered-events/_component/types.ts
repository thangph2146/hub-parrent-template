import type {
  MyRegisteredEvent,
  MyRegisteredEventStats,
} from "../_lib/my-registered-events"

export type { MyRegisteredEvent, MyRegisteredEventStats }

export type MyRegisteredEventRow = MyRegisteredEvent

export { MY_REGISTRATION_STATUS } from "../_lib/my-registered-events"

export const REGISTRATION_STATUS_LABELS: Record<number, string> = {
  0: "Chờ xử lý",
  1: "Đã xác nhận",
  2: "Đã hủy",
}

export const ATTENDANCE_STATUS_LABELS: Record<number, string> = {
  0: "Chưa tham dự",
  1: "Một phần",
  2: "Đã tham dự",
}
