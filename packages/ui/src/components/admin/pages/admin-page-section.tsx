import type { ReactNode } from "react"
import { PageSection } from "../../layout"
import { cn } from "../../../lib/utils"

export type AdminPageSectionProps = {
  children: ReactNode
  className?: string
}

/** Vỏ `PageSection` chuẩn mọi trang admin (list / detail / form). */
export function AdminPageSection({ children, className }: AdminPageSectionProps) {
  return (
    <PageSection max="full" className={cn("min-w-0 space-y-6", className)}>
      {children}
    </PageSection>
  )
}
