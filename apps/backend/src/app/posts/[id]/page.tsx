"use client";

import { useEffect, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  ImageIcon,
  FileText,
  Link,
  Tags,
  Globe,
} from "lucide-react";
import { Divider } from "@ui/components/layout";
import { Badge } from "@ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useAuth } from "@/providers/auth-provider";
import { AdminPageGuard, AdminPageSection, AdminPageLoading, AdminDetailPageHeader, AdminDetailLayout, AdminDetailMain, AdminDetailSidebar } from "@ui/components/admin";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { normalizeContentForEditor, formatDateTime } from "../_component";
import { usePostDetailQuery } from "../_component/_query";

const LexicalEditor = dynamic(
  () =>
    import("@thangph2146/lexical-editor").then((mod) => ({
      default: mod.LexicalEditor,
    })),
  { ssr: false },
);

function DetailField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3" /> : null}
        {label}
      </p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function PostDetailInner() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.POSTS_UPDATE)
    : false;

  const { data: post, isLoading, error } = usePostDetailQuery(api, postId);

  useEffect(() => {
    if (error) {
      toast.error("Không tải được bài viết");
      router.push("/posts");
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <AdminPageLoading />
    );
  }

  if (!post) return null;

  const content = normalizeContentForEditor(post.content);
  const previewPath = post.slug ? `/bai-viet/${post.slug}` : "—";

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết bài viết"
        subtitle="Quản lý bài viết và nội dung xuất bản."
        variant="module"
        onBack={() => router.push("/posts")}
        onEdit={
          canUpdate ? () => router.push(`/posts/${postId}/edit`) : undefined
        }
      />

      <AdminDetailLayout className="my-6">
        <AdminDetailMain>
          {content ? (
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-primary" />
                  Nội dung chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LexicalEditor value={content} readOnly className="max-w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-primary" />
                  Nội dung chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic text-muted-foreground">
                  Bài viết chưa có nội dung
                </p>
              </CardContent>
            </Card>
          )}
        </AdminDetailMain>

        <AdminDetailSidebar>
          <Card className="sticky top-2 max-h-[calc(100vh-6rem)] overflow-y-auto border border-border/70 shadow-sm">
            <CardContent className="space-y-0">
              <Divider label="Hình ảnh đại diện" className="my-6" />
              {post.image ? (
                <div className="mb-4 overflow-hidden rounded-lg border border-border/70">
                  <p className="flex items-center gap-1.5 border-b border-border/70 bg-muted/30 px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <ImageIcon className="size-3" /> Hình ảnh đại diện
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
              ) : (
                <p className="mb-4 text-sm text-muted-foreground">
                  Chưa có ảnh đại diện.
                </p>
              )}

              <Divider label="Thông tin cơ bản" className="my-6" />
              <div className="grid gap-4">
                <DetailField label="Tiêu đề" icon={FileText}>
                  <p className="whitespace-pre-wrap rounded-lg border border-border/70 p-2">
                    {post.title}
                  </p>
                </DetailField>
                <DetailField label="Slug" icon={Link}>
                  <p className="rounded-lg border border-border/70 p-2 text-muted-foreground">
                    {post.slug || "—"}
                  </p>
                </DetailField>
                <DetailField label="Đường dẫn công khai" icon={Globe}>
                  <p className="break-all rounded-lg border border-border/70 p-2 font-mono text-xs text-muted-foreground">
                    {previewPath}
                  </p>
                </DetailField>
                {post.excerpt ? (
                  <DetailField label="Mô tả ngắn">
                    <p className="whitespace-pre-wrap rounded-lg border border-border/70 p-2 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </DetailField>
                ) : null}
              </div>

              <Divider label="Xuất bản" className="my-6" />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {post.published ? (
                    <Badge>Đã xuất bản</Badge>
                  ) : (
                    <Badge variant="outline">Bản nháp</Badge>
                  )}
                </div>
                {post.publishedAt ? (
                  <DetailField label="Ngày xuất bản" icon={Calendar}>
                    <p className="rounded-lg border border-border/70 p-2 tabular-nums">
                      {formatDateTime(post.publishedAt)}
                    </p>
                  </DetailField>
                ) : null}
                <DetailField label="Tác giả" icon={User}>
                  <p className="rounded-lg border border-border/70 p-2">
                    {post.author.name ?? post.author.email}
                  </p>
                </DetailField>
              </div>

              <Divider label="Phân loại" className="my-6" />
              <div className="space-y-4">
                <DetailField label="Danh mục" icon={Tags}>
                  {post.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 rounded-lg border border-border/70 p-2">
                      {post.categories.map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="text-xs">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground">Chưa phân loại</p>
                  )}
                </DetailField>
                <DetailField label="Thẻ">
                  {post.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 rounded-lg border border-border/70 p-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground">Chưa có thẻ</p>
                  )}
                </DetailField>
              </div>

              <Divider label="Thời gian" className="my-6" />
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                    <Calendar className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(post.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                    <Clock className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cập nhật lần cuối
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateTime(post.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  );
}

export default function PostDetailPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.POSTS_VIEW}>
      <PostDetailInner />
    </AdminPageGuard>
  );
}
