import { Loader2 } from "lucide-react"
import { AdminPageSection } from "./admin-page-section"
import { cn } from "../../../lib/utils"
import {
  AdminDetailPageSkeleton,
  AdminFormPageSkeleton,
  AdminListPageSkeleton,
} from "./admin-page-skeletons"

export type AdminPageLoadingVariant = "spinner" | "list" | "detail" | "form"

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
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-24",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">Đang tải dữ liệu…</p>
      <span className="sr-only">Đang tải…</span>
    </AdminPageSection>
  )
}
