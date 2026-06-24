"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import { Calendar, Clock, CalendarDays, Hash } from "lucide-react"
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
import { useAcademicYearDetailQuery } from "../_query"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function formatDateText(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN")
}

function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string | null {
  const start = formatDateText(startDate)
  const end = formatDateText(endDate)
  if (start === "—" && end === "—") return null
  if (start !== "—" && end !== "—") return `${start} — ${end}`
  return start !== "—" ? start : end
}

function AcademicYearDetailInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("academic-years")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.ACADEMIC_YEARS_UPDATE)
    : false

  const {
    data: entity,
    isLoading,
    isError,
  } = useAcademicYearDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được niên khóa")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!entity) return null

  const dateRange = formatDateRange(entity.startDate, entity.endDate)

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Niên khóa</span>
            {dateRange && (
              <>
                <span className="mx-1.5 text-muted-foreground/40">/</span>
                <span className="font-mono text-sm">{dateRange}</span>
              </>
            )}
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
              icon={CalendarDays}
              title="Thời gian"
              description="Ngày bắt đầu và kết thúc của niên khóa."
            />
            <FieldSetContent variant="section" className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField
                  label="Ngày bắt đầu"
                  icon={Calendar}
                  valueClassName="font-mono font-medium"
                >
                  {formatDateText(entity.startDate)}
                </FieldSectionField>
                <FieldSectionField
                  label="Ngày kết thúc"
                  icon={Calendar}
                  valueClassName="font-mono font-medium"
                >
                  {formatDateText(entity.endDate)}
                </FieldSectionField>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Hash}
                title="Trạng thái"
                description="Trạng thái hoạt động của niên khóa."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField label="Trạng thái" icon={CalendarDays}>
                  {entity.status === 1 ? (
                    <Badge variant="default">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Tắt</Badge>
                  )}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>

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

export default function AcademicYearDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <AcademicYearDetailInner />
    </AdminPageGuard>
  )
}
