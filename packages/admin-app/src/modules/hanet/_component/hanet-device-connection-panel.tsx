"use client"

import { CheckCircle2, Loader2, Wifi, WifiOff, XCircle } from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  FieldCopyButton,
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import { HanetJsonPreview } from "./hanet-json-preview"

export type HanetDeviceConnectionRow = {
  deviceId: string
  online: boolean
}

/** Parse `{ deviceID: true|false }` từ `getConnectionStatus`. */
export function parseHanetConnectionStatus(
  data: unknown
): HanetDeviceConnectionRow[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) return []

  return Object.entries(data as Record<string, unknown>)
    .filter(([, value]) => typeof value === "boolean")
    .map(([deviceId, online]) => ({
      deviceId,
      online: online as boolean,
    }))
}

export function ConnectionStatusBadge({ online }: { online: boolean }) {
  return (
    <Badge
      variant={online ? "success" : "destructive"}
      className="h-6 gap-1 px-2 text-[11px] font-medium"
    >
      {online ? (
        <Wifi className="size-3 shrink-0" aria-hidden />
      ) : (
        <WifiOff className="size-3 shrink-0" aria-hidden />
      )}
      {online ? "Online" : "Offline"}
    </Badge>
  )
}

function ConnectionRow({ deviceId, online }: HanetDeviceConnectionRow) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2.5",
        online
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-rose-500/30 bg-rose-500/5"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {online ? (
          <CheckCircle2
            className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        ) : (
          <XCircle
            className="size-4 shrink-0 text-rose-600 dark:text-rose-400"
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">deviceID</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-medium">{deviceId}</code>
            <FieldCopyButton text={deviceId} />
          </div>
        </div>
      </div>
      <ConnectionStatusBadge online={online} />
    </div>
  )
}

export type HanetDeviceConnectionPanelProps = {
  deviceId: string
  data: unknown
  isLoading?: boolean
}

export function HanetDeviceConnectionPanel({
  deviceId,
  data,
  isLoading = false,
}: HanetDeviceConnectionPanelProps) {
  const rows = parseHanetConnectionStatus(data)
  const hasStructuredRows = rows.length > 0

  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        title="Trạng thái kết nối"
        description="Kết quả POST /device/getConnectionStatus — thiết bị online khi camera đang kết nối HANET."
      />
      <FieldSetContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Đang kiểm tra <code className="text-xs">{deviceId}</code>…
          </div>
        ) : null}

        {!isLoading && hasStructuredRows ? (
          <div className="space-y-2">
            {rows.map((row) => (
              <ConnectionRow key={row.deviceId} {...row} />
            ))}
          </div>
        ) : null}

        {!isLoading && !hasStructuredRows && data != null ? (
          <HanetJsonPreview data={data} />
        ) : null}
      </FieldSetContent>
    </FieldSet>
  )
}
