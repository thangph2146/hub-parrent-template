"use client"

import { useEffect, useState } from "react"
import { Loader2, Users } from "lucide-react"
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
import { Textarea } from "@ui/components/textarea"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { api } from "@workspace/admin-app/lib/api"
import {
  getHanetPersonActionMeta,
  type HanetPersonActionId,
} from "@workspace/admin-app/lib/hanet-person-api-actions"
import type { HanetPersonRow } from "./hanet-persons-table"

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
  const meta = actionId ? getHanetPersonActionMeta(actionId) : null
  const [personId, setPersonId] = useState("")
  const [aliasId, setAliasId] = useState("")
  const [name, setName] = useState("")
  const [aliasIdsText, setAliasIdsText] = useState("")
  const [extraJson, setExtraJson] = useState("")

  useEffect(() => {
    if (!open || !actionId) return
    setPersonId(person?.personId ?? "")
    setAliasId(person?.aliasId ?? "")
    setName(person?.displayName ?? "")
    setAliasIdsText(person?.aliasId ?? "")
    setExtraJson("")
  }, [open, actionId, person])

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
        case "register":
          return api.hanet.registerPerson(body)
        case "update":
          return api.hanet.updatePerson(body)
        case "update-info":
          return api.hanet.updatePersonInfo(body)
        case "update-alias-id":
          return api.hanet.updatePersonAliasId(body)
        case "remove":
          return api.hanet.removePerson({ placeId, personId: pid })
        case "remove-by-place":
          return api.hanet.removePersonByPlace({ placeId, aliasId: alias })
        case "remove-by-id":
          return api.hanet.removePersonById({ placeId, personId: pid })
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

            {meta.kind === "write" && actionId !== "register" ? (
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
            disabled={!meta || !placeId || mutation.isPending}
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
  )
}
