import { api } from "@workspace/admin-app/lib/api"
import type { EventFormValues } from "@workspace/admin-app/modules/events/_component/types"
import { buildEventPayload } from "@workspace/admin-app/modules/events/_component/_hooks/use-events-actions"

async function resolveCameraId(
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
  values: EventFormValues,
  deviceNames?: {
    checkin?: string
    checkout?: string
  }
): Promise<Record<string, unknown>> {
  const [checkinCameraId, checkoutCameraId] = await Promise.all([
    resolveCameraId(values.checkinHanetDeviceId, deviceNames?.checkin),
    resolveCameraId(values.checkoutHanetDeviceId, deviceNames?.checkout),
  ])

  return {
    ...buildEventPayload(values),
    checkinCameraId,
    checkoutCameraId,
  }
}
