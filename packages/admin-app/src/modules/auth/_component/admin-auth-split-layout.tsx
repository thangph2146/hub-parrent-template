"use client"

import type { ReactNode } from "react"

import { Card, CardContent } from "@ui/components/card"
import { cn } from "@ui/lib/utils"

export type AdminAuthSplitLayoutProps = {
  children: ReactNode
  visual: ReactNode
  className?: string
}

export function AdminAuthSplitLayout({
  children,
  visual,
  className,
}: AdminAuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-muted/80 via-background to-primary/[0.04] p-4 sm:p-6 lg:p-10",
        className,
      )}
    >
      <div className="w-full max-w-6xl">
        <Card className="overflow-hidden rounded-2xl border-0 p-0 shadow-xl ring-1 ring-foreground/10">
          <CardContent className="grid min-h-[min(100svh-2rem,52rem)] grid-cols-1 p-0 lg:grid-cols-2">
            <div className="flex flex-col justify-center bg-card px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
              <div className="w-full min-w-0">{children}</div>
            </div>
            {visual}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
