"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  TagFormShell,
  useTagForm,
  useTagDetailQuery,
  buildTagPayload,
} from "../../_component";
import type { TagFormValues } from "../../_component";

import { useAdminMutation } from "@/hooks/use-admin-mutation";
function EditTagPageInner() {
  const crudNav = useAdminCrudNavigation("/tags");
  const params = useParams();
  const tagId = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useTagForm();

  const { data: tag, isLoading, isError, refetch } = useTagDetailQuery(api, tagId);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được thẻ");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!tag) return;
    form.reset({
      name: tag.name ?? "",
      slug: tag.slug ?? "",
      icon: tag.icon ?? null,
    });
  }, [tag, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "tags"] });
  };

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) => `Đã cập nhật thẻ "${(variables.name as string)?.trim()}"`,
      error: (err) => err instanceof Error ? err.message : "Không thể cập nhật thẻ",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.tags.update(tagId, input),
    onSuccess: async () => {
      await invalidateAll();
      crudNav.view(String(tagId));
    }
    
  });

  const handleSubmit = useCallback(
    async (values: TagFormValues) => {
      await updateMutation.mutateAsync(buildTagPayload(values));
    },
    [updateMutation],
  );

  if (isLoading) {
    return (
      <AdminPageLoading variant="form" />
    );
  }

  if (!tag) return null;

  return (
    <AdminPageSection>
      <TagFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={tagId}
        onBack={() => crudNav.view(String(tagId))}
        onReset={async () => {
          await refetch();
        }}
      />
    </AdminPageSection>
  );
}

export default function EditTagPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditTagPageInner />
    </AdminPageGuard>
  );
}
