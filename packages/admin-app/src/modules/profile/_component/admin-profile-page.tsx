"use client"

import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
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
import { AlertTriangle, Camera, GraduationCap, KeyRound, Loader2, MapPin, Save } from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
  AdminPermissionDeniedNotice,
} from "@ui/components/admin"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import {
  useAdminAuth as useAuth,
  useAdminApi,
  usePatchAuthProfile,
} from "@workspace/admin-app/runtime"
import {
  useAccountProfile,
  useChangeAccountPassword,
  useChangeStaffPassword,
  useStaffProfile,
  useUpdateAccountProfile,
  useUpdateStaffProfile,
} from "@workspace/admin-app/hooks/queries"
import { patchAdminSessionProfile } from "@workspace/admin-app/lib/auth-session"
import {
  normalizeNumericStudentCode,
  validateNumericStudentCode,
} from "@workspace/api-client"
import { formatPersonInitials } from "@workspace/admin-app/lib/format-person-initials"
import { resolveMediaUrl } from "@ui/lib/resolve-media-url"
import { MAIN_ADMIN_PROFILE_CONFIG } from "../_config/profile-page.main-config"
import type { AdminProfilePageConfig } from "../_config/profile-page.types"
import {
  buildAvatarChangeLimitState,
  formatAvatarChangeLimitMessage,
  normalizeMaxAvatarChanges,
  recordAvatarChange,
  resolveInitialAvatarChangesUsed,
} from "../_lib/profile-avatar-limit"

export type { AdminProfilePageConfig } from "../_config/profile-page.types"

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

function AvatarChangeLimitNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

type ProfileAvatarPickerProps = {
  avatarPreviewSrc: string
  fullName: string
  avatarInputRef: RefObject<HTMLInputElement | null>
  uploadingAvatar: boolean
  canChangeAvatar: boolean
  isLoading: boolean
  hasProfile: boolean
  avatarAccept?: string
  onFileSelected: (file: File) => void
  compact?: boolean
}

function ProfileAvatarPicker({
  avatarPreviewSrc,
  fullName,
  avatarInputRef,
  uploadingAvatar,
  canChangeAvatar,
  isLoading,
  hasProfile,
  avatarAccept,
  onFileSelected,
  compact = false,
}: ProfileAvatarPickerProps) {
  const frameClass = compact
    ? "relative aspect-[3/4] w-28 shrink-0 sm:w-32"
    : "relative aspect-[3/4] w-40 shrink-0 sm:w-60"

  return (
    <div className={frameClass}>
      {avatarPreviewSrc ? (
        <img
          src={avatarPreviewSrc}
          alt="Avatar"
          className="h-full w-full rounded-xl border-2 border-border/60 object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
          {fullName ? formatPersonInitials(fullName) : "?"}
        </div>
      )}
      <button
        type="button"
        onClick={() => avatarInputRef.current?.click()}
        disabled={uploadingAvatar || !canChangeAvatar || isLoading || !hasProfile}
        className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent disabled:opacity-50"
        title="Tải ảnh đại diện"
      >
        {uploadingAvatar ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Camera className="size-3.5 text-muted-foreground" />
        )}
      </button>
      <input
        ref={avatarInputRef}
        type="file"
        accept={avatarAccept ?? "image/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelected(file)
        }}
      />
    </div>
  )
}

const PROFILE_CONTACT_GRID_CLASS =
  "grid grid-cols-1 gap-x-5 gap-y-4 pt-1 sm:grid-cols-2"

type ProfileContactFormFieldsProps = {
  idPrefix: "stack" | "split"
  showStudentCode: boolean
  studentCodeEditable: boolean
  studentCode: string
  onStudentCodeChange: (value: string) => void
  studentCodeError: string | null
  fullName: string
  onFullNameChange: (value: string) => void
  phone: string
  onPhoneChange: (value: string) => void
  address: string
  onAddressChange: (value: string) => void
  showAddress: boolean
  addressFieldLabel: string
  isLoading: boolean
  hasProfile: boolean
}

function ProfileContactFormFields({
  idPrefix,
  showStudentCode,
  studentCodeEditable,
  studentCode,
  onStudentCodeChange,
  studentCodeError,
  fullName,
  onFullNameChange,
  phone,
  onPhoneChange,
  address,
  onAddressChange,
  showAddress,
  addressFieldLabel,
  isLoading,
  hasProfile,
}: ProfileContactFormFieldsProps) {
  const fieldId = (name: string) => {
    if (idPrefix === "stack") return `admin-${name}-stack`
    if (name === "studentCode") return "admin-studentCode-split"
    return `admin-${name}`
  }

  return (
    <div className={PROFILE_CONTACT_GRID_CLASS}>
      {showStudentCode ? (
        <Field className="min-w-0 sm:col-span-2">
          <FieldLabel htmlFor={fieldId("studentCode")}>
            Mã số sinh viên
          </FieldLabel>
          <FieldContent>
            <Input
              id={fieldId("studentCode")}
              value={studentCode}
              onChange={(e) => {
                if (!studentCodeEditable) return
                onStudentCodeChange(
                  e.target.value.replace(/\D/g, "").slice(0, 12),
                )
              }}
              readOnly={!studentCodeEditable}
              disabled={isLoading || !hasProfile || !studentCodeEditable}
              inputMode="numeric"
              autoComplete="off"
              placeholder="VD: 202600001"
              className={`${PROFILE_FIELD_CLASS} font-mono`}
              aria-invalid={Boolean(studentCodeError)}
            />
            {studentCodeError ? (
              <p className="mt-1 text-xs text-destructive">{studentCodeError}</p>
            ) : studentCodeEditable ? (
              <p className="mt-1 text-xs text-muted-foreground">
                MSSV là số (5–12 chữ số), dùng làm thư mục lưu ảnh khuôn mặt HANET.
              </p>
            ) : null}
          </FieldContent>
        </Field>
      ) : null}

      <Field className="min-w-0">
        <FieldLabel htmlFor={fieldId("fullName")}>Họ và tên</FieldLabel>
        <FieldContent>
          <Input
            id={fieldId("fullName")}
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            disabled={isLoading || !hasProfile}
            className={PROFILE_FIELD_CLASS}
          />
        </FieldContent>
      </Field>

      <Field className="min-w-0">
        <FieldLabel htmlFor={fieldId("phone")}>Số điện thoại</FieldLabel>
        <FieldContent>
          <Input
            id={fieldId("phone")}
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            disabled={isLoading || !hasProfile}
            placeholder="VD: 0901234567"
            className={PROFILE_FIELD_CLASS}
          />
        </FieldContent>
      </Field>

      {showAddress ? (
        <Field className="min-w-0 sm:col-span-2">
          <FieldLabel htmlFor={fieldId("address")}>
            {addressFieldLabel}
          </FieldLabel>
          <FieldContent>
            <Textarea
              id={fieldId("address")}
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              disabled={isLoading || !hasProfile}
              placeholder="Địa chỉ liên hệ khi cần (không bắt buộc)"
              rows={3}
              className={PROFILE_TEXTAREA_CLASS}
            />
          </FieldContent>
        </Field>
      ) : null}
    </div>
  )
}

export function AdminProfilePageInner({
  config,
}: {
  config: AdminProfilePageConfig
}) {
  const api = useAdminApi()
  const patchAuthProfile = usePatchAuthProfile()
  const profileSource = config.profileSource ?? "staff"
  const maxAvatarChanges = normalizeMaxAvatarChanges(config.maxAvatarChanges)
  const showAddress = config.showAddress !== false
  const showChangePassword = config.showChangePassword !== false
  const contactSectionTitle =
    config.contactSectionTitle ??
    (profileSource === "account"
      ? "Thông tin cá nhân"
      : "Thông tin liên hệ & địa chỉ")
  const contactSectionDescription =
    config.contactSectionDescription ??
    (profileSource === "account"
      ? "Cập nhật họ tên, số điện thoại và địa chỉ liên hệ của bạn."
      : "Cập nhật thông tin liên hệ để đồng bộ cho hồ sơ quản trị và các màn nội bộ liên quan.")
  const addressFieldLabel =
    profileSource === "account" ? "Địa chỉ liên hệ" : "Địa chỉ / văn phòng"
  const layout = config.layout ?? "split"
  const showAvatarUrl = config.showAvatarUrl !== false
  const isStackLayout = layout === "stack"

  const { user: sessionUser } = useAuth()
  const userId = sessionUser?.id

  const studentCodeRoles = config.studentCodeRoles ?? ["student"]
  const hasStudentCodeRole =
    sessionUser?.roles?.some((role) => studentCodeRoles.includes(role.name)) ??
    false
  const showStudentCode =
    config.showStudentCode === true &&
    profileSource === "account" &&
    hasStudentCodeRole
  const studentCodeEditable =
    showStudentCode && config.studentCodeEditable === true

  const staffQuery = useStaffProfile(
    profileSource === "staff" ? userId : undefined,
  )
  const accountQuery = useAccountProfile(
    profileSource === "account" && Boolean(userId),
  )

  const updateStaffProfile = useUpdateStaffProfile()
  const changeStaffPw = useChangeStaffPassword()
  const updateAccountProfile = useUpdateAccountProfile()
  const changeAccountPw = useChangeAccountPassword()

  const profile = profileSource === "staff" ? staffQuery.data : accountQuery.data
  const isLoading =
    profileSource === "staff" ? staffQuery.isLoading : accountQuery.isLoading
  const isError =
    profileSource === "staff" ? staffQuery.isError : accountQuery.isError
  const error = profileSource === "staff" ? staffQuery.error : accountQuery.error

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [avatar, setAvatar] = useState("")
  const [studentCode, setStudentCode] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarChangesUsed, setAvatarChangesUsed] = useState(0)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const initialAvatarRef = useRef<string | null>(null)

  const email = profile?.email ?? sessionUser?.email ?? ""

  const savedStudentCode = useMemo(() => {
    if (!showStudentCode || profileSource !== "account") return null
    return normalizeNumericStudentCode(
      (profile as { studentCode?: string | null } | undefined)?.studentCode,
    )
  }, [profile, profileSource, showStudentCode])

  const studentCodeError = useMemo(
    () => (showStudentCode ? validateNumericStudentCode(studentCode) : null),
    [showStudentCode, studentCode],
  )

  const avatarLimit = useMemo(
    () =>
      buildAvatarChangeLimitState({
        maxAvatarChanges,
        changesUsed: avatarChangesUsed,
      }),
    [avatarChangesUsed, maxAvatarChanges],
  )

  const avatarLimitMessage = useMemo(
    () => formatAvatarChangeLimitMessage(avatarLimit),
    [avatarLimit],
  )

  const avatarPreviewSrc = avatar.trim()
    ? resolveMediaUrl(avatar.trim(), 480)
    : ""

  useEffect(() => {
    if (!profile || userId == null) return

    const profileAvatar =
      profileSource === "staff"
        ? (profile as { avatar?: string | null }).avatar ?? ""
        : (profile as { avatar?: string | null }).avatar ?? ""

    if (initialAvatarRef.current === null) {
      initialAvatarRef.current = profileAvatar.trim() || null
      setAvatarChangesUsed(
        resolveInitialAvatarChangesUsed(
          userId,
          initialAvatarRef.current,
          maxAvatarChanges,
        ),
      )
    }

    setFullName(
      profileSource === "staff"
        ? ((profile as { fullName?: string | null }).fullName ?? "")
        : ((profile as { name?: string | null }).name ?? ""),
    )
    setPhone(profile.phone ?? "")
    setAddress(profile.address ?? "")
    setAvatar(profileAvatar)
    if (showStudentCode) {
      setStudentCode(
        normalizeNumericStudentCode(
          (profile as { studentCode?: string | null }).studentCode,
        ) ?? "",
      )
    }
  }, [profile, profileSource, userId, maxAvatarChanges, showStudentCode])

  const buildAccountProfilePayload = (overrides?: { avatar?: string | null }) => {
    const name =
      fullName.trim() ||
      (profile as { name?: string | null })?.name?.trim() ||
      email
    const payload = {
      name,
      phone: phone.trim() || null,
      ...(showAddress ? { address: address.trim() || null } : {}),
      avatar:
        overrides && "avatar" in overrides
          ? overrides.avatar
          : avatar.trim() || null,
      ...(showStudentCode && studentCodeEditable
        ? { studentCode: studentCode.trim() || null }
        : {}),
    }
    return payload
  }

  const ensureStudentCodeSavedForUpload = async (): Promise<boolean> => {
    if (!showStudentCode) return true
    const err = validateNumericStudentCode(studentCode)
    if (err) {
      toast.error(err)
      return false
    }
    if (savedStudentCode === studentCode.trim()) return true

    try {
      const u = await updateAccountProfile.mutateAsync(
        buildAccountProfilePayload(),
      )
      patchSessionProfile({
        name: u.name ?? fullName.trim(),
        phone: u.phone,
        address: u.address,
        image: u.avatar,
        updatedAt: u.updatedAt,
      })
      return true
    } catch {
      return false
    }
  }

  const persistAccountAvatarAfterUpload = async (url: string) => {
    const payload = buildAccountProfilePayload({ avatar: url })
    if (!payload.name) {
      throw new Error("Vui lòng nhập họ tên trước khi lưu ảnh")
    }
    const u = await updateAccountProfile.mutateAsync(payload)
    patchSessionProfile({
      name: u.name ?? payload.name,
      phone: u.phone,
      address: u.address,
      image: u.avatar,
      updatedAt: u.updatedAt,
    })
  }

  const handleUploadAvatar = async (file: File) => {
    if (!userId || !avatarLimit.canChangeAvatar) return
    if (showStudentCode && studentCodeError) {
      toast.error(`${studentCodeError} Lưu hồ sơ trước khi tải ảnh.`)
      return
    }
    setUploadingAvatar(true)
    try {
      if (profileSource === "account" && showStudentCode) {
        const ready = await ensureStudentCodeSavedForUpload()
        if (!ready) return
      }

      const url = (await api.accounts.uploadAvatar(file)).url
      setAvatar(url)

      if (profileSource === "account" && maxAvatarChanges !== null) {
        await persistAccountAvatarAfterUpload(url)
        const nextUsed = recordAvatarChange(userId)
        setAvatarChangesUsed(nextUsed)
        toast.success("Đã tải và lưu ảnh đại diện")
        return
      }

      toast.success("Đã tải ảnh đại diện — nhấn Lưu hồ sơ để áp dụng")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload ảnh")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const patchSessionProfile = (fields: {
    name: string
    phone?: string | null
    address?: string | null
    image?: string | null
    updatedAt?: string
  }) => {
    if (patchAuthProfile) {
      patchAuthProfile({ name: fields.name, image: fields.image ?? null })
      return
    }
    patchAdminSessionProfile({
      name: fields.name,
      phone: fields.phone,
      address: fields.address,
      image: fields.image,
      updatedAt: fields.updatedAt,
    })
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    const name = fullName.trim()
    if (!name) {
      toast.error("Vui lòng nhập họ tên")
      return
    }
    if (showStudentCode && studentCodeEditable && studentCodeError) {
      toast.error(studentCodeError)
      return
    }
    try {
      if (profileSource === "account") {
        const u = await updateAccountProfile.mutateAsync(
          buildAccountProfilePayload(),
        )
        patchSessionProfile({
          name: u.name ?? name,
          phone: u.phone,
          address: u.address,
          image: u.avatar,
          updatedAt: u.updatedAt,
        })
        return
      }

      const u = await updateStaffProfile.mutateAsync({
        id: userId,
        input: {
          fullName: name,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          avatar: avatar.trim() || null,
        },
      })
      patchSessionProfile({
        name: u.fullName ?? name,
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
      if (profileSource === "account") {
        await changeAccountPw.mutateAsync({
          currentPassword,
          password: newPassword,
        })
      } else {
        await changeStaffPw.mutateAsync({
          id: userId,
          input: {
            currentPassword,
            newPassword,
          },
        })
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      /* toast: MutationCache */
    }
  }

  const savingProfile =
    profileSource === "account"
      ? updateAccountProfile.isPending
      : updateStaffProfile.isPending
  const changingPassword =
    profileSource === "account"
      ? changeAccountPw.isPending
      : changeStaffPw.isPending

  const canUploadAvatar =
    avatarLimit.canChangeAvatar &&
    !savingProfile &&
    (!showStudentCode || !studentCodeError)

  const profileViewPermission =
    profileSource === "account"
      ? PERMISSION_CODES.ACCOUNTS_VIEW
      : PERMISSION_CODES.USERS_VIEW
  const profileUpdatePermission =
    profileSource === "account"
      ? PERMISSION_CODES.ACCOUNTS_UPDATE
      : PERMISSION_CODES.USERS_UPDATE
  const profileViewActionLabel =
    profileSource === "account"
      ? "Xem hồ sơ tài khoản"
      : "Xem hồ sơ nhân sự"
  const profileUpdateActionLabel =
    profileSource === "account"
      ? "Cập nhật hồ sơ tài khoản"
      : "Cập nhật hồ sơ nhân sự"

  const canViewProfile = sessionUser
    ? canUserAccess(sessionUser, profileViewPermission)
    : false
  const canUpdateProfile = sessionUser
    ? canUserAccess(sessionUser, profileUpdatePermission)
    : false

  if (!sessionUser) {
    return null
  }

  if (!canViewProfile) {
    return (
      <AdminPageSection>
        <AdminListPageHeader
          title="Hồ sơ tài khoản"
          subtitle={config.subtitle}
        />
        <AdminPermissionDeniedNotice
          user={sessionUser}
          actionLabel={profileViewActionLabel}
          requiredPermission={profileViewPermission}
        />
      </AdminPageSection>
    )
  }

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Hồ sơ tài khoản"
        subtitle={config.subtitle}
      />

      {isError ? (
        <AdminPermissionDeniedNotice
          user={sessionUser}
          error={error}
          actionLabel={profileViewActionLabel}
          requiredPermission={profileViewPermission}
        />
      ) : null}

      {!canUpdateProfile && !isError ? (
        <AdminPermissionDeniedNotice
          user={sessionUser}
          actionLabel={profileUpdateActionLabel}
          requiredPermission={profileUpdatePermission}
        />
      ) : null}

      {!isError ? (
      <div
        className={
          showChangePassword
            ? "grid w-full gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
            : isStackLayout
              ? "mx-auto w-full max-w-3xl"
              : "grid max-w-3xl gap-6"
        }
      >
        <div className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={isStackLayout && showStudentCode ? GraduationCap : MapPin}
              title={contactSectionTitle}
              description={contactSectionDescription}
            />
            <FieldSetContent variant="section" className="space-y-5">
              {isStackLayout ? (
                <>
                  <div className="flex flex-col gap-5 border-b border-border/60 pb-6 sm:flex-row sm:items-start">
                    <ProfileAvatarPicker
                      avatarPreviewSrc={avatarPreviewSrc}
                      fullName={fullName}
                      avatarInputRef={avatarInputRef}
                      uploadingAvatar={uploadingAvatar}
                      canChangeAvatar={canUploadAvatar}
                      isLoading={isLoading}
                      hasProfile={Boolean(profile)}
                      avatarAccept={config.avatarAccept}
                      onFileSelected={(file) => void handleUploadAvatar(file)}
                      compact
                    />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <p className="text-lg font-semibold leading-tight">
                          {fullName.trim() || "Chưa có tên"}
                        </p>
                        <p className="mt-1 font-mono text-sm text-muted-foreground">
                          {email}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile ? (
                          <Badge
                            variant={profile.isActive ? "default" : "secondary"}
                          >
                            {profile.isActive ? "Đang hoạt động" : "Đã khoá"}
                          </Badge>
                        ) : null}
                        {profile ? (
                          <Badge variant="secondary">
                            Cập nhật {formatDateTime(profile.updatedAt)}
                          </Badge>
                        ) : null}
                      </div>
                      {avatarLimitMessage ? (
                        <AvatarChangeLimitNotice message={avatarLimitMessage} />
                      ) : null}
                      {config.avatarGuidance ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {config.avatarGuidance}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <ProfileContactFormFields
                    idPrefix="stack"
                    showStudentCode={showStudentCode}
                    studentCodeEditable={studentCodeEditable}
                    studentCode={studentCode}
                    onStudentCodeChange={setStudentCode}
                    studentCodeError={studentCodeError}
                    fullName={fullName}
                    onFullNameChange={setFullName}
                    phone={phone}
                    onPhoneChange={setPhone}
                    address={address}
                    onAddressChange={setAddress}
                    showAddress={showAddress}
                    addressFieldLabel={addressFieldLabel}
                    isLoading={isLoading}
                    hasProfile={Boolean(profile)}
                  />

                  <div className={PROFILE_ACTION_BAR_CLASS}>
                    <Button
                      type="button"
                      className="min-w-32 rounded-lg sm:min-w-40"
                      onClick={() => void handleSaveProfile()}
                      disabled={isLoading || !profile || savingProfile}
                    >
                      {savingProfile ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      <span className="ml-2">Lưu hồ sơ</span>
                    </Button>
                  </div>
                </>
              ) : (
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2.5">
                  <ProfileAvatarPicker
                    avatarPreviewSrc={avatarPreviewSrc}
                    fullName={fullName}
                    avatarInputRef={avatarInputRef}
                    uploadingAvatar={uploadingAvatar}
                    canChangeAvatar={canUploadAvatar}
                    isLoading={isLoading}
                    hasProfile={Boolean(profile)}
                    avatarAccept={config.avatarAccept}
                    onFileSelected={(file) => void handleUploadAvatar(file)}
                  />
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
                  {showAvatarUrl ? (
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label htmlFor="admin-avatar-url">URL ảnh đại diện</Label>
                      <Input
                        id="admin-avatar-url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        disabled={
                          isLoading ||
                          !profile ||
                          !avatarLimit.canChangeAvatar
                        }
                        placeholder="https://example.com/avatar.jpg"
                        className={PROFILE_FIELD_CLASS}
                      />
                      {avatarLimitMessage ? (
                        <AvatarChangeLimitNotice message={avatarLimitMessage} />
                      ) : null}
                      {config.avatarGuidance ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {config.avatarGuidance}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <FieldSectionField label="Email">
                    <span className="font-mono text-sm">{email}</span>
                  </FieldSectionField>
                  <p className="-mt-3 text-xs leading-relaxed text-muted-foreground">
                    Email đăng nhập đang được quản trị tập trung từ hệ thống và
                    không chỉnh trực tiếp ở màn này.
                  </p>
                  <ProfileContactFormFields
                    idPrefix="split"
                    showStudentCode={showStudentCode}
                    studentCodeEditable={studentCodeEditable}
                    studentCode={studentCode}
                    onStudentCodeChange={setStudentCode}
                    studentCodeError={studentCodeError}
                    fullName={fullName}
                    onFullNameChange={setFullName}
                    phone={phone}
                    onPhoneChange={setPhone}
                    address={address}
                    onAddressChange={setAddress}
                    showAddress={showAddress}
                    addressFieldLabel={addressFieldLabel}
                    isLoading={isLoading}
                    hasProfile={Boolean(profile)}
                  />
                  <div className={PROFILE_ACTION_BAR_CLASS}>
                    <Button
                      type="button"
                      className="min-w-32 rounded-lg"
                      onClick={() => void handleSaveProfile()}
                      disabled={isLoading || !profile || savingProfile}
                    >
                      {savingProfile ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      <span className="ml-2">Lưu hồ sơ</span>
                    </Button>
                  </div>
                </div>
              </div>
              )}
            </FieldSetContent>
          </FieldSet>
        </div>
        {showChangePassword ? (
        <div className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={KeyRound}
              title="Đổi mật khẩu"
              description="Đặt lại mật khẩu cho phiên đăng nhập. Mật khẩu mới cần từ 6 ký tự trở lên."
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
                  disabled={changingPassword}
                >
                  {changingPassword ? (
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
        ) : null}
      </div>
      ) : null}
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
