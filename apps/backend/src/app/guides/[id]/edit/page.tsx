"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  GuideFormShell,
  useGuideForm,
  useGuideDetailQuery,
  parseContent,
} from "../../_component";
import type { GuideFormData } from "../../_component";

import { useAdminMutation } from "@/hooks/use-admin-mutation";
function EditGuidePageInner() {
  const crudNav = useAdminCrudNavigation("/guides");
  const params = useParams();
  const guideId = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useGuideForm();

  const { data: guide, isLoading, isError, refetch } = useGuideDetailQuery(api, guideId);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được nhóm hướng dẫn");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!guide) return;
    form.reset({
      sectionKey: guide.sectionKey,
      isVisible: guide.isVisible,
      content: parseContent(guide.content),
    });
  }, [guide, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "guides"] });
  };

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) => `Đã cập nhật nhóm hướng dẫn "${variables.sectionKey}"`,
      error: (err) => err instanceof Error ? err.message : "Không thể cập nhật nhóm hướng dẫn",
    },
    mutationFn: async (input: GuideFormData) => {
      await api.guides.update(guideId, input as unknown as Record<string, unknown>);
    },
    onSuccess: async () => {
      await invalidateAll();
      crudNav.list();
    }
    
  });

  const handleSubmit = useCallback(async (values: GuideFormData) => {
    await updateMutation.mutateAsync(values);
  }, [updateMutation]);

  if (isLoading) {
    return (
      <AdminPageLoading variant="form" />
    );
  }

  if (!guide) return null;

  return (
    <AdminPageSection>
      <GuideFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={guideId}
        onBack={() => crudNav.list()}
        onReset={async () => {
          await refetch();
        }}
      />
    </AdminPageSection>
  );
}

export default function EditGuidePage() {
  return (
    <AdminPageGuard permission="page_contents:update">
      <EditGuidePageInner />
    </AdminPageGuard>
  );
}
