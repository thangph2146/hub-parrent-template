import type { StoreSyncSdk } from "@workspace/api-client"
import type { EventFormValues } from "./types"
import { buildEventPayload } from "./build-event-payload"

async function resolveCameraId(
  api: StoreSyncSdk,
  deviceId: string | undefined,
  deviceName: string | undefined
): Promise<string | null> {
  const trimmed = deviceId?.trim()
  if (!trimmed) return null
  const camera = await api.hanet.ensureCamera({
    deviceId: trimmed,
    name: deviceName?.trim() || undefined,
  })
  return String(camera.id)
}

/** Chuẩn bị payload sự kiện: đồng bộ camera Hub từ device HANET đã chọn. */
export async function buildEventSubmitPayload(
  api: StoreSyncSdk,
  values: EventFormValues,
  deviceNames?: {
    checkin?: string
    checkout?: string
  }
): Promise<Record<string, unknown>> {
  const [checkinCameraId, checkoutCameraId] = await Promise.all([
    resolveCameraId(api, values.checkinHanetDeviceId, deviceNames?.checkin),
    resolveCameraId(api, values.checkoutHanetDeviceId, deviceNames?.checkout),
  ])

  return {
    ...buildEventPayload(values),
    checkinCameraId,
    checkoutCameraId,
  }
}
