import { Loader2 } from "lucide-react"
import { AdminPageSection } from "./admin-page-section"
import { cn } from "../../../lib/utils"
import {
  AdminDetailPageSkeleton,
  AdminFormPageSkeleton,
  AdminListPageSkeleton,
} from "./admin-page-skeletons"

export type AdminPageLoadingVariant =
  | "spinner"
  | "list"
  | "detail"
  | "form"

export function AdminPageLoading({
  className,
  variant = "detail",
}: {
  className?: string
  /** `detail` / `form` / `list` = skeleton layout; `spinner` = chỉ icon quay. */
  variant?: AdminPageLoadingVariant
}) {
  if (variant === "list") return <AdminListPageSkeleton />
  if (variant === "detail") return <AdminDetailPageSkeleton />
  if (variant === "form") return <AdminFormPageSkeleton />

  return (
    <AdminPageSection
      className={cn("flex items-center justify-center py-24", className)}
    >
      <Loader2
        className="size-8 animate-spin text-muted-foreground"
        aria-hidden
      />
      <span className="sr-only">Đang tải…</span>
    </AdminPageSection>
  )
}
