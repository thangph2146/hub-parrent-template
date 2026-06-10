"use client"

import {
  FieldSet,
  FieldSetContent,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import { Fingerprint, Mail, MapPin, Phone, User } from "lucide-react"
import type { User as StaffUser } from "@/lib/admin/api"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function DetailEmpty({ label }: { label: string }) {
  return (
    <span className="text-sm text-muted-foreground/70 italic">{label}</span>
  )
}

function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`
}

type StaffPersonnelInfoSectionProps = {
  user: Pick<
    StaffUser,
    "fullName" | "email" | "phone" | "address" | "citizenId" | "avatar"
  >
}

export function StaffPersonnelInfoSection({
  user,
}: StaffPersonnelInfoSectionProps) {
  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        icon={User}
        title="Thông tin nhân sự"
        description="Họ tên, email, số điện thoại và địa chỉ."
      />
      <FieldSetContent variant="section" className="pt-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex shrink-0 flex-col items-center gap-2 self-center rounded-xl border border-border/60 bg-muted/15 p-4 lg:w-44 lg:self-start">
            <div className="relative aspect-[3/4] w-32 sm:w-36">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-full w-full rounded-lg border border-border/60 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                  {initials(user.fullName)}
                </div>
              )}
            </div>
            <p className="max-w-[9rem] text-center text-xs text-muted-foreground">
              Ảnh đại diện
            </p>
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Họ và tên
              </p>
              <p className="mt-1 text-xl leading-snug font-semibold tracking-tight text-foreground">
                {user.fullName}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Email đăng nhập — chỉnh tại mục Sửa nhân sự nếu được phép.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSectionField label="Email" icon={Mail}>
                <a
                  href={`mailto:${user.email}`}
                  className="font-mono text-sm font-medium break-all text-primary underline-offset-4 hover:underline"
                >
                  {user.email}
                </a>
              </FieldSectionField>

              <FieldSectionField label="Số điện thoại" icon={Phone}>
                {user.phone ? (
                  <a
                    href={telHref(user.phone)}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {user.phone}
                  </a>
                ) : (
                  <DetailEmpty label="Chưa cập nhật" />
                )}
              </FieldSectionField>

              <FieldSectionField label="Căn cước công dân" icon={Fingerprint}>
                {user.citizenId?.trim() ? (
                  <span className="font-mono font-medium tracking-wide">
                    {user.citizenId}
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
                {user.address ? (
                  <p className="leading-relaxed font-medium whitespace-pre-wrap">
                    {user.address}
                  </p>
                ) : (
                  <DetailEmpty label="Chưa cập nhật" />
                )}
              </FieldSectionField>
            </div>
          </div>
        </div>
      </FieldSetContent>
    </FieldSet>
  )
}
