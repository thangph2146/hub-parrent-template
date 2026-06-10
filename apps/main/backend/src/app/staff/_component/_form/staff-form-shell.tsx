"use client"

import { useRef, useState } from "react"
import {
  Camera,
  CheckCircle2,
  Lock,
  ShieldHalf,
  UserCircle,
  KeyRound,
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
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import type { StaffFormValues } from "../_hooks/use-staff-form"
import { toast } from "@ui/components/sonner"

export interface StaffFormShellProps {
  isEdit: boolean
  form: UseFormReturn<StaffFormValues>
  roles: Array<{ code: string; name: string }>
  /** ID tài khoản nhân sự đang sửa — dùng đặt tên file ảnh đại diện. */
  subjectUserId?: string
  onSubmit: () => Promise<void> | void
  onCancel: () => void
  submitting: boolean
}

export function StaffFormShell(props: StaffFormShellProps) {
  const { isEdit, form, roles, subjectUserId, onSubmit, onCancel, submitting } =
    props

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const avatarValue = form.watch("avatar")

  const handleUploadAvatar = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const { uploadAdminImage } = await import("@/lib/admin-upload")
      const url = await uploadAdminImage(file, {
        folderPath: "avatars",
        ownerUserId: subjectUserId,
      })
      form.setValue("avatar", url, { shouldDirty: true })
      toast.success("Đã tải ảnh đại diện")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload ảnh")
    } finally {
      setUploadingAvatar(false)
    }
  }

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return (
    <>
      <AdminFormPageHeader
        title={isEdit ? "Sửa nhân sự" : "Thêm nhân sự mới"}
        subtitle="Quản lý tài khoản nhân sự trong hệ thống."
        onBack={onCancel}
        formId="staff-form"
        isEdit={isEdit}
        submitting={submitting}
        saveLabel={isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}
      />

      <AdminFormLayout
        id="staff-form"
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit()
        }}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={UserCircle}
              title="Thông tin tài khoản"
              description="Ảnh đại diện, email, họ tên, số điện thoại, địa chỉ và căn cước công dân."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex items-start gap-4 pb-4">
                <div className="relative w-55 shrink-0">
                  {avatarValue ? (
                    <img
                      src={avatarValue}
                      alt=""
                      className="aspect-[3/4] size-full rounded-lg border-2 border-border/60 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] size-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                      {initials(form.watch("fullName") || "?")}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent disabled:opacity-50"
                    title="Tải ảnh đại diện"
                  >
                    <Camera className="size-3 text-muted-foreground" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleUploadAvatar(file)
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 gap-4 space-y-4">
                  <Controller
                    name="avatar"
                    control={form.control}
                    render={({ field }) => (
                      <FormFieldCol label="URL ảnh đại diện">
                        <Input
                          id="staff-avatar-url"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </FormFieldCol>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {!isEdit && (
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <FormFieldCol label="Email đăng nhập" required>
                            <Input
                              id="c-email"
                              type="email"
                              autoComplete="off"
                              placeholder="example@hub.edu.vn"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              className={
                                fieldState.error ? "border-destructive" : ""
                              }
                            />
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </FormFieldCol>
                        )}
                      />
                    )}
                    {isEdit && (
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                          <FormFieldCol label="Email">
                            <Input
                              value={field.value}
                              disabled
                              className="bg-muted/50 font-mono text-sm"
                            />
                          </FormFieldCol>
                        )}
                      />
                    )}
                    <Controller
                      name="fullName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FormFieldCol label="Họ và tên" required>
                          <Input
                            id={isEdit ? "e-name" : "c-name"}
                            placeholder="Nguyễn Văn A"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            className={
                              fieldState.error ? "border-destructive" : ""
                            }
                          />
                          {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                          )}
                        </FormFieldCol>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      name="phone"
                      control={form.control}
                      render={({ field }) => (
                        <FormFieldCol label="Số điện thoại">
                          <Input
                            id="staff-phone"
                            placeholder="0987654321"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormFieldCol>
                      )}
                    />
                    <Controller
                      name="citizenId"
                      control={form.control}
                      render={({ field }) => (
                        <FormFieldCol label="Căn cước công dân">
                          <Input
                            id="staff-citizen-id"
                            placeholder="001302001234"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormFieldCol>
                      )}
                    />
                  </div>
                  <Controller
                    name="address"
                    control={form.control}
                    render={({ field }) => (
                      <FormFieldCol label="Địa chỉ">
                        <Input
                          id="staff-address"
                          placeholder="Số nhà, đường, phường, quận, thành phố"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormFieldCol>
                    )}
                  />
                </div>
              </div>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={KeyRound}
              title="Mật khẩu"
              description={
                isEdit
                  ? "Để trống nếu không muốn đổi mật khẩu."
                  : "Mật khẩu ban đầu cho tài khoản mới."
              }
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormFieldCol
                    label={
                      isEdit ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu ban đầu"
                    }
                    required={!isEdit}
                  >
                    <Input
                      id={isEdit ? "e-pw" : "c-pw"}
                      type="password"
                      autoComplete="new-password"
                      placeholder={
                        isEdit ? "Để trống = không đổi" : "Tối thiểu 6 ký tự"
                      }
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className={fieldState.error ? "border-destructive" : ""}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isEdit
                        ? "Để trống nếu không muốn đổi mật khẩu"
                        : "Mật khẩu phải có tối thiểu 6 ký tự"}
                    </p>
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={isEdit ? CheckCircle2 : Lock}
              title={isEdit ? "Trạng thái tài khoản" : "Kích hoạt"}
              description={
                isEdit
                  ? "Khoá sẽ chặn đăng nhập."
                  : "Tắt để tạo tài khoản ở trạng thái khoá."
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
                          ? "Tài khoản có thể đăng nhập"
                          : "Tài khoản bị chặn đăng nhập"}
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
              title="Vai trò"
              description={`Chọn vai trò${isEdit ? " (thay thế toàn bộ khi lưu)" : ""}.`}
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <Controller
                name="roleCodes"
                control={form.control}
                render={({ field: { value, onChange }, fieldState }) => (
                  <div className="space-y-2">
                    <div className="max-h-[220px] space-y-3 overflow-y-auto rounded-lg border border-border p-3">
                      {roles.length === 0 ? (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          Chưa tải được danh sách vai trò.
                        </p>
                      ) : (
                        roles.map((r) => (
                          <div
                            key={r.code}
                            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/60"
                            onClick={() => {
                              const newValue = value.includes(r.code)
                                ? value.filter((c: string) => c !== r.code)
                                : [...value, r.code]
                              onChange(newValue)
                            }}
                          >
                            <Checkbox
                              checked={value.includes(r.code)}
                              className="mt-0.5"
                            />
                            <ShieldHalf
                              className="mt-0.5 size-4 shrink-0 text-primary/70"
                              aria-hidden
                            />
                            <span>
                              <span className="block text-sm font-medium">
                                {r.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {r.code}
                              </span>
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </div>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
