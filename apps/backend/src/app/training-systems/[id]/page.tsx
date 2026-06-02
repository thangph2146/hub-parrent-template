"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Pencil, Calendar, Clock, Building2, Hash } from "lucide-react";
import { PageSection } from "@ui/components/layout";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { AdminPageGuard, AdminPageSection, AdminPageLoading, AdminDetailPageHeader, AdminDetailLayout, AdminDetailMain, AdminDetailSidebar } from "@ui/components/admin";
import { useAuth } from "@/providers/auth-provider";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { useTrainingSystemDetailQuery } from "../_component";
import { TypographyH1 } from "@ui/components/typography";
import {
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_PRIMARY_CLASS,
} from "@ui/lib/layout-shell";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function TrainingSystemDetailInner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.TRAINING_SYSTEMS_UPDATE) : false;

  const { data: entity, isLoading, isError } = useTrainingSystemDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được hệ đào tạo");
      router.push("/training-systems");
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <AdminPageLoading />
    );
  }

  if (!entity) return null;

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
        onBack={() => router.push("/training-systems")}
        onEdit={
          canUpdate ? () => router.push(`/training-systems/${id}/edit`) : undefined
        }
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <Card className="border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5 text-primary" />
                Thông tin hệ đào tạo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Hash className="size-3" />
                    Mã hệ đào tạo
                  </p>
                  <p className="mt-1 font-mono text-sm text-foreground">{entity.code || "—"}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Badge variant="outline" className="size-3" />
                    Trạng thái
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {entity.status === 1 ? (
                      <Badge variant="default">Hoạt động</Badge>
                    ) : (
                      <Badge variant="outline">Tắt</Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <Card className="border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="size-5 text-primary" />
                Thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                  <Calendar className="size-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày tạo</p>
                  <p className="text-sm font-medium">{formatDateTime(entity.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                  <Clock className="size-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="text-sm font-medium">{formatDateTime(entity.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  );
}

export default function TrainingSystemDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <TrainingSystemDetailInner />
    </AdminPageGuard>
  );
}
