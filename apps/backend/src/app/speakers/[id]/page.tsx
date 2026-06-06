"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import Image from "next/image";
import { toast } from "@ui/components/sonner";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  Building2,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
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
import { useSpeakerDetailQuery } from "../_component";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Chưa ghi nhận";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa ghi nhận"
    : date.toLocaleString("vi-VN");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function SpeakerDetailInner() {
  const crudNav = useAdminCrudNavigation("/speakers");
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.SPEAKERS_UPDATE)
    : false;

  const { data: entity, isLoading, isError } = useSpeakerDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được diễn giả");
      crudNav.list();
    }
  }, [isError, crudNav]);

  if (isLoading) return <AdminPageLoading />;
  if (!entity) return null;

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={entity.name}
        subtitle={<span className="text-muted-foreground/60">Diễn giả</span>}
        variant="entity"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={User}
              title="Thông tin diễn giả"
              description="Thông tin cơ bản của diễn giả."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex items-start gap-4">
                <div className="relative aspect-[3/4] w-40 shrink-0 sm:w-60">
                  {entity.avatar ? (
                    <Image
                      src={entity.avatar}
                      alt={entity.name}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, (max-width: 1280px) 320px, (max-width: 1536px) 400px, 480px"
                      unoptimized
                      className="rounded-lg border-2 border-border/60 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-3xl font-bold text-muted-foreground shadow-sm">
                      {initials(entity.name)}
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-2xl font-bold">{entity.name}</p>
                    {entity.status === 1 ? (
                      <Badge variant="default" className="rounded-full px-3 py-0.5 shadow-sm">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full px-3 py-0.5">
                        Khóa
                      </Badge>
                    )}
                  </div>

                  <FieldSectionDivider />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldSectionField label="Email" icon={Mail} valueClassName="font-medium">
                      {entity.email || "—"}
                    </FieldSectionField>
                    <FieldSectionField label="Số điện thoại" icon={Phone} valueClassName="font-medium">
                      {entity.phone || "—"}
                    </FieldSectionField>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldSectionField label="Chức danh" icon={Briefcase} valueClassName="font-medium">
                      {entity.title || "—"}
                    </FieldSectionField>
                    <FieldSectionField label="Tổ chức" icon={Building2} valueClassName="font-medium">
                      {entity.organization || "—"}
                    </FieldSectionField>
                  </div>

                  {entity.bio && (
                    <FieldSectionField label="Tiểu sử" icon={FileText}>
                      <p className="rounded-lg border border-border/40 bg-muted/20 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {entity.bio}
                      </p>
                    </FieldSectionField>
                  )}
                </div>
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

export default function SpeakerDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <SpeakerDetailInner />
    </AdminPageGuard>
  );
}
