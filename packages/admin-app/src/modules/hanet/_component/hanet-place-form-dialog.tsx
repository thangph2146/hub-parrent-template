"use client"

import { useEffect, useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { api } from "@workspace/admin-app/lib/api"
import {
  parseHanetPlaceDetail,
  type HanetPlaceOption,
} from "@workspace/admin-app/lib/hanet-place-parse"

const PLACE_TYPE_OPTIONS = [
  { value: "0", label: "Công ty" },
  { value: "1", label: "Gia đình" },
] as const

export function HanetPlaceFormDialog({
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
  const isEdit = Boolean(place?.placeId)
  const [placeName, setPlaceName] = useState("")
  const [address, setAddress] = useState("")
  const [placeType, setPlaceType] = useState("0")
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    if (!open) return

    if (!place) {
      setPlaceName("")
      setAddress("")
      setPlaceType("0")
      return
    }

    setPlaceName(place.name)
    setAddress("")
    setPlaceType("0")
    setLoadingDetail(true)

    void api.hanet
      .getPlaceInfo(place.placeId)
      .then((data) => {
        const detail = parseHanetPlaceDetail(data)
        if (detail.placeName) setPlaceName(detail.placeName)
        if (detail.address) setAddress(detail.address)
        if (detail.type != null) setPlaceType(String(detail.type))
      })
      .catch(() => {
        // Giữ tên từ danh sách nếu getPlaceInfo lỗi.
      })
      .finally(() => setLoadingDetail(false))
  }, [open, place])

  const mutation = useAdminMutation({
    mutationKey: ["hanet", "places", isEdit ? "update" : "create"],
    mutationFn: async () => {
      const trimmedName = placeName.trim()
      if (!trimmedName) {
        throw new Error("Nhập tên địa điểm")
      }

      const type = Number.parseInt(placeType, 10)
      const addressValue = address.trim()

      if (isEdit && place) {
        return api.hanet.updatePlace({
          placeId: place.placeId,
          placeName: trimmedName,
          ...(addressValue ? { address: addressValue } : {}),
        })
      }

      return api.hanet.createPlace({
        placeName: trimmedName,
        ...(addressValue ? { address: addressValue } : {}),
        type: Number.isFinite(type) ? type : 0,
      })
    },
    toast: {
      loading: isEdit ? "Đang cập nhật địa điểm…" : "Đang tạo địa điểm…",
      success: isEdit ? "Đã cập nhật địa điểm HANET" : "Đã tạo địa điểm HANET",
      error: (err) =>
        err instanceof Error ? err.message : "Không lưu được địa điểm",
    },
    onSuccess: () => {
      onSuccess()
      onClose()
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 shrink-0" aria-hidden />
            {isEdit ? "Sửa địa điểm" : "Thêm địa điểm"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {isEdit ? (
            <div className="space-y-1.5">
              <Label>placeID</Label>
              <Input value={place?.placeId ?? ""} readOnly disabled />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="hanet-place-name">
              Tên địa điểm <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hanet-place-name"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="VD: HUB – Cơ sở Thủ Đức"
              autoFocus={!isEdit}
              disabled={loadingDetail || mutation.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hanet-place-address">Địa chỉ</Label>
            <Input
              id="hanet-place-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tùy chọn"
              disabled={loadingDetail || mutation.isPending}
            />
          </div>

          {!isEdit ? (
            <div className="space-y-1.5">
              <Label>Loại địa điểm</Label>
              <Select
                value={placeType}
                onValueChange={(value) => setPlaceType(value ?? "0")}
                disabled={mutation.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {loadingDetail ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Đang tải chi tiết từ HANET…
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || loadingDetail}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {isEdit ? "Lưu thay đổi" : "Tạo địa điểm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
