"use client";

import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { AdminDetailLayout, AdminDetailMain, AdminDetailPageHeader, AdminDetailSidebar, AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { useAuth } from "@/providers/auth-provider";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { useSeoMetaDetailQuery } from "../_component";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function SeoMetaDetailInner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.SEO_METAS_UPDATE) : false;

  const { data: detail, isLoading, isError } = useSeoMetaDetailQuery(api, id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <AdminPageSection>
        <p className="text-destructive">Không tìm thấy SEO metadata.</p>
        <Button type="button" variant="outline" onClick={() => router.push("/seo-metas")}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
      </AdminPageSection>
    );
  }

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={`SEO: ${detail.page}`}
        subtitle={`Chi tiết SEO metadata cho trang "${detail.page}"`}
        variant="module"
        onBack={() => router.push("/seo-metas")}
        onEdit={canUpdate ? () => router.push(`/seo-metas/${id}/edit`) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đường dẫn</p>
                <p className="text-sm font-mono">{detail.page}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                {detail.status === 1 ? (
                  <Badge variant="default" className="text-[10px]">Hoạt động</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Tắt</Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title SEO</p>
                <p className="text-sm">{detail.title ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                <p className="text-sm">{detail.description ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Từ khóa</p>
                <p className="text-sm">{detail.keywords ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thời gian</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tạo lúc</p>
                <p className="text-sm">{formatDateTime(detail.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cập nhật lúc</p>
                <p className="text-sm">{formatDateTime(detail.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Xóa lúc</p>
                <p className="text-sm">{formatDateTime(detail.deletedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <Card>
            <CardHeader>
              <CardTitle>Open Graph</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OG Title</p>
                <p className="text-sm">{detail.ogTitle ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">OG Mô tả</p>
                <p className="text-sm">{detail.ogDescription ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">OG Ảnh</p>
                {detail.ogImage ? (
                  <div className="mt-1">
                    <img
                      src={detail.ogImage}
                      alt="OG Image"
                      className="max-h-32 rounded border object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-sm">—</p>
                )}
              </div>
            </CardContent>
          </Card>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  );
}

export default function SeoMetaDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <SeoMetaDetailInner />
    </AdminPageGuard>
  );
}
