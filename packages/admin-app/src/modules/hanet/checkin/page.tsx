"use client"

import { useState } from "react"
import { CalendarCheck, Loader2 } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { useQuery } from "@tanstack/react-query"
import { api } from "@workspace/admin-app/lib/api"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { HANET_PARTNER_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetJsonPreview } from "../_component/hanet-json-preview"
import { HanetModuleShell } from "../_component/hanet-module-shell"

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function CheckinContent() {
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [date, setDate] = useState(todayIsoDate())
  const [enabled, setEnabled] = useState(false)

  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

  const checkinQuery = useQuery({
    queryKey: ["hanet", "checkins", effectivePlaceId, date],
    queryFn: () =>
      api.hanet.getCheckinsByPlaceDay({
        placeId: effectivePlaceId || undefined,
        date,
      }),
    enabled:
      enabled && hanetStatus?.configured === true && Boolean(effectivePlaceId),
  })

  if (!hanetStatus?.configured) {
    return (
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
        Cần OAuth HANET.
      </p>
    )
  }

  const payload = checkinQuery.data as
    | { placeId?: string; date?: string; rows?: unknown; total?: unknown }
    | undefined

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Gọi song song{" "}
        <code className="text-[10px]">getCheckinByPlaceIdInDay</code> và{" "}
        <code className="text-[10px]">getTotalCheckinByPlaceIdInDay</code> (cùng
        hub endpoint).
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[min(100%,16rem)] flex-1">
          <HanetPlaceSelect
            value={selectedPlaceId}
            onChange={setSelectedPlaceId}
            defaultPlaceId={hanetStatus.defaultPlaceId}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Ngày (date)
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-44"
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!effectivePlaceId || checkinQuery.isFetching}
          onClick={() => setEnabled(true)}
        >
          {checkinQuery.isFetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Tải check-in
        </Button>
      </div>

      {checkinQuery.error ? (
        <p className="text-sm text-destructive">{checkinQuery.error.message}</p>
      ) : null}

      {payload?.total != null ? (
        <p className="text-sm">
          Tổng check-in:{" "}
          <span className="font-medium">
            {typeof payload.total === "object"
              ? JSON.stringify(payload.total)
              : String(payload.total)}
          </span>
        </p>
      ) : null}

      {payload?.rows != null ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Chi tiết theo ngày</p>
          <HanetJsonPreview data={payload.rows} />
        </div>
      ) : null}
    </div>
  )
}

export default function HanetCheckinPage() {
  return (
    <HanetModuleShell
      icon={CalendarCheck}
      title="Check-in theo ngày"
      subtitle="Đối soát lượt quét face theo place và ngày."
      endpoint={HANET_PARTNER_ENDPOINTS.checkins}
      endpointExtra="?placeId=&date="
    >
      <CheckinContent />
    </HanetModuleShell>
  )
}
