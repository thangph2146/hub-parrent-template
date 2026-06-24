"use client"

import { useEffect, useMemo, useState } from "react"
import { FolderOpen, Loader2, Users } from "lucide-react"
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
import { Textarea } from "@ui/components/textarea"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import {
  createHanetUserSearchHandlers,
  fetchLocalAvatarAsFile,
  isNumericUserId,
  pickHanetAliasId,
} from "../shared/hanet-user-pick"
import { StorageImagePickerDialog } from "@workspace/admin-app/lib/storage-image-picker-dialog"
import {
  getHanetPersonActionMeta,
  type HanetPersonActionId,
} from "../shared/hanet-person-api-actions"
import type { HanetPersonRow } from "./hanet-persons-table"

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function parseAliasIds(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseExtraFields(raw: string): Record<string, string> {
  const trimmed = raw.trim()
  if (!trimmed) return {}
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (value == null) continue
      out[key] = String(value)
    }
    return out
  } catch {
    return {}
  }
}

export function HanetPersonActionDialog({
  open,
  actionId,
  placeId,
  person,
  onClose,
  onSuccess,
}: {
  open: boolean
  actionId: HanetPersonActionId | null
  placeId: string
  person: HanetPersonRow | null
  onClose: () => void
  onSuccess?: () => void
}) {
  const api = useAdminApi()
  const meta = actionId ? getHanetPersonActionMeta(actionId) : null
  const [personId, setPersonId] = useState("")
  const [aliasId, setAliasId] = useState("")
  const [name, setName] = useState("")
  const [aliasIdsText, setAliasIdsText] = useState("")
  const [extraJson, setExtraJson] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>()
  const [loadingUser, setLoadingUser] = useState(false)
  const [avatarSkippedHint, setAvatarSkippedHint] = useState<string | null>(
    null,
  )
  const [storagePickerOpen, setStoragePickerOpen] = useState(false)

  const userSearchHandlers = useMemo(() => createHanetUserSearchHandlers(api), [api])

  useEffect(() => {
    if (!open || !actionId) return
    setPersonId(person?.personId ?? "")
    setAliasId(person?.aliasId ?? "")
    setName(person?.displayName ?? "")
    setAliasIdsText(person?.aliasId ?? "")
    setExtraJson("")
    setFile(null)
    setSelectedUserId(undefined)
    setLoadingUser(false)
    setAvatarSkippedHint(null)
    setStoragePickerOpen(false)
  }, [open, actionId, person])

  useEffect(() => {
    if (actionId !== "register" || !isNumericUserId(selectedUserId)) return
    let cancelled = false
    setLoadingUser(true)
    void api.users
      .get(selectedUserId)
      .then(async (user) => {
        if (cancelled) return
        setName(user.fullName?.trim() || "")
        setAliasId(pickHanetAliasId(user))
        const rawAvatar = user.avatar?.trim() ?? ""
        const avatarFile = rawAvatar
          ? await fetchLocalAvatarAsFile(rawAvatar)
          : null
        if (avatarFile) {
          setFile(avatarFile)
          setAvatarSkippedHint(null)
        } else if (rawAvatar) {
          setFile(null)
          setAvatarSkippedHint(
            "Avatar user không tải được (Google/WebP/URL ngoài) — chọn file hoặc bấm Kho.",
          )
        } else {
          setFile(null)
          setAvatarSkippedHint(
            "User chưa có avatar — chọn file JPEG/PNG hoặc bấm Kho.",
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
  }, [actionId, selectedUserId, api])

  const mutation = useAdminMutation({
    mutationKey: ["hanet", "person-action", actionId, person?.personId],
    mutationFn: async () => {
      if (!actionId) throw new Error("Thiếu thao tác")
      const pid = personId.trim()
      const alias = aliasId.trim()
      const extra = parseExtraFields(extraJson)
      const body = {
        placeId,
        ...extra,
        ...(pid ? { personId: pid } : {}),
        ...(alias ? { aliasId: alias } : {}),
        ...(name.trim() ? { name: name.trim() } : {}),
      }

      switch (actionId) {
        case "register": {
          if (!name.trim()) throw new Error("Thiếu tên")
          if (!alias) throw new Error("Thiếu aliasID")
          if (!file) {
            throw new Error(
              "Chọn file ảnh JPEG/PNG — HANET register yêu cầu multipart file",
            )
          }
          return api.hanet.registerPerson({
            placeId,
            name: name.trim(),
            aliasId: alias,
            fileBase64: await readFileAsBase64(file),
            personType:
              extra.personType != null ? Number(extra.personType) : 1,
          })
        }
        case "update":
          return api.hanet.updatePerson(body)
        case "update-info":
          return api.hanet.updatePersonInfo(body)
        case "update-alias-id":
          return api.hanet.updatePersonAliasId(body)
        case "remove":
          return api.hanet.removePerson({ personId: pid })
        case "remove-by-place":
          return api.hanet.removePersonByPlace({ placeId, aliasId: alias })
        case "remove-by-id":
          return api.hanet.removePersonById({ personId: pid })
        case "remove-by-alias-ids": {
          const aliasIds = parseAliasIds(aliasIdsText)
          if (!aliasIds.length) throw new Error("Nhập ít nhất một aliasID")
          return api.hanet.removePersonsByAliasIds({ placeId, aliasIds })
        }
        case "remove-all-in-place":
          return api.hanet.removeAllPersonsInPlace(placeId)
        default:
          throw new Error("Thao tác không hỗ trợ trong dialog")
      }
    },
    toast: {
      loading: meta ? `Đang gọi ${meta.label}…` : "Đang gọi HANET…",
      success: meta ? `Đã gọi ${meta.label} thành công` : "Thành công",
      error: (err) =>
        err instanceof Error ? err.message : "Gọi API person HANET thất bại",
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
            <Users className="size-5 text-primary" />
            Person API HANET
          </DialogTitle>
          <DialogDescription>
            {meta?.label ?? "—"} · placeID{" "}
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
                Hub:{" "}
                <code className="text-foreground">
                  {meta.hubMethod} {meta.hubPath}
                </code>
              </p>
            </div>

            {actionId === "register" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-reg-user">Người dùng</Label>
                <DataTableUserSearchFilter
                  controlId="hanet-person-reg-user"
                  value={selectedUserId ?? ""}
                  onChange={setSelectedUserId}
                  placeholder="Tìm tên, email hoặc ID…"
                  handlers={userSearchHandlers}
                />
                <p className="text-xs text-muted-foreground">
                  Chọn user để điền <strong>Tên</strong>,{" "}
                  <strong>aliasID</strong> và ảnh từ avatar (nếu lưu trên
                  server).
                </p>
                {loadingUser ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Đang tải thông tin user…
                  </p>
                ) : null}
                {avatarSkippedHint ? (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {avatarSkippedHint}
                  </p>
                ) : null}
              </div>
            ) : null}

            {meta.needsPersonId ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-id">personID</Label>
                <Input
                  id="hanet-person-id"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>
            ) : null}

            {meta.needsAliasId ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-alias">aliasID</Label>
                <Input
                  id="hanet-person-alias"
                  value={aliasId}
                  onChange={(e) => setAliasId(e.target.value)}
                  className="h-9"
                />
              </div>
            ) : null}

            {meta.needsName ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-name">Tên</Label>
                <Input
                  id="hanet-person-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                />
              </div>
            ) : null}

            {meta.needsFile ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-file">
                  Ảnh khuôn mặt (JPEG/PNG) — bắt buộc
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hanet-person-file"
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    className="h-9 min-w-0 flex-1 py-1"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] ?? null)
                      setAvatarSkippedHint(null)
                    }}
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
                  HANET <code>/person/register</code> yêu cầu upload file. Hoặc
                  dùng <strong>registerByUrl</strong> nếu chỉ có URL public.
                </p>
              </div>
            ) : null}

            {meta.needsAliasIds ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-alias-ids">
                  aliasIDs (mỗi dòng hoặc dấu phẩy)
                </Label>
                <Textarea
                  id="hanet-person-alias-ids"
                  value={aliasIdsText}
                  onChange={(e) => setAliasIdsText(e.target.value)}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            ) : null}

            {meta.kind === "write" &&
            actionId !== "register" &&
            actionId !== "remove-by-alias-ids" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="hanet-person-extra">
                  Field bổ sung (JSON, tùy chọn)
                </Label>
                <Textarea
                  id="hanet-person-extra"
                  value={extraJson}
                  onChange={(e) => setExtraJson(e.target.value)}
                  placeholder='{"personType":1,"name":"Tên mới"}'
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>
            ) : null}

            {meta.dangerous ? (
              <p className="text-xs text-destructive">
                Thao tác xóa trên HANET — không hoàn tác.
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant={meta?.dangerous ? "destructive" : "default"}
            disabled={
              !meta ||
              !placeId ||
              mutation.isPending ||
              loadingUser ||
              (meta.needsFile && !file) ||
              (meta.needsName && !name.trim()) ||
              (meta.needsAliasId && !aliasId.trim())
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {meta?.dangerous ? "Xóa trên HANET" : "Gọi API"}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <StorageImagePickerDialog
        open={storagePickerOpen}
        multiSelect={false}
        title="Chọn ảnh khuôn mặt (JPG/PNG)"
        onOpenChange={setStoragePickerOpen}
        onSelect={async (urls) => {
          const next = urls[0]?.trim()
          if (next) {
            const picked = await fetchLocalAvatarAsFile(next)
            if (picked) {
              setFile(picked)
              setAvatarSkippedHint(null)
            }
          }
          setStoragePickerOpen(false)
        }}
      />
    </>
  )
}
