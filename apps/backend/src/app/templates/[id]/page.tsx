"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  LayoutTemplate,
  Fingerprint,
  FileJson,
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
import { api } from "@/lib/api"
import { useTemplateDetailQuery } from "../_component"
import { useAuth } from "@/providers/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN")
}

function DetailInner() {
  const crudNav = useAdminCrudNavigation("/templates")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.TEMPLATES_UPDATE)
    : false

  const { data: e, isLoading, isError } = useTemplateDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được mẫu")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!e) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={e.name || "Mẫu"}
        subtitle={
          <span className="text-muted-foreground/60">Mẫu hiển thị</span>
        }
        variant="entity"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={LayoutTemplate}
              title="Thông tin mẫu"
              description="Thông tin cơ bản của mẫu hiển thị."
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
                  <FieldSectionField label="Mã mẫu" icon={Fingerprint}>
                    {e.code}
                  </FieldSectionField>
                </>
              )}

              {e.content != null && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Nội dung" icon={FileJson}>
                    <pre className="max-h-48 overflow-auto rounded-lg border border-border/40 bg-muted/20 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {typeof e.content === "string"
                        ? e.content
                        : JSON.stringify(e.content, null, 2)}
                    </pre>
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

export default function TemplateDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <DetailInner />
    </AdminPageGuard>
  )
}
