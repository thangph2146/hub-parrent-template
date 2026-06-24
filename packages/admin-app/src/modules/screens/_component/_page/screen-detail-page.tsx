"use client"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  Monitor,
  Camera,
  Layout,
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
import { useScreenDetailQuery } from "../_query"
import { useAdminAuth as useAuth, useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN")
}

function DetailInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("screens")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.SCREENS_UPDATE)
    : false

  const { data: e, isLoading, isError } = useScreenDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được màn hình")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!e) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={e.name || "Màn hình"}
        subtitle={<span className="text-muted-foreground/60">Màn hình</span>}
        variant="entity"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Monitor}
              title="Thông tin màn hình"
              description="Thông tin cấu hình hiển thị của màn hình."
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

              {e.code && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Mã màn hình" icon={Fingerprint}>
                    {e.code}
                  </FieldSectionField>
                </>
              )}

              <FieldSectionDivider />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField label="Camera" icon={Camera}>
                  {e.cameraName || "—"}
                </FieldSectionField>
                <FieldSectionField label="Template" icon={Layout}>
                  {e.templateName || "—"}
                </FieldSectionField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField
                  label="Camera ID"
                  icon={Camera}
                  valueClassName="font-mono text-sm"
                >
                  {e.cameraId || "—"}
                </FieldSectionField>
                <FieldSectionField
                  label="Template ID"
                  icon={Layout}
                  valueClassName="font-mono text-sm"
                >
                  {e.templateId || "—"}
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

export default function ScreenDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <DetailInner />
    </AdminPageGuard>
  )
}
