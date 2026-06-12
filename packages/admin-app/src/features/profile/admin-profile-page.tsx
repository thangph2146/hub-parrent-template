"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "@ui/components/sonner"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
  FieldSetContent,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { Textarea } from "@ui/components/textarea"
import { Camera, KeyRound, Loader2, MapPin, Save } from "lucide-react"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import { useAdminAuth as useAuth } from "@workspace/admin-app/runtime"
import {
  useChangeStaffPassword,
  useStaffProfile,
  useUpdateStaffProfile,
} from "@workspace/admin-app/hooks/queries"
import { patchAdminSessionProfile } from "@workspace/admin-app/lib/auth-session"
import { uploadAdminImage } from "@workspace/admin-app/lib/admin-upload"
import { formatPersonInitials } from "@workspace/admin-app/lib/format-person-initials"
import { MAIN_ADMIN_PROFILE_CONFIG } from "./profile-page.main-config"
import type { AdminProfilePageConfig } from "./profile-page.types"

export type { AdminProfilePageConfig } from "./profile-page.types"

function getRoleCode(role: { code?: string; name?: string }) {
  return role.code ?? role.name ?? ""
}

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa có dữ liệu"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("vi-VN")
}

const PROFILE_FIELD_CLASS =
  "h-10 rounded-lg border-border/70 bg-background/70 px-3 shadow-inner"

const PROFILE_TEXTAREA_CLASS =
  "min-h-28 rounded-lg border-border/70 bg-background/70 px-3 py-2.5 shadow-inner"

const PROFILE_ACTION_BAR_CLASS =
  "flex justify-end border-t border-border/60 pt-4"

function StudentAvatarWarning({ hasAvatar }: { hasAvatar: boolean }) {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>
        {hasAvatar ? (
          <>
            Bạn chỉ được tải ảnh đại diện <strong>một lần duy nhất</strong>.
          </>
        ) : (
          <>
            <strong>Cảnh báo:</strong> bạn chỉ được tải ảnh đại diện{" "}
            <strong>một lần duy nhất</strong>. Hãy chọn ảnh phù hợp trước khi
            tải lên.
          </>
        )}
      </span>
    </div>
  )
}

export function AdminProfilePageInner({
  config,
}: {
  config: AdminProfilePageConfig
}) {
  const { user: sessionUser } = useAuth()
  const userId = sessionUser?.id
  const { data: profile, isLoading, isError, error } = useStaffProfile(userId)
  const updateProfile = useUpdateStaffProfile()
  const changePw = useChangeStaffPassword()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [avatar, setAvatar] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const roles = useMemo(
    () => profile?.roles ?? sessionUser?.roles ?? [],
    [profile?.roles, sessionUser?.roles],
  )
  const email = profile?.email ?? sessionUser?.email ?? ""
  const isStudent = roles.some(
    (r) => getRoleCode(r).trim().toLowerCase() === "student",
  )
  const canChangeAvatar = !isStudent || !avatar

  useEffect(() => {
    if (!profile) return
    setFullName(profile.fullName ?? "")
    setPhone(profile.phone ?? "")
    setAddress(profile.address ?? "")
    setAvatar(profile.avatar ?? "")
  }, [profile])

  const handleUploadAvatar = async (file: File) => {
    if (!userId) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAdminImage(file, {
        folderPath: "avatars",
        ownerUserId: userId,
      })
      setAvatar(url)
      toast.success("Đã tải ảnh đại diện")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload ảnh")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    const name = fullName.trim()
    if (!name) {
      toast.error("Vui lòng nhập họ tên")
      return
    }
    try {
      const u = await updateProfile.mutateAsync({
        id: userId,
        input: {
          fullName: name,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          avatar: avatar.trim() || null,
        },
      })
      patchAdminSessionProfile({
        name: u.fullName,
        phone: u.phone,
        address: u.address,
        image: u.avatar,
        updatedAt: u.updatedAt,
      })
    } catch {
      /* toast: MutationCache */
    }
  }

  const handleChangePassword = async () => {
    if (!userId) return
    if (!currentPassword) {
      toast.error("Nhập mật khẩu hiện tại")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới tối thiểu 6 ký tự")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Nhập lại mật khẩu mới không khớp")
      return
    }
    try {
      await changePw.mutateAsync({
        id: userId,
        input: {
          currentPassword,
          newPassword,
        },
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      /* toast: MutationCache */
    }
  }

  if (!sessionUser) {
    return null
  }

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Hồ sơ tài khoản"
        subtitle={config.subtitle}
      />

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Không tải được hồ sơ"}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.20fr)_minmax(0,0.80fr)]">
        <div className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={MapPin}
              title="Thông tin liên hệ & địa chỉ"
              description="Cập nhật thông tin liên hệ để đồng bộ cho hồ sơ quản trị và các màn nội bộ liên quan."
            />
            <FieldSetContent variant="section" className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2.5">
                  <div className="relative aspect-[3/4] w-40 shrink-0 sm:w-60">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="h-full w-full rounded-lg border-2 border-border/60 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                        {fullName ? formatPersonInitials(fullName) : "?"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar || !canChangeAvatar}
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
                        if (file) void handleUploadAvatar(file)
                      }}
                    />
                  </div>
                  {profile && (
                    <div className="flex w-full flex-col gap-2.5">
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                          Trạng thái
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {profile.isActive ? "Đang hoạt động" : "Đã khoá"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                          Cập nhật lần cuối
                        </p>
                        <p className="mt-1 truncate text-sm font-medium">
                          {formatDateTime(profile.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex w-full flex-col gap-2.5">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor="admin-avatar-url">URL ảnh đại diện</Label>
                    <Input
                      id="admin-avatar-url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      disabled={isLoading || !profile || !canChangeAvatar}
                      placeholder="https://example.com/avatar.jpg"
                      className={PROFILE_FIELD_CLASS}
                    />
                    {isStudent && (
                      <StudentAvatarWarning hasAvatar={Boolean(avatar)} />
                    )}
                  </div>
                  <FieldSectionField label="Email">
                    <span className="font-mono text-sm">{email}</span>
                  </FieldSectionField>
                  <p className="-mt-3 text-xs leading-relaxed text-muted-foreground">
                    Email đăng nhập đang được quản trị tập trung từ hệ thống và
                    không chỉnh trực tiếp ở màn này.
                  </p>
                  <Field>
                    <FieldLabel htmlFor="admin-fullName">Họ và tên</FieldLabel>
                    <FieldContent>
                      <Input
                        id="admin-fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading || !profile}
                        className={PROFILE_FIELD_CLASS}
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="admin-phone">Số điện thoại</FieldLabel>
                    <FieldContent>
                      <Input
                        id="admin-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading || !profile}
                        placeholder="VD: 0901234567"
                        className={PROFILE_FIELD_CLASS}
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="admin-address">
                      Địa chỉ / văn phòng
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="admin-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={isLoading || !profile}
                        placeholder="Địa chỉ liên hệ khi cần (không bắt buộc)"
                        className={PROFILE_TEXTAREA_CLASS}
                      />
                    </FieldContent>
                  </Field>
                  <div className={PROFILE_ACTION_BAR_CLASS}>
                    <Button
                      type="button"
                      className="min-w-32 rounded-lg"
                      onClick={() => void handleSaveProfile()}
                      disabled={
                        isLoading || !profile || updateProfile.isPending
                      }
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      <span className="ml-2">Lưu hồ sơ</span>
                    </Button>
                  </div>
                </div>
              </div>
            </FieldSetContent>
          </FieldSet>
        </div>
        <div className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={KeyRound}
              title="Đổi mật khẩu"
              description="Đặt lại mật khẩu cho phiên đăng nhập quản trị. Mật khẩu mới cần từ 6 ký tự trở lên."
            />
            <FieldSetContent variant="section" className="space-y-5">
              <Field>
                <FieldLabel htmlFor="admin-current-pw">
                  Mật khẩu hiện tại
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="admin-current-pw"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-new-pw">Mật khẩu mới</FieldLabel>
                <FieldContent>
                  <Input
                    id="admin-new-pw"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-confirm-pw">
                  Nhập lại mật khẩu mới
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="admin-confirm-pw"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <div className={PROFILE_ACTION_BAR_CLASS}>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-40 rounded-lg"
                  onClick={() => void handleChangePassword()}
                  disabled={changePw.isPending}
                >
                  {changePw.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  <span className="ml-2">Đổi mật khẩu</span>
                </Button>
              </div>
            </FieldSetContent>
          </FieldSet>
        </div>
      </div>
    </AdminPageSection>
  )
}

export function AdminProfilePage({
  config = MAIN_ADMIN_PROFILE_CONFIG,
}: {
  config?: AdminProfilePageConfig
}) {
  return (
    <AdminPageGuard>
      <AdminProfilePageInner config={config} />
    </AdminPageGuard>
  )
}

export default function AdminProfilePageDefault() {
  return <AdminProfilePage />
}
