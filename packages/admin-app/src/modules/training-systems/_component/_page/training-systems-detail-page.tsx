"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import { Calendar, Clock, Building2, Hash } from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  FieldSet,
  FieldSetContent,
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
import { useAdminApi,useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { useTrainingSystemDetailQuery } from "../_query"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function TrainingSystemDetailInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("training-systems")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.TRAINING_SYSTEMS_UPDATE)
    : false

  const {
    data: entity,
    isLoading,
    isError,
  } = useTrainingSystemDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được hệ đào tạo")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!entity) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Hệ đào tạo</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {entity.code || "—"}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Building2}
              title="Thông tin hệ đào tạo"
              description="Mã hệ đào tạo và trạng thái."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField
                  label="Mã hệ đào tạo"
                  icon={Hash}
                  valueClassName="font-mono font-medium"
                >
                  {entity.code || "—"}
                </FieldSectionField>
                <FieldSectionField label="Trạng thái" icon={Building2}>
                  {entity.status === 1 ? (
                    <Badge variant="default">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Tắt</Badge>
                  )}
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
                  {formatDateTime(entity.createdAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Cập nhật lần cuối"
                  icon={Clock}
                  valueClassName="font-medium"
                >
                  {formatDateTime(entity.updatedAt)}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function TrainingSystemDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <TrainingSystemDetailInner />
    </AdminPageGuard>
  )
}
