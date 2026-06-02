import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge"

export type AttendanceRow = {
  hasCheckin?: boolean
  hasCheckout?: boolean
}

/** Trạng thái check-in/out trên danh sách đăng ký (giống hệ cũ). */
export function getAttendanceStatusLabel(row: AttendanceRow): string {
  if (row.hasCheckin && row.hasCheckout) return "Đã check-in / check-out"
  if (row.hasCheckin) return "Đã check-in"
  return "Chưa check-in"
}

function resolveAttendanceTone(row: AttendanceRow): UsageStatusTone {
  if (row.hasCheckin && row.hasCheckout) return "success"
  if (row.hasCheckin) return "warning"
  return "danger"
}

export function AttendanceStatusBadge({ row }: { row: AttendanceRow }) {
  return (
    <UsageStatusBadge
      tone={resolveAttendanceTone(row)}
      label={getAttendanceStatusLabel(row)}
      className="text-[10px]"
    />
  )
}
