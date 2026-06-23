"use client"

import { Trash2 } from "lucide-react"
import { AdminConfirmActionDialog } from "@ui/components/admin"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { api } from "@workspace/admin-app/lib/api"
import type { HanetPlaceOption } from "@workspace/admin-app/lib/hanet-place-parse"

export function HanetPlaceDeleteDialog({
  open,
  place,
  onClose,
  onSuccess,
}: {
  open: boolean
  place: HanetPlaceOption | null
  onClose: () => void
  onSuccess: () => void
}) {
  const mutation = useAdminMutation({
    mutationKey: ["hanet", "places", "remove"],
    mutationFn: async () => {
      if (!place?.placeId) throw new Error("Thiếu placeID")
      return api.hanet.removePlace(place.placeId)
    },
    toast: {
      loading: "Đang xóa địa điểm…",
      success: "Đã xóa địa điểm HANET",
      error: (err) =>
        err instanceof Error
          ? err.message
          : "Không xóa được — place có thể còn thiết bị/người (PLACE_NOT_EMPTY)",
    },
    onSuccess: () => {
      onSuccess()
    },
  })

  return (
    <AdminConfirmActionDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Xóa địa điểm?"
      icon={<Trash2 className="size-5 text-destructive" aria-hidden />}
      description={
        <>
          Xóa vĩnh viễn{" "}
          <strong>{place?.name || place?.placeId}</strong> (
          <code className="text-xs">{place?.placeId}</code>) trên HANET và gỡ
          khỏi app partner. Thao tác không hoàn tác.
        </>
      }
      confirmLabel="Xóa"
      confirmDestructive
      confirmDisabled={mutation.isPending}
      onConfirm={() => mutation.mutate()}
    />
  )
}
