"use client"

import { useCallback, useEffect, useState } from "react"
import { Camera } from "lucide-react"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { api } from "@workspace/admin-app/lib/api"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { HANET_PARTNER_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import {
  HanetDevicesTable,
  type HanetDeviceConnectionStatusMap,
} from "../_component/hanet-devices-table"
import { parseHanetConnectionStatus } from "../_component/hanet-device-connection-panel"
import { HanetModuleShell } from "../_component/hanet-module-shell"
import { useHanetDevicesQuery } from "../_component/use-hanet-devices-query"

function ThietBiContent() {
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [statusDeviceId, setStatusDeviceId] = useState<string | null>(null)
  const [connectionStatusByDeviceId, setConnectionStatusByDeviceId] =
    useState<HanetDeviceConnectionStatusMap>({})

  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

  useEffect(() => {
    setConnectionStatusByDeviceId({})
    setStatusDeviceId(null)
  }, [effectivePlaceId])

  const devicesQuery = useHanetDevicesQuery(
    effectivePlaceId,
    hanetStatus?.configured === true
  )
  const devices = devicesQuery.data ?? []

  const statusMutation = useAdminMutation({
    mutationKey: ["hanet", "device-status"],
    mutationFn: (deviceId: string) => api.hanet.getDeviceConnectionStatus(deviceId),
    toast: {
      loading: "Đang kiểm tra kết nối thiết bị…",
      success: "Đã lấy trạng thái kết nối",
      error: (err) =>
        err instanceof Error ? err.message : "Không lấy được trạng thái",
    },
    onSuccess: (data) => {
      setConnectionStatusByDeviceId((prev) => {
        const next = { ...prev }
        for (const row of parseHanetConnectionStatus(data)) {
          next[row.deviceId] = row.online
        }
        return next
      })
    },
  })

  const handleCheckConnection = useCallback(
    (deviceId: string) => {
      setStatusDeviceId(deviceId)
      statusMutation.mutate(deviceId)
    },
    [statusMutation]
  )

  if (!hanetStatus?.configured) {
    return (
      <FieldSet variant="section">
        <FieldSectionLegend
          title="Chưa cấu hình OAuth"
          description="Thiết lập client ID, secret và token trong .env API trước khi gọi device/getListDeviceByPlace."
        />
        <FieldSetContent>
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
            Cấu hình OAuth trong .env API, sau đó kiểm tra tại trang{" "}
            <strong>Kết nối</strong>.
          </p>
        </FieldSetContent>
      </FieldSet>
    )
  }

  return (
    <div className="space-y-4">
      <HanetDevicesTable
        data={devices}
        isLoading={devicesQuery.isLoading}
        emptyLabel={
          effectivePlaceId
            ? "Không có thiết bị cho địa điểm này."
            : "Chọn địa điểm HANET để tải danh sách thiết bị."
        }
        checkingDeviceId={statusDeviceId}
        isCheckingConnection={statusMutation.isPending}
        connectionStatusByDeviceId={connectionStatusByDeviceId}
        onCheckConnection={handleCheckConnection}
        filterToolbarExtra={
          <HanetPlaceSelect
            layout="stacked"
            value={selectedPlaceId}
            onChange={setSelectedPlaceId}
            defaultPlaceId={hanetStatus.defaultPlaceId}
          />
        }
      />

    </div>
  )
}

export default function HanetThietBiPage() {
  return (
    <HanetModuleShell
      icon={Camera}
      title="Thiết bị"
      subtitle="Camera AI HANET — deviceID dùng cho webhook và gắn sự kiện."
      endpoint={HANET_PARTNER_ENDPOINTS.devices}
      endpointExtra="?placeId="
      contentClassName="max-w-full"
    >
      <ThietBiContent />
    </HanetModuleShell>
  )
}
