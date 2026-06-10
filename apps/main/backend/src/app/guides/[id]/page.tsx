"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
  Hash,
  Layers,
  ListOrdered,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionBadge,
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
import { useAuth } from "@/providers/auth-provider"
import { api } from "@/lib/api"
import {
  formatDateTime,
  PERMISSION_CODES,
  canUserAccess,
} from "@workspace/api-client"
import { useGuideDetailQuery, parseContent } from "../_component"

function GuideDetailInner() {
  const crudNav = useAdminCrudNavigation("/guides")
  const params = useParams()
  const guideId = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.PAGE_CONTENTS_UPDATE)
    : false

  const { data: guide, isLoading, isError } = useGuideDetailQuery(api, guideId)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được nhóm hướng dẫn")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) {
    return <AdminPageLoading />
  }

  if (!guide) return null

  const content = parseContent(guide.content)
  const steps = content.steps ?? []

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={content.title || guide.sectionKey}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Hướng dẫn</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {guide.sectionKey}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(guideId)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          {steps.length > 0 && (
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Layers}
                title="Các bước thực hiện"
                badge={<FieldSectionBadge>{steps.length}</FieldSectionBadge>}
              />
              <FieldSetContent variant="section" className="space-y-4 pt-0">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {step.order ?? idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      {step.imageUrl && (
                        <img
                          src={step.imageUrl}
                          alt={step.title}
                          className="mt-2 max-h-48 w-auto rounded-lg border"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </FieldSetContent>
            </FieldSet>
          )}
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={BookOpen}
                title="Thông tin nhóm hướng dẫn"
                description="Mã nhóm, thứ tự và mô tả."
              />
              <FieldSetContent variant="section" className="space-y-4 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldSectionField label="Section Key" icon={Hash}>
                    <p className="font-mono font-medium">{guide.sectionKey}</p>
                  </FieldSectionField>
                  <FieldSectionField label="Thứ tự" icon={ListOrdered}>
                    <p className="font-medium">{content.order ?? 0}</p>
                  </FieldSectionField>
                </div>

                {content.description && (
                  <>
                    <FieldSectionDivider />
                    <FieldSectionField label="Mô tả">
                      <p className="text-sm leading-relaxed">
                        {content.description}
                      </p>
                    </FieldSectionField>
                  </>
                )}
              </FieldSetContent>
            </FieldSet>

            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Calendar}
                title="Thời gian"
                description="Mốc tạo và cập nhật nhóm hướng dẫn."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField
                  label="Ngày tạo"
                  icon={Calendar}
                  valueClassName="font-medium"
                >
                  {formatDateTime(guide.createdAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Cập nhật lần cuối"
                  icon={Clock}
                  valueClassName="font-medium"
                >
                  {formatDateTime(guide.updatedAt)}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>

            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Layers}
                title="Trạng thái"
                description="Hiển thị công khai trên frontend."
              />
              <FieldSetContent variant="section" className="pt-0">
                <FieldSectionField
                  label="Hiển thị"
                  icon={guide.isVisible ? Eye : EyeOff}
                >
                  <Badge variant={guide.isVisible ? "default" : "secondary"}>
                    {guide.isVisible ? "Công khai" : "Ẩn"}
                  </Badge>
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function GuideDetailPage() {
  return (
    <AdminPageGuard permission="page_contents:view">
      <GuideDetailInner />
    </AdminPageGuard>
  )
}
