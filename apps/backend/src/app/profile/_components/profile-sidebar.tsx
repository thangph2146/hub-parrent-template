"use client"

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
import { Badge } from "@ui/components/badge"
import type { AccountProfile } from "@/lib/api"
import { isSuperAdminRoleCode } from "@workspace/api-client"
import { CalendarClock, CheckCircle2, KeyRound, Loader2, ShieldHalf } from "lucide-react"
import { formatProfileDateTime, PROFILE_FIELD_CLASS, PROFILE_ACTION_BAR_CLASS } from "./profile-utils"

type ProfileSidebarProps = {
  profile: AccountProfile | undefined
  roles: Array<{ id?: string; name: string; displayName?: string }>
  canUpdate: boolean
  currentPassword: string
  newPassword: string
  confirmPassword: string
  changingPassword: boolean
  onCurrentPasswordChange: (v: string) => void
  onNewPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
  onChangePassword: () => void
}

export function ProfileSidebar({
  profile,
  roles,
  canUpdate,
  currentPassword,
  newPassword,
  confirmPassword,
  changingPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onChangePassword,
}: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={ShieldHalf}
          title="Vai trò & tài khoản"
          description="Chỉ đọc — gán vai trò tại Nhân sự / RBAC."
        />
        <FieldSetContent variant="section" className="space-y-4 pt-0">
          <FieldSectionField label="Vai trò">
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge
                    key={role.id ?? role.name}
                    variant={
                      isSuperAdminRoleCode(role.name) ? "default" : "secondary"
                    }
                    className="text-xs font-normal"
                  >
                    {role.displayName ?? role.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm italic text-muted-foreground">
                  Chưa gán vai trò
                </span>
              )}
            </div>
          </FieldSectionField>
          {profile ? (
            <>
              <FieldSectionField label="Ngày tạo" icon={CalendarClock}>
                <span className="text-sm font-medium">
                  {formatProfileDateTime(profile.createdAt)}
                </span>
              </FieldSectionField>
              <FieldSectionField label="Email đã xác minh" icon={CheckCircle2}>
                <span className="text-sm font-medium">
                  {profile.emailVerified
                    ? formatProfileDateTime(profile.emailVerified)
                    : "Chưa xác minh"}
                </span>
              </FieldSectionField>
            </>
          ) : null}
        </FieldSetContent>
      </FieldSet>

      <FieldSet variant="section">
        <FieldSectionLegend
          icon={KeyRound}
          title="Đổi mật khẩu"
          description="Yêu cầu mật khẩu hiện tại — tối thiểu 6 ký tự."
        />
        <FieldSetContent variant="section" className="space-y-4 pt-0">
          {!canUpdate ? (
            <p className="text-sm text-muted-foreground">
              Cần quyền cập nhật tài khoản để đổi mật khẩu.
            </p>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="profile-current-pw">Mật khẩu hiện tại</FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-current-pw"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => onCurrentPasswordChange(e.target.value)}
                    placeholder="Mật khẩu hiện tại"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-new-pw">Mật khẩu mới</FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-new-pw"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => onNewPasswordChange(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-confirm-pw">
                  Nhập lại mật khẩu mới
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-confirm-pw"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className={PROFILE_FIELD_CLASS}
                  />
                </FieldContent>
              </Field>
              <div className={PROFILE_ACTION_BAR_CLASS}>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-full rounded-lg sm:min-w-40"
                  onClick={onChangePassword}
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
            </>
          )}
        </FieldSetContent>
      </FieldSet>
    </div>
  )
}
