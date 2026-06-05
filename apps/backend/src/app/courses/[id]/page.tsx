"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, BookOpen, CalendarDays, Hash } from "lucide-react";
import { Badge } from "@ui/components/badge";
import {
  FieldSet,
  FieldSetContent,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field";
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
  AdminDetailPageHeader,
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "@ui/components/admin";
import { useAuth } from "@/providers/auth-provider";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { useCourseDetailQuery } from "../_component";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function formatDepartmentCode(value: number | null | undefined): string {
  if (value == null) return "—";
  return String(value);
}

function CourseDetailInner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.COURSES_UPDATE) : false;

  const { data: entity, isLoading, isError } = useCourseDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được khóa học");
      router.push("/courses");
    }
  }, [isError, router]);

  if (isLoading) return <AdminPageLoading />;
  if (!entity) return null;

  const departmentCode = formatDepartmentCode(entity.departmentId);

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Khóa học</span>
            {entity.departmentId != null && (
              <>
                <span className="mx-1.5 text-muted-foreground/40">/</span>
                <span className="font-mono">{departmentCode}</span>
              </>
            )}
          </>
        }
        variant="module"
        onBack={() => router.push("/courses")}
        onEdit={canUpdate ? () => router.push(`/courses/${id}/edit`) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={BookOpen}
              title="Thông tin khóa học"
              description="Mã khoa liên kết."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FieldSectionField label="Mã khoa" icon={Hash} valueClassName="font-mono font-medium">
                {departmentCode}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={CalendarDays}
              title="Thời gian"
              description="Năm bắt đầu và kết thúc của khóa học."
            />
            <FieldSetContent variant="section" className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField label="Năm bắt đầu" icon={CalendarDays} valueClassName="font-medium">
                  {entity.startYear ?? "—"}
                </FieldSectionField>
                <FieldSectionField label="Năm kết thúc" icon={CalendarDays} valueClassName="font-medium">
                  {entity.endYear ?? "—"}
                </FieldSectionField>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Hash}
                title="Trạng thái"
                description="Trạng thái hoạt động của khóa học."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField label="Trạng thái" icon={BookOpen}>
                  {entity.status === 1 ? (
                    <Badge variant="default">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Tắt</Badge>
                  )}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>

            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Calendar}
                title="Thời gian"
                description="Mốc thời gian tạo và cập nhật."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField label="Ngày tạo" icon={Calendar} valueClassName="font-medium">
                  {formatDateTime(entity.createdAt)}
                </FieldSectionField>
                <FieldSectionField label="Cập nhật lần cuối" icon={Clock} valueClassName="font-medium">
                  {formatDateTime(entity.updatedAt)}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  );
}

export default function CourseDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <CourseDetailInner />
    </AdminPageGuard>
  );
}
