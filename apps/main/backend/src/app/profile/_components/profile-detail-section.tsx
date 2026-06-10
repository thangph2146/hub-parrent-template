"use client"

import {
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import type { AccountProfile } from "@/lib/api"
import { Fingerprint, FileText, Mail, MapPin, Phone, User } from "lucide-react"
import {
  formatProfileDateTime,
  profileInitials,
  telHref,
} from "./profile-utils"

function DetailEmpty({ label }: { label: string }) {
  return (
    <span className="text-sm text-muted-foreground/70 italic">{label}</span>
  )
}

type ProfileDetailSectionProps = {
  profile: AccountProfile
}

export function ProfileDetailSection({ profile }: ProfileDetailSectionProps) {
  const displayName = profile.name?.trim() || profile.email

  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        icon={User}
        title="Chi tiết hồ sơ"
        description="Thông tin đang lưu trên hệ thống (GET /admin/accounts)."
      />
      <FieldSetContent variant="section" className="pt-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex shrink-0 flex-col items-center gap-2 self-center rounded-xl border border-border/60 bg-muted/15 p-4 lg:w-44 lg:self-start">
            <div className="relative aspect-[3/4] w-32 sm:w-36">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt=""
                  className="h-full w-full rounded-lg border border-border/60 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                  {profileInitials(displayName)}
                </div>
              )}
            </div>
            <UsageStatusFromValue
              value={profile.isActive}
              labels={{ active: "Đang hoạt động", locked: "Đã khoá" }}
              className="text-[10px]"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Họ và tên
              </p>
              <p className="mt-1 text-xl leading-snug font-semibold tracking-tight">
                {displayName}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                ID: {profile.id}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSectionField label="Email" icon={Mail}>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-mono text-sm font-medium break-all text-primary underline-offset-4 hover:underline"
                >
                  {profile.email}
                </a>
              </FieldSectionField>

              <FieldSectionField label="Số điện thoại" icon={Phone}>
                {profile.phone ? (
                  <a
                    href={telHref(profile.phone)}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {profile.phone}
                  </a>
                ) : (
                  <DetailEmpty label="Chưa cập nhật" />
                )}
              </FieldSectionField>

              <FieldSectionField label="Căn cước công dân" icon={Fingerprint}>
                {profile.citizenId?.trim() ? (
                  <span className="font-mono font-medium tracking-wide">
                    {profile.citizenId}
                  </span>
                ) : (
                  <DetailEmpty label="Chưa cập nhật" />
                )}
              </FieldSectionField>

              <FieldSectionField
                label="Địa chỉ / văn phòng"
                icon={MapPin}
                className="sm:col-span-2"
              >
                {profile.address ? (
                  <p className="leading-relaxed font-medium whitespace-pre-wrap">
                    {profile.address}
                  </p>
                ) : (
                  <DetailEmpty label="Chưa cập nhật" />
                )}
              </FieldSectionField>

              <FieldSectionField
                label="Giới thiệu"
                icon={FileText}
                className="sm:col-span-2"
              >
                {profile.bio ? (
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                ) : (
                  <DetailEmpty label="Chưa cập nhật" />
                )}
              </FieldSectionField>
            </div>

            <FieldSectionDivider />

            <FieldSectionField label="Cập nhật lần cuối">
              <span className="text-sm font-medium">
                {formatProfileDateTime(profile.updatedAt)}
              </span>
            </FieldSectionField>
          </div>
        </div>
      </FieldSetContent>
    </FieldSet>
  )
}
