"use client"

import { useState } from "react"
import { Loader2, UserPlus } from "lucide-react"
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
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { api } from "@workspace/admin-app/lib/api"

export function HanetRegisterFaceDialog({
  open,
  placeId,
  onClose,
  onSuccess,
}: {
  open: boolean
  placeId: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const [name, setName] = useState("")
  const [aliasId, setAliasId] = useState("")
  const [url, setUrl] = useState("")

  const mutation = useAdminMutation({
    mutationKey: ["hanet", "register-by-url", placeId],
    mutationFn: () => {
      if (!placeId.trim()) throw new Error("Thiếu placeID")
      return api.hanet.registerPersonByUrl({
        placeId,
        name: name.trim(),
        aliasId: aliasId.trim(),
        url: url.trim(),
        personType: 1,
      })
    },
    toast: {
      loading: "Đang gọi registerByUrl…",
      success: "Đã đăng ký khuôn mặt trên HANET",
      error: (err) =>
        err instanceof Error ? err.message : "registerByUrl thất bại",
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
            <UserPlus className="size-5 text-primary" />
            Đăng ký khuôn mặt (registerByUrl)
          </DialogTitle>
          <DialogDescription>
            Hub{" "}
            <code className="text-xs">POST /admin/hanet/person/register-by-url</code>{" "}
            · placeID <code className="text-xs">{placeId || "—"}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="hanet-reg-name">Tên</Label>
            <Input
              id="hanet-reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="hanet-reg-alias">aliasID (email / mã)</Label>
            <Input
              id="hanet-reg-alias"
              value={aliasId}
              onChange={(e) => setAliasId(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="hanet-reg-url">URL ảnh JPG/PNG</Label>
            <Input
              id="hanet-reg-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://… hoặc /api/uploads/…"
              className="h-9"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={
              !placeId ||
              !name.trim() ||
              !aliasId.trim() ||
              !url.trim() ||
              mutation.isPending
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Đăng ký
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
