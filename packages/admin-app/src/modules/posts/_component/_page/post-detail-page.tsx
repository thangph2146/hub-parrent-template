"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  User,
  ImageIcon,
  FileText,
  Link,
  Tags,
  Globe,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionBadge,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import { useAdminAuth as useAuth, useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
  AdminDetailPageHeader,
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "@ui/components/admin"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { normalizeContentForEditor, formatDateTime } from "../shared/utils"
import { usePostDetailQuery } from "../_query"

const LexicalEditor = dynamic(
  () =>
    import("@thangph2146/lexical-editor").then((mod) => ({
      default: mod.LexicalEditor,
    })),
  { ssr: false }
)

function PostDetailInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("posts")
  const params = useParams()
  const postId = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_UPDATE)
    : false

  const { data: post, isLoading, error } = usePostDetailQuery(api, postId)

  useEffect(() => {
    if (error) {
      toast.error("Không tải được bài viết")
      crudNav.list()
    }
  }, [error, crudNav])

  if (isLoading) {
    return <AdminPageLoading />
  }

  if (!post) return null

  const content = normalizeContentForEditor(post.content)
  const previewPath = post.slug ? `/bai-viet/${post.slug}` : "—"

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết bài viết"
        subtitle="Quản lý bài viết và nội dung xuất bản."
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(postId)) : undefined}
      />

      <AdminDetailLayout className="my-6">
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend icon={FileText} title="Nội dung chi tiết" />
            <FieldSetContent variant="section" className="pt-0">
              {content ? (
                <LexicalEditor
                  value={content}
                  readOnly
                  className="mx-auto max-w-4xl"
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Bài viết chưa có nội dung
                </p>
              )}
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <FieldSet variant="section">
            <FieldSectionLegend icon={ImageIcon} title="Hình ảnh đại diện" />
            <FieldSetContent variant="section" className="pt-0">
              {post.image ? (
                <div className="overflow-hidden rounded-lg border border-border/70">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có ảnh đại diện.
                </p>
              )}
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FileText}
              title="Thông tin cơ bản"
              description="Tiêu đề, slug và mô tả ngắn."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FieldSectionField label="Tiêu đề" icon={FileText}>
                <p className="whitespace-pre-wrap">{post.title}</p>
              </FieldSectionField>
              <FieldSectionField label="Slug" icon={Link}>
                <p className="text-muted-foreground">{post.slug || "—"}</p>
              </FieldSectionField>
              <FieldSectionField label="Đường dẫn công khai" icon={Globe}>
                <p className="font-mono text-xs break-all text-muted-foreground">
                  {previewPath}
                </p>
              </FieldSectionField>
              {post.excerpt ? (
                <FieldSectionField label="Mô tả ngắn">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {post.excerpt}
                  </p>
                </FieldSectionField>
              ) : null}
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Calendar}
              title="Xuất bản"
              description="Trạng thái hiển thị và thời điểm phát hành."
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <FieldSectionField label="Trạng thái">
                {post.published ? (
                  <Badge>Đã xuất bản</Badge>
                ) : (
                  <Badge variant="outline">Bản nháp</Badge>
                )}
              </FieldSectionField>
              {post.publishedAt ? (
                <FieldSectionField
                  label="Ngày xuất bản"
                  icon={Calendar}
                  valueClassName="tabular-nums font-medium"
                >
                  {formatDateTime(post.publishedAt)}
                </FieldSectionField>
              ) : null}
              <FieldSectionField label="Tác giả" icon={User}>
                {post.author.name ?? post.author.email}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tags}
              title="Phân loại"
              badge={
                <FieldSectionBadge>
                  {post.categories.length + post.tags.length}
                </FieldSectionBadge>
              }
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FieldSectionField label="Danh mục" icon={Tags}>
                {post.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {post.categories.map((cat: { id: number | string; name: string }) => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Chưa phân loại</p>
                )}
              </FieldSectionField>
              <FieldSectionField label="Thẻ">
                {post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag: { id: number | string; name: string }) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Chưa có thẻ</p>
                )}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Clock}
              title="Thời gian"
              description="Mốc tạo và cập nhật bài viết."
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <FieldSectionField
                label="Ngày tạo"
                icon={Calendar}
                valueClassName="font-medium"
              >
                {formatDateTime(post.createdAt)}
              </FieldSectionField>
              <FieldSectionField
                label="Cập nhật lần cuối"
                icon={Clock}
                valueClassName="font-medium"
              >
                {formatDateTime(post.updatedAt)}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function PostDetailPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.POSTS_VIEW}>
      <PostDetailInner />
    </AdminPageGuard>
  )
}
