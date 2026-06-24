"use client"

import { useEffect, useMemo, useState } from "react"
import { FolderOpen, Loader2, UserPlus } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import {
  DataTableUserSearchFilter,
} from "@ui/components/data-table"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { StorageImagePickerDialog } from "@workspace/admin-app/lib/storage-image-picker-dialog"
import {
  hanetRegisterImageUrlError,
} from "../shared/hanet-image-url"
import {
  createHanetUserSearchHandlers,
  isNumericUserId,
  pickHanetAliasId,
  pickHanetImageUrl,
} from "../shared/hanet-user-pick"

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
  const api = useAdminApi()
  const [name, setName] = useState("")
  const [aliasId, setAliasId] = useState("")
  const [url, setUrl] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>()
  const [storagePickerOpen, setStoragePickerOpen] = useState(false)
  const [loadingUser, setLoadingUser] = useState(false)
  const [avatarSkippedHint, setAvatarSkippedHint] = useState<string | null>(null)

  const urlError = useMemo(() => hanetRegisterImageUrlError(url), [url])

  const userSearchHandlers = useMemo(() => createHanetUserSearchHandlers(api), [api])

  useEffect(() => {
    if (!open) return
    setName("")
    setAliasId("")
    setUrl("")
    setSelectedUserId(undefined)
    setStoragePickerOpen(false)
    setLoadingUser(false)
    setAvatarSkippedHint(null)
  }, [open])

  useEffect(() => {
    if (!isNumericUserId(selectedUserId)) return
    let cancelled = false
    setLoadingUser(true)
    void api.users
      .get(selectedUserId)
      .then((user) => {
        if (cancelled) return
        setName(user.fullName?.trim() || "")
        setAliasId(pickHanetAliasId(user))
        const rawAvatar = user.avatar?.trim() ?? ""
        const avatarUrl = pickHanetImageUrl(user.avatar)
        if (avatarUrl) {
          setUrl(avatarUrl)
          setAvatarSkippedHint(null)
        } else if (rawAvatar) {
          setUrl("")
          setAvatarSkippedHint(
            "Avatar user không phải JPG/PNG (vd. Google, WebP) — bấm Kho để chọn ảnh.",
          )
        } else {
          setAvatarSkippedHint(
            "User chưa có avatar — bấm Kho để chọn ảnh khuôn mặt.",
          )
        }
      })
      .catch(() => {
        if (!cancelled) return
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedUserId, api])

  const mutation = useAdminMutation({
    mutationKey: ["hanet", "register-by-url", placeId],
    mutationFn: () => {
      if (!placeId.trim()) throw new Error("Thiếu placeID")
      const imageError = hanetRegisterImageUrlError(url)
      if (imageError) throw new Error(imageError)
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
    <>
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
              <code className="text-xs">
                POST /admin/hanet/person/register-by-url
              </code>{" "}
              · placeID <code className="text-xs">{placeId || "—"}</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="hanet-reg-user">Người dùng</Label>
              <DataTableUserSearchFilter
                controlId="hanet-reg-user"
                value={selectedUserId ?? ""}
                onChange={setSelectedUserId}
                placeholder="Tìm tên, email hoặc ID…"
                handlers={userSearchHandlers}
              />
              <p className="text-xs text-muted-foreground">
                Chọn user để tự điền <strong>Tên</strong> và{" "}
                <strong>aliasID</strong>. Chỉ auto-điền URL nếu avatar có đuôi{" "}
                <code className="text-[10px]">.jpg</code> /{" "}
                <code className="text-[10px]">.png</code>.
              </p>
              {avatarSkippedHint ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {avatarSkippedHint}
                </p>
              ) : null}
              {loadingUser ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Đang tải thông tin user…
                </p>
              ) : null}
            </div>

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
              <div className="flex gap-2">
                <Input
                  id="hanet-reg-url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setAvatarSkippedHint(null)
                  }}
                  placeholder="/api/uploads/…/anh.jpg"
                  className="h-9 min-w-0 flex-1"
                  aria-invalid={url.trim() ? urlError != null : undefined}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5"
                  onClick={() => setStoragePickerOpen(true)}
                >
                  <FolderOpen className="size-3.5" />
                  Kho
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn ảnh từ <strong>File storage</strong> (khuyến nghị) — URL
                phải kết thúc bằng <code className="text-[10px]">.jpg</code>,{" "}
                <code className="text-[10px]">.jpeg</code> hoặc{" "}
                <code className="text-[10px]">.png</code>.
              </p>
              {url.trim() && urlError ? (
                <p className="text-xs text-destructive">{urlError}</p>
              ) : null}
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
                urlError != null ||
                mutation.isPending ||
                loadingUser
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

      <StorageImagePickerDialog
        open={storagePickerOpen}
        multiSelect={false}
        title="Chọn ảnh khuôn mặt (JPG/PNG)"
        onOpenChange={setStoragePickerOpen}
        onSelect={(urls) => {
          const next = urls[0]?.trim()
          if (next) setUrl(next)
          setStoragePickerOpen(false)
        }}
      />
    </>
  )
}
