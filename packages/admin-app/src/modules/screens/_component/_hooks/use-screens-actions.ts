"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { StoreSyncSdk } from "@workspace/api-client"
import type { ScreenConfirmAction, ScreenFormValues } from "../shared/types"
import { screenFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"
const EMPTY: ScreenFormValues = {
  name: "",
  code: "",
  hanetDeviceId: "",
  cameraId: "",
  cameraName: "",
  status: 1,
}
export function buildScreenPayload(v: ScreenFormValues) {
  return {
    name: v.name.trim(),
    code: v.code?.trim() || null,
    cameraId: v.cameraId?.trim() || null,
    status: v.status,
  }
}

/** Đồng bộ camera Hub từ device HANET đã chọn trước khi lưu màn hình. */
export async function buildScreenSubmitPayload(
  api: StoreSyncSdk,
  v: ScreenFormValues
) {
  const base = buildScreenPayload(v)
  const deviceId = v.hanetDeviceId?.trim()
  if (!deviceId) return base

  const camera = await api.hanet.ensureCamera({
    deviceId,
    name: v.cameraName?.trim() || undefined,
  })

  return {
    ...base,
    cameraId: String(camera.id),
  }
}
export function useScreenForm() {
  const form = useForm<ScreenFormValues>({
    resolver: zodResolver(screenFormSchema),
    defaultValues: EMPTY,
  })
  return { form, resetForm: useCallback(() => form.reset(EMPTY), [form]) }
}
export function useHandleConfirmAction(
  del: { mutateAsync: (id: string) => Promise<unknown> },
  restore: { mutateAsync: (id: string) => Promise<unknown> },
  purge: { mutateAsync: (id: string) => Promise<unknown> },
  setConfirmAction: (v: ScreenConfirmAction | null) => void
) {
  return useCallback(
    async ({ kind, row }: ScreenConfirmAction) => {
      try {
        if (kind === "delete") {
          await del.mutateAsync(row.id)
        } else if (kind === "restore") {
          await restore.mutateAsync(row.id)
        } else {
          await purge.mutateAsync(row.id)
        }
      } catch {
        /* toast: MutationCache */
      } finally {
        setConfirmAction(null)
      }
    },
    [del, restore, purge, setConfirmAction]
  )
}
export function useConfirmAction() {
  const [a, s] = useState<ScreenConfirmAction | null>(null)
  return { confirmAction: a, setConfirmAction: s }
}
