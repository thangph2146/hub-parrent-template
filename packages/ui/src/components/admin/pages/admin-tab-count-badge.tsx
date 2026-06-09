import { Badge } from "../../badge"
import { ADMIN_LIST_TABS_COUNT_BADGE_CLASS } from "../../../lib/layout-shell"
import { cn } from "../../../lib/utils"

export type AdminTabCountBadgeProps = {
  count: number | string
  className?: string
}

/** Badge đếm dùng trong `TabsTrigger` admin list (Danh sách / Thùng rác). */
export function AdminTabCountBadge({
  count,
  className,
}: AdminTabCountBadgeProps) {
  return (
    <Badge
      variant="muted"
      size="xs"
      className={cn(ADMIN_LIST_TABS_COUNT_BADGE_CLASS, className)}
    >
      {count}
    </Badge>
  )
}
