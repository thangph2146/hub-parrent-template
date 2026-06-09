"use client"

import type { RefObject } from "react"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { Textarea } from "@ui/components/textarea"
import { Camera, Loader2, Pencil, Save } from "lucide-react"
import {
  PROFILE_ACTION_BAR_CLASS,
  PROFILE_FIELD_CLASS,
  PROFILE_TEXTAREA_CLASS,
  profileInitials,
} from "./profile-utils"

export type ProfileEditFormState = {
  fullName: string
  phone: string
  address: string
  bio: string
  citizenId: string
  avatar: string
}

type ProfileEditSectionProps = {
  email: string
  form: ProfileEditFormState
  disabled: boolean
  canUpdate: boolean
  canChangeAvatar: boolean
  isStudent: boolean
  uploadingAvatar: boolean
  saving: boolean
  avatarInputRef: RefObject<HTMLInputElement | null>
  onChange: (patch: Partial<ProfileEditFormState>) => void
  onUploadAvatar: (file: File) => void
  onSave: () => void
}

export function ProfileEditSection({
  email,
  form,
  disabled,
  canUpdate,
  canChangeAvatar,
  isStudent,
  uploadingAvatar,
  saving,
  avatarInputRef,
  onChange,
  onUploadAvatar,
  onSave,
}: ProfileEditSectionProps) {
  const inputsDisabled = disabled || !canUpdate

  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        icon={Pencil}
        title="Chỉnh sửa hồ sơ"
        description="Cập nhật qua PUT /admin/accounts — không đổi email hay vai trò tại đây."
      />
      <FieldSetContent variant="section" className="space-y-5 pt-0">
        {!canUpdate ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Tài khoản của bạn không có quyền{" "}
            <span className="font-mono text-xs">accounts:update</span>. Liên hệ
            quản trị nếu cần chỉnh sửa.
          </p>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex shrink-0 flex-col items-center gap-2 self-center lg:self-start">
            <div className="relative aspect-[3/4] w-32 sm:w-40">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt=""
                  className="h-full w-full rounded-lg border-2 border-border/60 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                  {form.fullName ? profileInitials(form.fullName) : "?"}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar || inputsDisabled || !canChangeAvatar}
                className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent disabled:opacity-50"
                title="Tải ảnh đại diện"
              >
                <Camera className="size-3.5 text-muted-foreground" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onUploadAvatar(file)
                }}
              />
            </div>
            {isStudent && (
              <p className="max-w-[11rem] text-center text-xs text-amber-800">
                {form.avatar
                  ? "Ảnh đại diện chỉ được tải một lần."
                  : "Chọn ảnh cẩn thận — chỉ tải được một lần."}
              </p>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="profile-avatar-url">URL ảnh đại diện</Label>
              <Input
                id="profile-avatar-url"
                value={form.avatar}
                onChange={(e) => onChange({ avatar: e.target.value })}
                disabled={inputsDisabled || !canChangeAvatar}
                placeholder="https://example.com/avatar.jpg"
                className={PROFILE_FIELD_CLASS}
              />
            </div>

            <Field>
              <FieldLabel htmlFor="profile-email">Email đăng nhập</FieldLabel>
              <FieldContent>
                <Input
                  id="profile-email"
                  value={email}
                  disabled
                  className="bg-muted/50 font-mono text-sm"
                />
              </FieldContent>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profile-fullName">Họ và tên</FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-fullName"
                    value={form.fullName}
                    onChange={(e) => onChange({ fullName: e.target.value })}
                    disabled={inputsDisabled}
                    placeholder="Nguyễn Văn A"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-phone">Số điện thoại</FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    disabled={inputsDisabled}
                    placeholder="VD: 0901234567"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-citizenId">
                  Căn cước công dân
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-citizenId"
                    value={form.citizenId}
                    onChange={(e) => onChange({ citizenId: e.target.value })}
                    disabled={inputsDisabled}
                    placeholder="Số CCCD (12 số)"
                    className={PROFILE_FIELD_CLASS}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="profile-address">
                Địa chỉ / văn phòng
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="profile-address"
                  value={form.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  disabled={inputsDisabled}
                  placeholder="Địa chỉ liên hệ (không bắt buộc)"
                  className={PROFILE_TEXTAREA_CLASS}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-bio">Giới thiệu ngắn</FieldLabel>
              <FieldContent>
                <Textarea
                  id="profile-bio"
                  value={form.bio}
                  onChange={(e) => onChange({ bio: e.target.value })}
                  disabled={inputsDisabled}
                  placeholder="Mô tả ngắn (không bắt buộc)"
                  className="min-h-24 rounded-lg border-border/70 bg-background/70 px-3 py-2.5 shadow-inner"
                />
              </FieldContent>
            </Field>

            <div className={PROFILE_ACTION_BAR_CLASS}>
              <Button
                type="button"
                className="min-w-36 rounded-lg"
                onClick={onSave}
                disabled={inputsDisabled || saving}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span className="ml-2">Lưu thay đổi</span>
              </Button>
            </div>
          </div>
        </div>
      </FieldSetContent>
    </FieldSet>
  )
}
