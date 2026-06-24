"use client"

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@ui/components/button"
import { Checkbox } from "@ui/components/checkbox"
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
import { ScrollArea } from "@ui/components/scroll-area"
import { Switch } from "@ui/components/switch"
import { Textarea } from "@ui/components/textarea"
import { TypographyPSmallMuted } from "@ui/components/typography"
import type { RbacPermission } from "@workspace/api-client"
import {
  permissionGroupKey,
  permissionGroupLabelVi,
  permissionLabelVi,
} from "../shared/permission-labels"
import { ADMIN_DIALOG_CONTENT_LG_CLASS } from "@ui/lib/layout-shell"
import {
  roleCodeify,
  type RoleFormState,
  type RolePreset,
} from "../permissions/role-presets"

type RbacCreateRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: RoleFormState
  onFormChange: Dispatch<SetStateAction<RoleFormState>>
  permissions: RbacPermission[]
  presets: RolePreset[]
  onSave: () => void | Promise<void>
  saving?: boolean
}

export function RbacCreateRoleDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  permissions,
  presets,
  onSave,
  saving = false,
}: RbacCreateRoleDialogProps) {
  const [permissionSearch, setPermissionSearch] = useState("")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  useEffect(() => {
    if (!open) return
    setPermissionSearch("")
    setShowSelectedOnly(false)
  }, [open])

  const visiblePermissions = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase()
    let filtered = permissions
    if (showSelectedOnly) {
      const selected = new Set(form.permissions)
      filtered = filtered.filter((p) => selected.has(p.code))
    }
    if (q) {
      filtered = filtered.filter((permission) =>
        [
          permission.code,
          permissionLabelVi(permission.code),
          permission.description ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    }
    return filtered
  }, [form.permissions, permissionSearch, permissions, showSelectedOnly])

  const permissionGroups = useMemo(() => {
    const buckets = new Map<string, RbacPermission[]>()
    for (const permission of visiblePermissions) {
      const key = permissionGroupKey(permission.code)
      const arr = buckets.get(key)
      if (arr) arr.push(permission)
      else buckets.set(key, [permission])
    }
    return Array.from(buckets.entries())
      .map(([key, items]) => ({
        key,
        label: permissionGroupLabelVi(key),
        items: [...items].sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [visiblePermissions])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${ADMIN_DIALOG_CONTENT_LG_CLASS} sm:max-w-7xl`}>
        <DialogHeader>
          <DialogTitle>
            {form.id ? "Cập nhật role" : "Tạo role mới"}
          </DialogTitle>
          <DialogDescription>
            Thiết lập thông tin vai trò và chọn permission phù hợp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mã vai trò</Label>
              <Input
                value={form.code}
                placeholder="content_editor"
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    code: roleCodeify(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tên hiển thị</Label>
              <Input
                value={form.name}
                placeholder="Biên tập nội dung"
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    name: event.target.value,
                    code: current.code || roleCodeify(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                placeholder="Mô tả rõ vai trò này phục vụ bộ phận nào..."
                rows={3}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Kích hoạt ngay</div>
                <TypographyPSmallMuted>
                  Nếu tắt, role tạo ra ở trạng thái không hoạt động.
                </TypographyPSmallMuted>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  onFormChange((current) => ({ ...current, isActive: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bắt đầu từ mẫu</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.code}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  title={
                    preset.permissions.length === 0
                      ? "Role này không cần permission — quyền truy cập dựa trên tên role"
                      : `Chọn ${preset.permissions.length} permission`
                  }
                  onClick={() =>
                    onFormChange((current) => ({
                      ...current,
                      code: current.code || preset.code,
                      name: current.name || preset.name,
                      description: current.description || preset.description,
                      permissions: [
                        ...new Set([...current.permissions, ...preset.permissions]),
                      ],
                    }))
                  }
                >
                  {preset.label}
                  {preset.permissions.length > 0 && (
                    <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] text-primary">
                      {preset.permissions.length}
                    </span>
                  )}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs text-muted-foreground"
                onClick={() =>
                  onFormChange((current) => ({ ...current, permissions: [] }))
                }
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="mb-0">
                Permission ({form.permissions.length}/{permissions.length})
              </Label>
              <Button
                type="button"
                variant={showSelectedOnly ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-lg text-xs"
                onClick={() => setShowSelectedOnly((prev) => !prev)}
              >
                {showSelectedOnly ? "Hiện tất cả" : "Chỉ đã chọn"}
              </Button>
            </div>
            <Input
              value={permissionSearch}
              onChange={(event) => setPermissionSearch(event.target.value)}
              placeholder="Tìm permission..."
            />
            <ScrollArea className="h-[calc(100vh-600px)] rounded-lg border border-border/60 bg-muted/10">
              <div className="space-y-3 p-3">
                {permissionGroups.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Không có permission khớp tìm kiếm.
                  </p>
                ) : (
                  permissionGroups.map((group) => {
                    const selectedInGroup = group.items.filter((p) =>
                      form.permissions.includes(p.code)
                    ).length
                    const pct =
                      group.items.length > 0
                        ? Math.round((selectedInGroup / group.items.length) * 100)
                        : 0
                    return (
                      <section
                        key={group.key}
                        className="overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm"
                        aria-labelledby={`perm-group-${group.key}`}
                      >
                        <header
                          id={`perm-group-${group.key}`}
                          className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Checkbox
                              checked={
                                selectedInGroup === group.items.length &&
                                group.items.length > 0
                              }
                              onCheckedChange={(checked) => {
                                const codes = group.items.map((p) => p.code)
                                onFormChange((current) => ({
                                  ...current,
                                  permissions:
                                    checked === true
                                      ? [...new Set([...current.permissions, ...codes])]
                                      : current.permissions.filter(
                                          (p) => !codes.includes(p)
                                        ),
                                }))
                              }}
                            />
                            <div className="min-w-0">
                              <p className="truncate font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                {group.key}
                              </p>
                              <p className="truncate text-sm font-semibold text-foreground">
                                {group.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted-foreground/20 sm:block">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="rounded-md border border-border/60 bg-background/90 px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                              {selectedInGroup}/{group.items.length}
                            </span>
                          </div>
                        </header>
                        <div className="grid gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
                          {group.items.map((permission) => {
                            const isSelected = form.permissions.includes(
                              permission.code
                            )
                            return (
                              <label
                                key={permission.code}
                                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors ${
                                  isSelected
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border/60 bg-background/90 hover:border-border hover:bg-muted/30"
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    onFormChange((current) => ({
                                      ...current,
                                      permissions:
                                        checked === true
                                          ? [
                                              ...new Set([
                                                ...current.permissions,
                                                permission.code,
                                              ]),
                                            ]
                                          : current.permissions.filter(
                                              (item) => item !== permission.code
                                            ),
                                    }))
                                  }
                                />
                                <span className="min-w-0 leading-tight">
                                  <span className="block text-sm font-medium">
                                    {permissionLabelVi(permission.code)}
                                  </span>
                                  <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                    {permission.code}
                                  </span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="mr-auto rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="rounded-lg"
            onClick={() => void onSave()}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Tạo role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
