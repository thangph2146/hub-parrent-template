import {
  CalendarDays,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"
import type { AdminMenuTreeItem } from "@ui/components/admin"

type StudentNavSource = {
  href: string
  label: string
  icon: LucideIcon
}

const STUDENT_NAV_SOURCE: StudentNavSource[] = [
  { href: "/student/events", label: "Sự kiện của tôi", icon: ClipboardList },
  { href: "/su-kien", label: "Khám phá sự kiện", icon: CalendarDays },
]

/** Menu sidebar cổng sinh viên — dùng với `AdminLayoutBridge`. */
export const STUDENT_PORTAL_MENU_TREE: AdminMenuTreeItem[] =
  STUDENT_NAV_SOURCE.map((item) => ({
    type: "leaf" as const,
    href: item.href,
    label: item.label,
    icon: item.icon,
    permission: null,
  }))
