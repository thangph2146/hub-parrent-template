"use client"

import { useEffect, createElement } from "react"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  Hash,
  Tag,
  FileText,
  File,
  ChevronRight,
} from "lucide-react"
import { resolveIcon } from "@ui/lib/icons"
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
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { api } from "@/lib/api"
import { formatDateTime, useTagDetailQuery } from "../_component"
import type { LucideIcon } from "lucide-react"

function ListItem({
  icon: Icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  badge?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 border-0 border-t border-slate-100 px-5 py-3.5 text-left transition-colors first:border-t-0 hover:bg-slate-50 dark:border-border/60 dark:hover:bg-muted/40"
      onClick={onClick}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {badge}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

function TagDetailInner() {
  const crudNav = useAdminCrudNavigation("/tags")
  const postsNav = useAdminCrudNavigation("/posts")
  const params = useParams()
  const tagId = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.TAGS_UPDATE)
    : false

  const { data: tag, isLoading, isError } = useTagDetailQuery(api, tagId)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được thẻ")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!tag) return null

  const ResolvedIcon = tag.icon ? resolveIcon(tag.icon) : null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={
          <span className="flex items-center gap-2">
            {ResolvedIcon &&
              createElement(ResolvedIcon, {
                className: "size-11 text-primary",
              })}
            {tag.name}
          </span>
        }
        subtitle={
          <>
            <span className="text-muted-foreground/60">Thẻ</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {tag.slug}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(tagId)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tag}
              title="Thông tin thẻ"
              description="Slug và các thông tin cơ bản."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField label="Slug / đường dẫn" icon={Hash}>
                  <p className="font-mono font-medium">{tag.slug}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">
                    /the/{tag.slug}
                  </p>
                </FieldSectionField>
                <FieldSectionField label="Bài viết gắn thẻ" icon={FileText}>
                  <p className="font-medium">{tag.postCount ?? 0} bài</p>
                </FieldSectionField>
              </div>

              <FieldSectionDivider />

              <FieldSectionField label="Biểu tượng" icon={FileText}>
                {ResolvedIcon ? (
                  <div className="flex items-center gap-2">
                    {createElement(ResolvedIcon, {
                      className: "size-5 text-primary",
                    })}
                    <span className="font-mono text-xs text-muted-foreground">
                      {tag.icon}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Không có
                  </span>
                )}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          {tag.posts.length > 0 && (
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={File}
                title="Bài viết liên quan"
                description={`${tag.postCount} bài viết được gắn thẻ này.`}
                badge={<FieldSectionBadge>{tag.postCount}</FieldSectionBadge>}
              />
              <FieldSetContent
                variant="section"
                className="overflow-hidden px-0 pt-0 pb-0"
              >
                <div className="flex flex-col">
                  {tag.posts.map((post) => (
                    <ListItem
                      key={post.id}
                      icon={File}
                      title={post.title}
                      subtitle={formatDateTime(post.createdAt)}
                      badge={
                        <Badge
                          variant={post.published ? "default" : "outline"}
                          className="shrink-0"
                        >
                          {post.published ? "Đã đăng" : "Nháp"}
                        </Badge>
                      }
                      onClick={() => postsNav.view(String(post.id))}
                    />
                  ))}
                </div>
              </FieldSetContent>
            </FieldSet>
          )}
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Calendar}
                title="Thời gian & Thống kê"
                description="Mốc thời gian và số lượng bài viết."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField
                  label="Ngày tạo"
                  icon={Calendar}
                  valueClassName="font-medium"
                >
                  {formatDateTime(tag.createdAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Cập nhật lần cuối"
                  icon={Clock}
                  valueClassName="font-medium"
                >
                  {formatDateTime(tag.updatedAt)}
                </FieldSectionField>
                <FieldSectionField
                  label="Bài viết"
                  icon={File}
                  valueClassName="font-medium"
                >
                  {tag.postCount ?? 0} bài
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function TagDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <TagDetailInner />
    </AdminPageGuard>
  )
}
