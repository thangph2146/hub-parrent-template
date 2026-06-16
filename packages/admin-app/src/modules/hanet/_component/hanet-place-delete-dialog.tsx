"use client"

import { Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/components/alert-dialog"
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
      onClose()
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-2 sm:justify-start">
            <Trash2 className="size-5 text-destructive" aria-hidden />
            Xóa địa điểm?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Xóa vĩnh viễn{" "}
            <strong>{place?.name || place?.placeId}</strong> (
            <code className="text-xs">{place?.placeId}</code>) trên HANET và gỡ
            khỏi app partner. Thao tác không hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
