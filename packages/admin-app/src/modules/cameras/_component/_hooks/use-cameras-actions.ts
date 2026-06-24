"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { CameraConfirmAction, CameraFormValues } from "../shared/types"
import { cameraFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"
const EMPTY: CameraFormValues = {
  name: "",
  code: "",
  linkedEventId: "",
  ipAddress: "",
  port: undefined,
  username: "",
  password: "",
  status: 1,
}
export function buildCameraPayload(v: CameraFormValues) {
  return {
    name: v.name.trim(),
    code: v.code?.trim() || null,
    linkedEventId: v.linkedEventId?.trim() || null,
    ipAddress: v.ipAddress?.trim() || null,
    port: v.port || null,
    username: v.username?.trim() || null,
    password: v.password?.trim() || null,
    status: v.status,
  }
}
export function useCameraForm() {
  const form = useForm<CameraFormValues>({
    resolver: zodResolver(cameraFormSchema),
    defaultValues: EMPTY,
  })
  return { form, resetForm: useCallback(() => form.reset(EMPTY), [form]) }
}
export function useHandleConfirmAction(
  del: { mutateAsync: (id: string) => Promise<unknown> },
  restore: { mutateAsync: (id: string) => Promise<unknown> },
  purge: { mutateAsync: (id: string) => Promise<unknown> },
  setConfirmAction: (v: CameraConfirmAction | null) => void
) {
  return useCallback(
    async ({ kind, row }: CameraConfirmAction) => {
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
  const [a, s] = useState<CameraConfirmAction | null>(null)
  return { confirmAction: a, setConfirmAction: s }
}
