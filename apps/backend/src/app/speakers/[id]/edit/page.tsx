"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  SpeakerFormShell,
  useSpeakerForm,
  useSpeakerDetailQuery,
  buildSpeakerPayload,
} from "../../_component";
import type { SpeakerFormValues } from "../../_component";

import { useAdminMutation } from "@/hooks/use-admin-mutation";
function EditSpeakerPageInner() {
  const crudNav = useAdminCrudNavigation("/speakers");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useSpeakerForm();

  const { data: entity, isLoading, isError, refetch } = useSpeakerDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được diễn giả");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      name: entity.name ?? "",
      title: entity.title ?? "",
      organization: entity.organization ?? "",
      bio: entity.bio ?? "",
      avatar: entity.avatar ?? "",
      email: entity.email ?? "",
      phone: entity.phone ?? "",
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["speakers"] });
  };

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) => `Đã cập nhật diễn giả "${(variables.name as string)?.trim()}"`,
      error: (err) => err instanceof Error ? err.message : "Không thể cập nhật diễn giả",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.speakers.update(id, input),
    onSuccess: async () => {
      await invalidateAll();
      crudNav.view(String(id));
    }
    
  });

  const handleSubmit = useCallback(
    async (values: SpeakerFormValues) => {
      await updateMutation.mutateAsync(buildSpeakerPayload(values));
    },
    [updateMutation],
  );

  if (isLoading) {
    return (
      <AdminPageLoading variant="form" />
    );
  }

  if (!entity) return null;

  return (
    <AdminPageSection>
      <SpeakerFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(String(id))}
        onReset={async () => { await refetch(); }}
      />
    </AdminPageSection>
  );
}

export default function EditSpeakerPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditSpeakerPageInner />
    </AdminPageGuard>
  );
}
