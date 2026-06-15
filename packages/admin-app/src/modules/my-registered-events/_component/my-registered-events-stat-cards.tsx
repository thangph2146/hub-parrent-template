"use client"

import {
  CheckCircle2,
  Clock,
  Ticket,
  UserCheck,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@ui/components/card"
import { cn } from "@ui/lib/utils"
import type { MyRegisteredEventStats } from "./types"

type StatTone = "primary" | "success" | "warning" | "secondary"

function StatCard({
  icon: Icon,
  label,
  value,
  loading = false,
  tone = "primary",
}: {
  icon: LucideIcon
  label: string
  value: number
  loading?: boolean
  tone?: StatTone
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
    warning: "bg-amber-500/10 text-amber-700 ring-amber-500/15",
    secondary: "bg-secondary/10 text-secondary ring-secondary/15",
  }[tone]

  return (
    <Card className="overflow-hidden border-primary/10 bg-background/90 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl ring-1",
            toneClass
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div
              aria-hidden
              className="mt-1 h-8 w-12 animate-pulse rounded-md bg-muted"
            />
          ) : (
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MyRegisteredEventsStatCards({
  stats,
  loading,
}: {
  stats: MyRegisteredEventStats
  loading: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Ticket}
        label="Tổng đăng ký"
        value={stats.total}
        loading={loading}
        tone="primary"
      />
      <StatCard
        icon={CheckCircle2}
        label="Còn hiệu lực"
        value={stats.active}
        loading={loading}
        tone="success"
      />
      <StatCard
        icon={Clock}
        label="Sắp diễn ra"
        value={stats.upcoming}
        loading={loading}
        tone="warning"
      />
      <StatCard
        icon={UserCheck}
        label="Đã check-in"
        value={stats.checkedIn}
        loading={loading}
        tone="secondary"
      />
    </div>
  )
}
