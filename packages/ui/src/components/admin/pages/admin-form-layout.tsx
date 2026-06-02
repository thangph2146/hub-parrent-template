"use client"

import type { FormEventHandler, ReactNode } from "react"
import { cn } from "../../../lib/utils"
import {
  ADMIN_PAGE_GRID_CLASS,
  ADMIN_PAGE_GRID_MAIN_CLASS,
  ADMIN_PAGE_GRID_SIDEBAR_CLASS,
} from "../../../lib/layout-shell"

export type AdminFormLayoutProps = {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  className?: string
}

export function AdminFormLayout({
  id,
  onSubmit,
  children,
  className,
}: AdminFormLayoutProps) {
  return (
    <form id={id} onSubmit={onSubmit} className={cn("my-6", className)}>
      <div className={ADMIN_PAGE_GRID_CLASS}>{children}</div>
    </form>
  )
}

export function AdminFormMain({
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

export function AdminFormSidebar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(ADMIN_PAGE_GRID_SIDEBAR_CLASS, className)}>
      {children}
    </div>
  )
}
