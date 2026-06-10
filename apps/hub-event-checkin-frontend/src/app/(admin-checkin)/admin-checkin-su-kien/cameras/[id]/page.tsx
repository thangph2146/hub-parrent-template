"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  Camera,
  Monitor,
  User,
  Cable,
  Fingerprint,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
  AdminDetailPageHeader,
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import { useCameraDetailQuery } from "../_component"
import { useAuth } from "@/providers/admin/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN")
}

function DetailInner() {
  const crudNav = useAdminCrudNavigation("/admin-checkin-su-kien/cameras")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.CAMERAS_UPDATE)
    : false

  const { data: e, isLoading, isError } = useCameraDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được camera")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!e) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={e.name || "Camera"}
        subtitle={<span className="text-muted-foreground/60">Camera</span>}
        variant="entity"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Camera}
              title="Thông tin camera"
              description="Thông tin kết nối và cấu hình camera."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-2xl font-bold">{e.name || "—"}</p>
                {e.status === 0 ? (
                  <Badge variant="outline" className="rounded-full px-3 py-0.5">
                    Khóa
                  </Badge>
                ) : (
                  <Badge
                    variant="default"
                    className="rounded-full px-3 py-0.5 shadow-sm"
                  >
                    Hoạt động
                  </Badge>
                )}
              </div>

              {(e.code || e.ipAddress) && (
                <>
                  <FieldSectionDivider />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {e.code && (
                      <FieldSectionField label="Mã camera" icon={Fingerprint}>
                        {e.code}
                      </FieldSectionField>
                    )}
                    {e.ipAddress && (
                      <FieldSectionField label="Địa chỉ IP" icon={Cable}>
                        {e.ipAddress}
                      </FieldSectionField>
                    )}
                  </div>
                </>
              )}

              <FieldSectionDivider />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField
                  label="Cổng"
                  icon={Monitor}
                  valueClassName="font-mono"
                >
                  {e.port || "—"}
                </FieldSectionField>
                <FieldSectionField
                  label="Tên đăng nhập"
                  icon={User}
                  valueClassName="font-mono"
                >
                  {e.username || "—"}
                </FieldSectionField>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Calendar}
                title="Thời gian"
                description="Mốc thời gian tạo và cập nhật."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField
                  label="Ngày tạo"
                  icon={Calendar}
                  valueClassName="font-medium"
                >
                  {formatDateTime(e.createdAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Cập nhật lần cuối"
                  icon={Clock}
                  valueClassName="font-medium"
                >
                  {formatDateTime(e.updatedAt)}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function CameraDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <DetailInner />
    </AdminPageGuard>
  )
}
