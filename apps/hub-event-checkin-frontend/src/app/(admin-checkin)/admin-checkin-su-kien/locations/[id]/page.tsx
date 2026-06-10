"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { toast } from "@ui/components/sonner"
import { Calendar, Clock, MapPin, Globe } from "lucide-react"

const LocationMap = dynamic(
  () => import("@ui/components/admin/maps").then((m) => m.LocationMap),
  { ssr: false }
)

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
import { useAuth } from "@/providers/admin/auth-provider"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { api } from "@/lib/admin/api"
import { useLocationDetailQuery } from "../_component"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function LocationDetailInner() {
  const crudNav = useAdminCrudNavigation("/admin-checkin-su-kien/locations")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.LOCATIONS_UPDATE)
    : false

  const { data: entity, isLoading, isError } = useLocationDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được địa điểm")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!entity) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name || "Địa điểm"}
        subtitle={<span className="text-muted-foreground/60">Địa điểm</span>}
        variant="entity"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={MapPin}
              title="Thông tin địa điểm"
              description="Thông tin cơ bản của địa điểm."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-2xl font-bold">{entity.name || "—"}</p>
                {entity.status === 0 ? (
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

              {entity.address && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Địa chỉ" icon={MapPin}>
                    {entity.address}
                  </FieldSectionField>
                </>
              )}

              {entity.mapUrl && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Bản đồ" icon={Globe}>
                    <LocationMap
                      mapUrl={entity.mapUrl}
                      name={entity.name ?? undefined}
                      address={entity.address ?? undefined}
                    />
                  </FieldSectionField>
                </>
              )}
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

export default function LocationDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <LocationDetailInner />
    </AdminPageGuard>
  )
}
