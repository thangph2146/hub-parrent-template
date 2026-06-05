"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, Building2, Hash, Tag } from "lucide-react";
import { Badge } from "@ui/components/badge";
import {
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
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
import { useDepartmentDetailQuery } from "../_component";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function DepartmentDetailInner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.DEPARTMENTS_UPDATE)
    : false;

  const { data: entity, isLoading, isError } = useDepartmentDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được phòng khoa");
      router.push("/departments");
    }
  }, [isError, router]);

  if (isLoading) return <AdminPageLoading />;
  if (!entity) return null;

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name || "Phòng khoa"}
        subtitle={<span className="text-muted-foreground/60">Phòng khoa</span>}
        variant="entity"
        onBack={() => router.push("/departments")}
        onEdit={canUpdate ? () => router.push(`/departments/${id}/edit`) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Building2}
              title="Thông tin phòng khoa"
              description="Thông tin cơ bản của phòng khoa."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-2xl font-bold">{entity.name || "—"}</p>
                {entity.status === 0 ? (
                  <Badge variant="outline" className="rounded-full px-3 py-0.5">
                    Khóa
                  </Badge>
                ) : (
                  <Badge variant="default" className="rounded-full px-3 py-0.5 shadow-sm">
                    Hoạt động
                  </Badge>
                )}
              </div>

              {entity.code && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Mã phòng khoa" icon={Hash}>
                    <p className="rounded-lg border border-border/40 bg-muted/20 p-3 font-mono text-sm whitespace-pre-wrap">
                      {entity.code}
                    </p>
                  </FieldSectionField>
                </>
              )}

              {entity.description && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Mô tả" icon={Tag}>
                    <p className="rounded-lg border border-border/40 bg-muted/20 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {entity.description}
                    </p>
                  </FieldSectionField>
                </>
              )}
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend icon={Calendar} title="Thời gian" description="Mốc thời gian tạo và cập nhật." />
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

export default function DepartmentDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <DepartmentDetailInner />
    </AdminPageGuard>
  );
}
