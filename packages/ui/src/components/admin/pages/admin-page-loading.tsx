import { Loader2 } from "lucide-react"
import { AdminPageSection } from "./admin-page-section"
import { cn } from "../../../lib/utils"

export function AdminPageLoading({ className }: { className?: string }) {
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
