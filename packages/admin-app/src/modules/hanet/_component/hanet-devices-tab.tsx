"use client"

import { useState } from "react"
import { AlertCircle, Loader2, RefreshCw, Video } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/table"
import { useQueryClient } from "@tanstack/react-query"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet/_component/hanet-place-select"
import { useHanetPlacesQuery } from "@workspace/admin-app/modules/hanet/_component/use-hanet-places-query"
import {
  hanetDevicesQueryKey,
  useHanetDevicesQuery,
} from "./use-hanet-devices-query"

export function HanetDevicesTab() {
  const queryClient = useQueryClient()
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

  const placesQuery = useHanetPlacesQuery(hanetStatus?.configured === true)
  const devicesQuery = useHanetDevicesQuery(
    effectivePlaceId,
    hanetStatus?.configured === true
  )

  const places = placesQuery.data ?? []
  const devices = devicesQuery.data ?? []

  return (
    <div className="space-y-4">
      {!hanetStatus?.configured ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Cần cấu hình OAuth HANET trong .env API để tải địa điểm và thiết bị.
        </p>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[min(100%,16rem)] flex-1">
            <HanetPlaceSelect
              value={selectedPlaceId}
              onChange={setSelectedPlaceId}
              defaultPlaceId={hanetStatus.defaultPlaceId}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!effectivePlaceId || devicesQuery.isFetching}
            onClick={() =>
              void queryClient.invalidateQueries({
                queryKey: hanetDevicesQueryKey(effectivePlaceId),
              })
            }
          >
            {devicesQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Tải lại thiết bị
          </Button>
        </div>
      )}

      {placesQuery.isSuccess && places.length > 0 ? (
        <div className="rounded-lg border border-border/70">
          <div className="border-b border-border/70 px-4 py-2 text-sm font-medium">
            Địa điểm HANET ({places.length})
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place ID</TableHead>
                <TableHead>Tên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.placeId}>
                  <TableCell>
                    <code className="text-xs">{place.placeId}</code>
                  </TableCell>
                  <TableCell>{place.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <div className="rounded-lg border border-border/70">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-2 text-sm">
          <Video className="size-4 text-muted-foreground" />
          <span className="font-medium">
            Thiết bị (camera) HANET
            {effectivePlaceId ? (
              <>
                {" "}
                · place <code className="text-xs">{effectivePlaceId}</code>
              </>
            ) : null}
          </span>
          <span className="text-muted-foreground">({devices.length})</span>
        </div>

        {devicesQuery.error ? (
          <div className="flex items-start gap-3 p-4 text-destructive">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm">{devicesQuery.error.message}</p>
          </div>
        ) : devicesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Đang tải thiết bị…
          </div>
        ) : !effectivePlaceId ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Chọn địa điểm HANET để xem danh sách camera (deviceID).
          </p>
        ) : devices.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Tên hiển thị</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.deviceId}>
                  <TableCell>
                    <code className="text-xs">{device.deviceId}</code>
                  </TableCell>
                  <TableCell>{device.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Không có thiết bị cho place này — kiểm tra cổng HANET hoặc place khác.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Mã <code className="text-[10px]">deviceID</code> dùng khi gắn camera cho
        sự kiện và khi HANET gửi webhook check-in.
      </p>
    </div>
  )
}
