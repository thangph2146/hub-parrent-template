"use client"

import type { ComponentProps } from "react"
import { cn } from "../../lib/utils"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_LIST_WRAP_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "../../lib/layout-shell"
import { TabsList, TabsTrigger } from "../tabs"

export type AdminListTabsListProps = ComponentProps<typeof TabsList> & {
  /** Cho phép tab xuống dòng (realm file-storage, dialog nhiều cột). */
  wrap?: boolean
  /** `w-full` trên thanh tab. */
  fullWidth?: boolean
}

export function AdminListTabsList({
  className,
  wrap = false,
  fullWidth = false,
  ...props
}: AdminListTabsListProps) {
  return (
    <TabsList
      className={cn(
        wrap ? ADMIN_LIST_TABS_LIST_WRAP_CLASS : ADMIN_LIST_TABS_LIST_CLASS,
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  )
}

export type AdminListTabsTriggerProps = ComponentProps<typeof TabsTrigger> & {
  /** Chia đều chiều ngang trong thanh full-width. */
  stretch?: boolean
}

export function AdminListTabsTrigger({
  className,
  stretch = false,
  ...props
}: AdminListTabsTriggerProps) {
  return (
    <TabsTrigger
      className={cn(
        ADMIN_LIST_TABS_TRIGGER_CLASS,
        stretch && "min-w-0 flex-1",
        className
      )}
      {...props}
    />
  )
}
