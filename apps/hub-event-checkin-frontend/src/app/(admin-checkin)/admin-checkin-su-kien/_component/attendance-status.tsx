import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge"
import { LogIn, LogOut, UserRound } from "lucide-react"
import { cn } from "@ui/lib/utils"

export type AttendanceRow = {
  hasCheckin?: boolean
  hasCheckout?: boolean
}

/** Trạng thái check-in/out trên danh sách đăng ký. */
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

function StatusIcon({ row }: { row: AttendanceRow }) {
  if (row.hasCheckin && row.hasCheckout) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        <LogIn className="size-3" />
        <LogOut className="size-3" />
      </span>
    )
  }
  if (row.hasCheckin) {
    return <LogIn className="size-3" aria-hidden />
  }
  return <UserRound className="size-3" aria-hidden />
}

export function AttendanceStatusBadge({ row }: { row: AttendanceRow }) {
  const tone = resolveAttendanceTone(row)
  return (
    <UsageStatusBadge tone={tone} className={cn("gap-1 text-[10px]")}>
      <StatusIcon row={row} />
      {getAttendanceStatusLabel(row)}
    </UsageStatusBadge>
  )
}
