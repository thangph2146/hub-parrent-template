"use client"
import { Badge } from "@ui/components/badge"
import { cn } from "@ui/lib/utils"
import { Radio } from "lucide-react"
import type { EventHanetSyncSocketPayload } from "./use-event-attendance-socket"

const KIND_LABELS: Record<EventHanetSyncSocketPayload["kind"], string> = {
  device: "Thiết bị",
  place: "Địa điểm",
  person: "Người",
  checkin: "Check-in",
  checkout: "Check-out",
  unknown: "Khác",
}

function formatAt(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function kindVariant(
  kind: EventHanetSyncSocketPayload["kind"],
  acknowledged: boolean
): "default" | "secondary" | "destructive" | "outline" {
  if (!acknowledged) return "destructive"
  if (kind === "checkin") return "default"
  if (kind === "checkout") return "secondary"
  return "outline"
}

export function EventHanetSyncLog({
  entries,
  connected,
}: {
  entries: EventHanetSyncSocketPayload[]
  connected: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex items-center gap-2 text-base font-semibold">
          <Radio className="size-5 text-primary" />
          Webhook HANET gần đây
        </p>
        {connected ? (
          <Badge variant="secondary" className="text-[10px]">
            Live
          </Badge>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
        {entries.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Chưa có webhook HANET trong phiên này. Đồng bộ person/device/place
            hoặc check-in từ camera sẽ hiện tại đây.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {entries.map((entry, index) => (
              <li
                key={`${entry.at}-${entry.kind}-${index}`}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm",
                  index === 0 && "bg-primary/5"
                )}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={kindVariant(entry.kind, entry.acknowledged)}
                      className="text-[10px]"
                    >
                      {KIND_LABELS[entry.kind] ?? entry.kind}
                      {entry.action ? ` · ${entry.action}` : ""}
                    </Badge>
                    {!entry.acknowledged ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Lỗi
                      </Badge>
                    ) : null}
                  </div>
                  <p className="font-medium leading-snug">{entry.summary}</p>
                  {entry.error ? (
                    <p className="text-xs text-destructive">{entry.error}</p>
                  ) : null}
                </div>
                <time
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  dateTime={entry.at}
                >
                  {formatAt(entry.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
