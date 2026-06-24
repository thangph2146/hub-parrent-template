"use client"

import { useEffect, useState } from "react"
import { Loader2, ScanFace } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import {
  getHanetFaceActionMeta,
  type HanetFaceActionId,
} from "../shared/hanet-face-actions"
import type { HanetPersonRow } from "./hanet-persons-table"

const DEVICE_STORAGE_KEY = "hanet-admin-last-device-id"

function readLastDeviceId(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(DEVICE_STORAGE_KEY)?.trim() ?? ""
  } catch {
    return ""
  }
}

function writeLastDeviceId(deviceId: string) {
  try {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, deviceId.trim())
  } catch {
    // ignore
  }
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function resolveAvatarUrl(person: HanetPersonRow | null): string {
  const avatar = String(person?.avatar ?? "").trim()
  if (!avatar || avatar.startsWith("hanet:person:")) return ""
  return avatar
}

export function HanetFaceActionDialog({
  open,
  actionId,
  placeId,
  person,
  onClose,
  onSuccess,
}: {
  open: boolean
  actionId: HanetFaceActionId | null
  placeId: string
  person: HanetPersonRow | null
  onClose: () => void
  onSuccess?: () => void
}) {
  const api = useAdminApi()
  const meta = actionId ? getHanetFaceActionMeta(actionId) : null
  const [url, setUrl] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open || !actionId) return
    setUrl(resolveAvatarUrl(person))
    setDeviceId(readLastDeviceId())
    setFile(null)
  }, [open, actionId, person])

  const mutation = useAdminMutation({
    mutationKey: ["hanet", "face", actionId, person?.personId],
    mutationFn: async () => {
      if (!actionId || !placeId.trim()) {
        throw new Error("Thiếu placeID")
      }
      const pid = person?.personId?.trim() ?? ""
      const alias = person?.aliasId?.trim() ?? ""

      switch (actionId) {
        case "update-by-url":
          if (!pid) throw new Error("Thiếu personID")
          return api.hanet.updatePersonFaceByUrl({
            placeId,
            personId: pid,
            url,
          })
        case "update-by-url-alias":
          if (!alias) throw new Error("Thiếu aliasID")
          return api.hanet.updatePersonFaceByUrlAlias({
            placeId,
            aliasId: alias,
            url,
          })
        case "update-by-url-person-id":
          if (!pid) throw new Error("Thiếu personID")
          return api.hanet.updatePersonFaceByUrlPersonId({
            placeId,
            personId: pid,
            url,
          })
        case "update-by-image": {
          if (!pid) throw new Error("Thiếu personID")
          if (!file) throw new Error("Chọn file ảnh JPEG/PNG")
          return api.hanet.updatePersonFaceByImage({
            placeId,
            personId: pid,
            fileBase64: await readFileAsBase64(file),
          })
        }
        case "update-by-image-alias": {
          if (!alias) throw new Error("Thiếu aliasID")
          if (!file) throw new Error("Chọn file ảnh JPEG/PNG")
          return api.hanet.updatePersonFaceByImageAlias({
            placeId,
            aliasId: alias,
            fileBase64: await readFileAsBase64(file),
          })
        }
        case "update-by-image-person-id": {
          if (!pid) throw new Error("Thiếu personID")
          if (!file) throw new Error("Chọn file ảnh JPEG/PNG")
          return api.hanet.updatePersonFaceByImagePersonId({
            placeId,
            personId: pid,
            fileBase64: await readFileAsBase64(file),
          })
        }
        case "take-picture": {
          const resolvedDevice = deviceId.trim()
          if (!resolvedDevice) throw new Error("Thiếu deviceID")
          writeLastDeviceId(resolvedDevice)
          return api.hanet.takePersonFacePicture({
            placeId,
            deviceId: resolvedDevice,
            ...(pid ? { personId: pid } : {}),
            ...(alias ? { aliasId: alias } : {}),
          })
        }
        default:
          throw new Error("API face không hỗ trợ")
      }
    },
    toast: {
      loading: meta ? `Đang gọi ${meta.label}…` : "Đang gọi HANET…",
      success: meta ? `Đã gọi ${meta.label} thành công` : "Thành công",
      error: (err) =>
        err instanceof Error ? err.message : "Gọi API face HANET thất bại",
    },
    onSuccess: () => {
      onSuccess?.()
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="size-5 text-primary" />
            Face API HANET
          </DialogTitle>
          <DialogDescription>
            {person?.displayName || person?.personId || "Person"} · placeID{" "}
            <code className="text-xs">{placeId || "—"}</code>
          </DialogDescription>
        </DialogHeader>

        {meta ? (
          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <p>
                Partner:{" "}
                <code className="text-foreground">{meta.partnerPath}</code>
              </p>
              <p className="mt-1">
                Hub: <code className="text-foreground">{meta.hubPath}</code>
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs">personID</Label>
              <Input value={person?.personId ?? ""} readOnly className="h-9" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">aliasID</Label>
              <Input value={person?.aliasId ?? ""} readOnly className="h-9" />
            </div>

            {meta.needsUrl ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-face-url" className="text-xs">
                  URL ảnh (JPG/PNG public)
                </Label>
                <Input
                  id="hanet-face-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://… hoặc /api/uploads/…"
                  className="h-9"
                />
              </div>
            ) : null}

            {meta.needsFile ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-face-file" className="text-xs">
                  Ảnh khuôn mặt (JPEG/PNG)
                </Label>
                <Input
                  id="hanet-face-file"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  className="h-9 py-1"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : null}

            {meta.needsDeviceId ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-face-device" className="text-xs">
                  deviceID (camera HANET)
                </Label>
                <Input
                  id="hanet-face-device"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="F2231FV0420"
                  className="h-9 font-mono text-xs"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={!meta || !placeId || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Gọi API
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
