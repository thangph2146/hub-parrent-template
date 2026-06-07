"use client"

import { Loader2 } from "lucide-react"
import { Skeleton } from "../../skeleton"
import { cn } from "../../../lib/utils"

export type AdminAuthLoadingScreenProps = {
  message?: string
  siteName?: string
  className?: string
}

/** Màn hình chờ phiên / chuyển hướng auth — dùng trong AdminShell. */
export function AdminAuthLoadingScreen({
  message = "Đang tải…",
  siteName,
  className,
}: AdminAuthLoadingScreenProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-muted/15 to-background px-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-muted/80"
        aria-hidden
      >
        <div className="h-full w-2/5 animate-[admin-loader-bar_1.1s_ease-in-out_infinite] rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-border/50 bg-card/90 p-8 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
        <div className="relative flex size-14 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 shadow-inner">
          <Loader2
            className="size-7 animate-spin text-primary"
            aria-hidden
          />
        </div>

        {siteName ? (
          <p className="text-center text-lg font-semibold tracking-tight text-foreground">
            {siteName}
          </p>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">{message}</p>

        <div className="flex w-full flex-col gap-2.5 pt-1">
          <Skeleton shimmer className="h-2.5 w-full rounded-full" />
          <Skeleton shimmer className="mx-auto h-2.5 w-4/5 rounded-full" />
        </div>
      </div>

      <span className="sr-only">{message}</span>
    </div>
  )
}
