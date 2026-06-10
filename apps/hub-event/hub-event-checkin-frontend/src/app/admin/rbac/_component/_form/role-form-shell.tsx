"use client"

import { useMemo, useState } from "react"
import {
  CheckCheck,
  CheckCircle2,
  Eraser,
  KeyRound,
  Lock,
  ShieldHalf,
  Shield,
} from "lucide-react"
import { Checkbox } from "@ui/components/checkbox"
import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { FormFieldCol } from "@ui/components/typing"
import { Input } from "@ui/components/input"
import { Switch } from "@ui/components/switch"
import { ScrollArea } from "@ui/components/scroll-area"
import { Button } from "@ui/components/button"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller, useWatch } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import type { RbacPermission } from "@workspace/api-client"
import type { RoleFormValues } from "../_hooks/use-role-form"
import {
  permissionGroupKey,
  permissionGroupLabelVi,
  permissionLabelVi,
} from "@/lib/admin/permission-labels"

export interface RoleFormShellProps {
  isEdit: boolean
  form: UseFormReturn<RoleFormValues>
  permissions: RbacPermission[]
  onSubmit: () => Promise<void> | void
  onCancel: () => void
  submitting: boolean
}

export function RoleFormShell(props: RoleFormShellProps) {
  const { isEdit, form, permissions, onSubmit, onCancel, submitting } = props

  const [permissionSearch, setPermissionSearch] = useState("")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  const watchedPermissionsRaw = useWatch({
    control: form.control,
    name: "permissions",
  })
  const watchedPermissions = useMemo(
    () => watchedPermissionsRaw ?? [],
    [watchedPermissionsRaw]
  )

  const visiblePermissions = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase()
    let filtered = permissions
    if (showSelectedOnly) {
      const selected = new Set(watchedPermissions)
      filtered = filtered.filter((p) => selected.has(p.code))
    }
    if (q) {
      filtered = filtered.filter((p) =>
        [p.code, permissionLabelVi(p.code), p.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    }
    return filtered
  }, [permissionSearch, permissions, showSelectedOnly, watchedPermissions])

  const permissionGroups = useMemo(() => {
    const buckets = new Map<string, RbacPermission[]>()
    for (const perm of visiblePermissions) {
      const key = permissionGroupKey(perm.code)
      const arr = buckets.get(key)
      if (arr) arr.push(perm)
      else buckets.set(key, [perm])
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
    <>
      <AdminFormPageHeader
        title={isEdit ? "Sửa vai trò" : "Thêm vai trò mới"}
        subtitle="Thiết lập thông tin vai trò và chọn quyền hạn phù hợp."
        onBack={onCancel}
        formId="role-form"
        isEdit={isEdit}
        submitting={submitting}
        saveLabel={isEdit ? "Lưu thay đổi" : "Tạo vai trò"}
      />

      <AdminFormLayout
        id="role-form"
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit()
        }}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Shield}
              title="Thông tin vai trò"
              description="Mã vai trò, tên hiển thị và mô tả."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Mã vai trò" required>
                      <Input
                        id={isEdit ? "e-code" : "c-code"}
                        placeholder="content_editor"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={isEdit}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Tên hiển thị" required>
                      <Input
                        id={isEdit ? "e-name" : "c-name"}
                        placeholder="Biên tập nội dung"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </FormFieldCol>
                  )}
                />
              </div>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormFieldCol label="Mô tả">
                    <textarea
                      id="role-description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Mô tả rõ vai trò này phục vụ bộ phận nào..."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={KeyRound}
              title="Quyền hạn"
              description={
                isEdit
                  ? "Chọn quyền hạn cho vai trò (thay thế toàn bộ khi lưu)."
                  : "Chọn quyền hạn cho vai trò mới."
              }
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="permissions"
                control={form.control}
                render={({ field: { value, onChange } }) => {
                  const selectedSet = new Set(value)
                  const visibleCodes = visiblePermissions.map((p) => p.code)
                  const allVisibleSelected =
                    visibleCodes.length > 0 &&
                    visibleCodes.every((c) => selectedSet.has(c))

                  const toggleAllVisible = () => {
                    if (allVisibleSelected) {
                      onChange(value.filter((c) => !visibleCodes.includes(c)))
                    } else {
                      onChange([...new Set([...value, ...visibleCodes])])
                    }
                  }

                  return (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Đã chọn {watchedPermissions.length}/{permissions.length}
                        {permissionSearch &&
                          visiblePermissions.length !== permissions.length && (
                            <span className="ml-1 text-muted-foreground/70">
                              · {visiblePermissions.length} khớp
                            </span>
                          )}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          type="button"
                          variant={
                            allVisibleSelected ? "destructive" : "outline"
                          }
                          disabled={visiblePermissions.length === 0}
                          onClick={toggleAllVisible}
                          title={
                            allVisibleSelected
                              ? `Bỏ chọn tất cả`
                              : `Chọn tất cả`
                          }
                        >
                          {allVisibleSelected ? <Eraser /> : <CheckCheck />}
                          {allVisibleSelected
                            ? "Bỏ chọn tất cả"
                            : "Chọn tất cả"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowSelectedOnly((prev) => !prev)}
                          title={
                            showSelectedOnly ? "Hiện tất cả" : "Chỉ đã chọn"
                          }
                        >
                          {showSelectedOnly ? "Hiện tất cả" : "Chỉ đã chọn"}
                        </Button>
                      </div>
                    </div>
                  )
                }}
              />
              <Controller
                name="permissions"
                control={form.control}
                render={({ field: { value, onChange } }) => (
                  <div className="space-y-2">
                    <Input
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Tìm quyền..."
                      className="h-9"
                    />
                    <ScrollArea className="h-[calc(100vh-520px)] rounded-lg border border-border/60 bg-muted/10">
                      <div className="space-y-3 p-3">
                        {permissionGroups.length === 0 ? (
                          <p className="py-8 text-center text-sm text-muted-foreground">
                            Không có quyền khớp tìm kiếm.
                          </p>
                        ) : (
                          permissionGroups.map((group) => {
                            const selectedInGroup = group.items.filter((p) =>
                              value.includes(p.code)
                            ).length
                            return (
                              <section
                                key={group.key}
                                className="overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm"
                              >
                                <header className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-3 py-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Checkbox
                                      checked={
                                        selectedInGroup ===
                                          group.items.length &&
                                        group.items.length > 0
                                      }
                                      onCheckedChange={(checked) => {
                                        const codes = group.items.map(
                                          (p) => p.code
                                        )
                                        onChange(
                                          checked === true
                                            ? [...new Set([...value, ...codes])]
                                            : value.filter(
                                                (c) => !codes.includes(c)
                                              )
                                        )
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
                                  <span className="rounded-md border border-border/60 bg-background/90 px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                                    {selectedInGroup}/{group.items.length}
                                  </span>
                                </header>
                                <div className="grid gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {group.items.map((perm) => {
                                    const isSelected = value.includes(perm.code)
                                    return (
                                      <label
                                        key={perm.code}
                                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors ${
                                          isSelected
                                            ? "border-primary/40 bg-primary/5"
                                            : "border-border/60 bg-background/90 hover:border-border hover:bg-muted/30"
                                        }`}
                                      >
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            onChange(
                                              checked === true
                                                ? [
                                                    ...new Set([
                                                      ...value,
                                                      perm.code,
                                                    ]),
                                                  ]
                                                : value.filter(
                                                    (c) => c !== perm.code
                                                  )
                                            )
                                          }}
                                        />
                                        <span className="min-w-0 leading-tight">
                                          <span className="block text-sm font-medium">
                                            {permissionLabelVi(perm.code)}
                                          </span>
                                          <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                            {perm.code}
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
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={isEdit ? CheckCircle2 : Lock}
              title={isEdit ? "Trạng thái" : "Kích hoạt"}
              description={
                isEdit
                  ? "Tắt để vô hiệu hoá vai trò này."
                  : "Tắt để tạo vai trò ở trạng thái không hoạt động."
              }
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {field.value ? "Đang hoạt động" : "Đã khoá"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {field.value
                          ? "Vai trò có thể được gán cho người dùng"
                          : "Vai trò không thể được gán"}
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={ShieldHalf}
              title="Tổng quan quyền"
              description={`${watchedPermissions.length} quyền được chọn.`}
            />
            <FieldSetContent variant="section" className="pt-0">
              <ScrollArea className="h-[calc(100vh-520px)] rounded-lg border border-border/60 bg-muted/10">
                <div className="space-y-2 p-4">
                  {watchedPermissions.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Chưa có quyền nào được chọn.
                    </p>
                  ) : (
                    permissionGroups
                      .filter((group) =>
                        group.items.some((p) =>
                          watchedPermissions.includes(p.code)
                        )
                      )
                      .map((group) => {
                        const selectedInGroup = group.items.filter((p) =>
                          watchedPermissions.includes(p.code)
                        ).length
                        return (
                          <div
                            key={group.key}
                            className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground">
                                {group.label}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground uppercase">
                                {group.key}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
                              {selectedInGroup}
                            </span>
                          </div>
                        )
                      })
                  )}
                </div>
              </ScrollArea>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
