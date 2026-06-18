import {
  CalendarDays,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"
import type { AdminMenuTreeItem } from "@ui/components/admin"
import {
  portalEventsPath,
  type EventPortalRole,
} from "@/lib/portal/event-portal-routes"

type PortalNavSource = {
  href: string
  label: string
  icon: LucideIcon
}

function portalNavSource(role: EventPortalRole): PortalNavSource[] {
  return [
    {
      href: portalEventsPath(role),
      label: "Sự kiện của tôi",
      icon: ClipboardList,
    },
    {
      href: "/su-kien",
      label: "Khám phá sự kiện",
      icon: CalendarDays,
    },
  ]
}

/** Menu sidebar cổng `[role]` — dùng với `AdminLayoutBridge`. */
export function buildEventPortalMenuTree(
  role: EventPortalRole,
): AdminMenuTreeItem[] {
  return portalNavSource(role).map((item) => ({
    type: "leaf" as const,
    href: item.href,
    label: item.label,
    icon: item.icon,
    permission: null,
  }))
}
