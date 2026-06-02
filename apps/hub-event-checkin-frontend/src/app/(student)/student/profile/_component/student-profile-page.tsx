"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useSyncExternalStore } from "react"
import { toast } from "sonner"
import {
  AlertTriangle,
  Camera,
  KeyRound,
  Loader2,
  MapPin,
  Save,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/card"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { Textarea } from "@ui/components/textarea"
import { PageSection } from "@ui/components/layout"
import { TypographyH1 } from "@ui/components/typography"
import { ADMIN_PAGE_TITLE_PROFILE_CLASS } from "@ui/lib/layout-shell"
import { cn } from "@ui/lib/utils"
import {
  patchEventSessionProfile,
  readEventSession,
  subscribeEventSession,
} from "@/lib/event-auth"
import {
  fetchStudentProfile,
  updateStudentProfile,
  uploadStudentAvatar,
  type StudentAccountProfile,
} from "@/lib/student-profile"

const PROFILE_CARD_CLASS =
  "border border-border/70 bg-card/95 shadow-sm backdrop-blur-sm"

const PROFILE_FIELD_CLASS =
  "h-10 rounded-lg border-border/70 bg-background/70 px-3 shadow-inner"

const PROFILE_TEXTAREA_CLASS =
  "min-h-28 rounded-lg border-border/70 bg-background/70 px-3 py-2.5 shadow-inner"

const PROFILE_ACTION_BAR_CLASS =
  "flex justify-end border-t border-border/60 pt-4"

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa có dữ liệu"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("vi-VN")
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function AvatarWarning({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export function StudentProfilePage() {
  const session = useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null
  )

  const [profile, setProfile] = useState<StudentAccountProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [avatar, setAvatar] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const canChangeAvatar = !avatar

  useEffect(() => {
    if (!session?.id) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadError(null)

    void fetchStudentProfile()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setFullName(data.name ?? "")
        setPhone(data.phone ?? "")
        setAddress(data.address ?? "")
        setAvatar(data.avatar ?? "")
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(
          error instanceof Error ? error.message : "Không tải được hồ sơ."
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.id])

  const handleUploadAvatar = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const url = await uploadStudentAvatar(file)
      setAvatar(url)
      toast.success("Đã tải ảnh đại diện")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi upload ảnh")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    const name = fullName.trim()
    if (!name) {
      toast.error("Vui lòng nhập họ tên")
      return
    }

    setSaving(true)
    try {
      const updated = await updateStudentProfile({
        name,
        phone: phone.trim() || null,
        address: address.trim() || null,
        avatar: avatar.trim() || null,
      })
      setProfile(updated)
      patchEventSessionProfile({
        name: updated.name,
        image: updated.avatar,
      })
      toast.success("Đã cập nhật hồ sơ")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi lưu hồ sơ")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
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

    setChangingPassword(true)
    try {
      await updateStudentProfile({ password: newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Đã đổi mật khẩu")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không đổi được mật khẩu"
      )
    } finally {
      setChangingPassword(false)
    }
  }

  if (!session) return null

  const email = profile?.email ?? session.email

  return (
    <PageSection max="full" className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <TypographyH1 className={ADMIN_PAGE_TITLE_PROFILE_CLASS}>
          Hồ sơ tài khoản
        </TypographyH1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Cập nhật tên, liên hệ, địa chỉ và mật khẩu cho cổng sự kiện sinh
          viên.
        </p>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.20fr)_minmax(0,0.80fr)]">
        <div className="space-y-6">
          <Card className={PROFILE_CARD_CLASS}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="size-5 text-primary" />
                Thông tin liên hệ & địa chỉ
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin liên hệ để đồng bộ cho hồ sơ sinh viên và
                đăng ký sự kiện.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
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
                        {fullName ? initials(fullName) : "?"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar || !canChangeAvatar || loading}
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
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void handleUploadAvatar(file)
                      }}
                    />
                  </div>
                  {profile ? (
                    <div className="flex w-full flex-col gap-2.5">
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                          Trạng thái
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          Đang hoạt động
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
                  ) : null}
                </div>

                <div className="flex w-full min-w-0 flex-col gap-2.5">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor="student-avatar-url">URL ảnh đại diện</Label>
                    <Input
                      id="student-avatar-url"
                      value={avatar}
                      onChange={(event) => setAvatar(event.target.value)}
                      disabled={loading || !profile || !canChangeAvatar}
                      placeholder="https://example.com/avatar.jpg"
                      className={PROFILE_FIELD_CLASS}
                    />
                    {avatar ? (
                      <AvatarWarning>
                        Bạn chỉ được tải ảnh đại diện{" "}
                        <strong>một lần duy nhất</strong>.
                      </AvatarWarning>
                    ) : (
                      <AvatarWarning>
                        <strong>Cảnh báo:</strong> bạn chỉ được tải ảnh đại
                        diện <strong>một lần duy nhất</strong>. Hãy chọn ảnh phù
                        hợp trước khi tải lên.
                      </AvatarWarning>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      value={email}
                      disabled
                      className={cn(PROFILE_FIELD_CLASS, "bg-muted/35")}
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Email đăng nhập được quản lý tập trung và không chỉnh
                      trực tiếp ở màn này.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-fullName">Họ và tên</Label>
                    <Input
                      id="student-fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      disabled={loading || !profile}
                      className={PROFILE_FIELD_CLASS}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-phone">Số điện thoại</Label>
                    <Input
                      id="student-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={loading || !profile}
                      placeholder="VD: 0901234567"
                      className={PROFILE_FIELD_CLASS}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-address">Địa chỉ</Label>
                    <Textarea
                      id="student-address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      disabled={loading || !profile}
                      placeholder="Địa chỉ liên hệ khi cần (không bắt buộc)"
                      className={PROFILE_TEXTAREA_CLASS}
                    />
                  </div>

                  <div className={PROFILE_ACTION_BAR_CLASS}>
                    <Button
                      type="button"
                      className="min-w-32 rounded-lg"
                      onClick={() => void handleSaveProfile()}
                      disabled={loading || !profile || saving}
                    >
                      {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      <span className="ml-2">Lưu hồ sơ</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={PROFILE_CARD_CLASS}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <KeyRound className="size-5 text-primary" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>
                Đặt lại mật khẩu cho phiên đăng nhập sinh viên. Mật khẩu mới cần
                từ 6 ký tự trở lên.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-current-pw">Mật khẩu hiện tại</Label>
                <Input
                  id="student-current-pw"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className={PROFILE_FIELD_CLASS}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-new-pw">Mật khẩu mới</Label>
                <Input
                  id="student-new-pw"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  className={PROFILE_FIELD_CLASS}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-confirm-pw">Nhập lại mật khẩu mới</Label>
                <Input
                  id="student-confirm-pw"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className={PROFILE_FIELD_CLASS}
                />
              </div>
              <div className={PROFILE_ACTION_BAR_CLASS}>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-40 rounded-lg"
                  onClick={() => void handleChangePassword()}
                  disabled={changingPassword || loading || !profile}
                >
                  {changingPassword ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  <span className="ml-2">Đổi mật khẩu</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageSection>
  )
}
