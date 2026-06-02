import type { ReactNode } from "react"
import { cn } from "../../../lib/utils"
import {
  ADMIN_PAGE_GRID_CLASS,
  ADMIN_PAGE_GRID_MAIN_CLASS,
  ADMIN_PAGE_GRID_SIDEBAR_CLASS,
} from "../../../lib/layout-shell"

export function AdminDetailLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(ADMIN_PAGE_GRID_CLASS, className)}>{children}</div>
}

export function AdminDetailMain({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(ADMIN_PAGE_GRID_MAIN_CLASS, className)}>{children}</div>
  )
}

export function AdminDetailSidebar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(ADMIN_PAGE_GRID_SIDEBAR_CLASS, className)}>{children}</div>
  )
}
