"use client"

import { useParams } from "next/navigation"
import {
  Loader2,
  ArrowLeft,
  Globe,
  Hash,
  FileText,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailPageHeader,
  AdminDetailSidebar,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { api } from "@workspace/admin-app/lib/api"
import { useSeoMetaDetailQuery } from "../_component"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function SeoMetaDetailInner() {
  const crudNav = useAdminModuleNavigation("seo-metas")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_UPDATE)
    : false

  const { data: detail, isLoading, isError } = useSeoMetaDetailQuery(api, id)

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !detail) {
    return (
      <AdminPageSection>
        <p className="text-destructive">Không tìm thấy SEO metadata.</p>
        <Button type="button" variant="outline" onClick={() => crudNav.list()}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
      </AdminPageSection>
    )
  }

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={`SEO: ${detail.page}`}
        subtitle={`Chi tiết SEO metadata cho trang "${detail.page}"`}
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FileText}
              title="Thông tin cơ bản"
              description="Metadata SEO cho trang."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FieldSectionField
                label="Đường dẫn"
                icon={Hash}
                valueClassName="font-mono font-medium"
              >
                {detail.page}
              </FieldSectionField>
              <FieldSectionField label="Trạng thái" icon={FileText}>
                {detail.status === 1 ? (
                  <Badge variant="default" className="text-[10px]">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Tắt
                  </Badge>
                )}
              </FieldSectionField>
              <FieldSectionDivider />
              <FieldSectionField label="Title SEO" icon={FileText}>
                {detail.title ?? "—"}
              </FieldSectionField>
              <FieldSectionField label="Mô tả" icon={FileText}>
                {detail.description ?? "—"}
              </FieldSectionField>
              <FieldSectionField label="Từ khóa" icon={Hash}>
                {detail.keywords ?? "—"}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend icon={Calendar} title="Thời gian" />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <div className="grid gap-4 sm:grid-cols-3">
                <FieldSectionField
                  label="Tạo lúc"
                  icon={Calendar}
                  valueClassName="font-medium"
                >
                  {formatDateTime(detail.createdAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Cập nhật lúc"
                  icon={Clock}
                  valueClassName="font-medium"
                >
                  {formatDateTime(detail.updatedAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Xóa lúc"
                  icon={Trash2}
                  valueClassName="font-medium"
                >
                  {formatDateTime(detail.deletedAt)}
                </FieldSectionField>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend icon={Globe} title="Open Graph" />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField label="OG Title" icon={Globe}>
                  {detail.ogTitle ?? "—"}
                </FieldSectionField>
                <FieldSectionField label="OG Mô tả" icon={Globe}>
                  {detail.ogDescription ?? "—"}
                </FieldSectionField>
                <FieldSectionField label="OG Ảnh" icon={Globe}>
                  {detail.ogImage ? (
                    <img
                      src={detail.ogImage}
                      alt="OG Image"
                      className="mt-1 max-h-32 rounded border object-cover"
                    />
                  ) : (
                    "—"
                  )}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function SeoMetaDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <SeoMetaDetailInner />
    </AdminPageGuard>
  )
}
