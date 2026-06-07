"use client"

import type { ReactNode } from "react"
import { cn } from "../../../lib/utils"

export type AdminPageTransitionProps = {
  children: ReactNode
  className?: string
}

/** Fade nhẹ khi Next.js đổi segment — dùng trong `app/template.tsx` admin. */
export function AdminPageTransition({
  children,
  className,
}: AdminPageTransitionProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 duration-200 fill-mode-both motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  )
}
