"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { toast } from "@ui/components/sonner";
import { Calendar, Clock, GraduationCap, Hash } from "lucide-react";
import { Badge } from "@ui/components/badge";
import {
  FieldSet,
  FieldSetContent,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field";
import { AdminPageGuard, AdminPageSection, AdminPageLoading, AdminDetailPageHeader, AdminDetailLayout, AdminDetailMain, AdminDetailSidebar } from "@ui/components/admin";
import { useAuth } from "@/providers/auth-provider";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { useMajorDetailQuery } from "../_component";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

function MajorDetailInner() {
  const crudNav = useAdminCrudNavigation("/majors");
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.MAJORS_UPDATE) : false;

  const { data: entity, isLoading, isError } = useMajorDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được ngành học");
      crudNav.list();
    }
  }, [isError, crudNav]);

  if (isLoading) return <AdminPageLoading />;
  if (!entity) return null;

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Ngành học</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {entity.code || "—"}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={GraduationCap}
              title="Thông tin ngành học"
              description="Mã ngành và trạng thái."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField label="Mã ngành" icon={Hash} valueClassName="font-mono font-medium">
                  {entity.code || "—"}
                </FieldSectionField>
                <FieldSectionField label="Trạng thái" icon={GraduationCap}>
                  {entity.status === 1 ? (
                    <Badge variant="default">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Tắt</Badge>
                  )}
                </FieldSectionField>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend icon={Calendar} title="Thời gian" />
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

export default function MajorDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <MajorDetailInner />
    </AdminPageGuard>
  );
}
