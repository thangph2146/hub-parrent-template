"use client"

import { Loader2, Pause, Play, Radio } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import type { EventHanetSyncSocketPayload } from "@workspace/api-client/realtime"

export type HanetCheckinLiveBarProps = {
  liveEnabled: boolean
  onLiveEnabledChange: (enabled: boolean) => void
  lastSyncAt: Date | null
  lastPayload: EventHanetSyncSocketPayload | null
  isFetching: boolean
}

export function HanetCheckinLiveBar({
  liveEnabled,
  onLiveEnabledChange,
  lastSyncAt,
  lastPayload,
  isFetching,
}: HanetCheckinLiveBarProps) {
  const lastSummary =
    lastPayload?.summary?.trim() ||
    (lastPayload?.kind === "checkin"
      ? "Check-in mới"
      : lastPayload?.kind === "checkout"
        ? "Check-out mới"
        : null)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={cn(
            "relative flex size-2.5 shrink-0 rounded-full",
            liveEnabled ? "bg-emerald-500" : "bg-muted-foreground/40",
          )}
        >
          {liveEnabled ? (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          ) : null}
        </span>
        <Radio className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="text-sm font-medium">Theo dõi realtime</span>
        {liveEnabled ? (
          <Badge variant="secondary" className="text-[10px]">
            Webhook + polling
          </Badge>
        ) : null}
        {isFetching ? (
          <Loader2
            className="size-3.5 shrink-0 animate-spin text-muted-foreground"
            aria-label="Đang tải lại"
          />
        ) : null}
        {liveEnabled && lastSyncAt ? (
          <span className="truncate text-xs text-muted-foreground">
            Cập nhật {lastSyncAt.toLocaleTimeString("vi-VN")}
            {lastSummary ? ` · ${lastSummary}` : ""}
          </span>
        ) : liveEnabled ? (
          <span className="text-xs text-muted-foreground">
            Chờ webhook HANET hoặc chu kỳ làm mới…
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        variant={liveEnabled ? "secondary" : "default"}
        size="sm"
        className="h-8 shrink-0 text-xs"
        onClick={() => onLiveEnabledChange(!liveEnabled)}
      >
        {liveEnabled ? (
          <>
            <Pause className="size-3.5" />
            Tạm dừng
          </>
        ) : (
          <>
            <Play className="size-3.5" />
            Bật realtime
          </>
        )}
      </Button>
    </div>
  )
}
