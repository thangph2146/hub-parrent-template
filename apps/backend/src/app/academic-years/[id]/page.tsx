"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, CalendarDays } from "lucide-react";
import { Badge } from "@ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { AdminPageGuard, AdminPageSection, AdminPageLoading, AdminDetailPageHeader, AdminDetailLayout, AdminDetailMain, AdminDetailSidebar } from "@ui/components/admin";
import { useAuth } from "@/providers/auth-provider";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { useAcademicYearDetailQuery } from "../_component";


function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
}

function AcademicYearDetailInner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.ACADEMIC_YEARS_UPDATE) : false;

  const { data: entity, isLoading, isError } = useAcademicYearDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được niên khóa");
      router.push("/academic-years");
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
        subtitle={<span className="text-muted-foreground/60">Niên khóa</span>}
        variant="module"
        onBack={() => router.push("/academic-years")}
        onEdit={
          canUpdate ? () => router.push(`/academic-years/${id}/edit`) : undefined
        }
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <Card className="border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="size-5 text-primary" />
                Thông tin niên khóa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Calendar className="size-3" />
                    Ngày bắt đầu
                  </p>
                  <p className="mt-1 text-sm text-foreground">{formatDate(entity.startDate)}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Calendar className="size-3" />
                    Ngày kết thúc
                  </p>
                  <p className="mt-1 text-sm text-foreground">{formatDate(entity.endDate)}</p>
                </div>
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

export default function AcademicYearDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <AcademicYearDetailInner />
    </AdminPageGuard>
  );
}
