"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  TrainingSystemFormShell,
  useTrainingSystemForm,
  useTrainingSystemDetailQuery,
  buildTrainingSystemPayload,
} from "../../_component";
import type { TrainingSystemFormValues } from "../../_component";

function EditTrainingSystemPageInner() {
  const crudNav = useAdminCrudNavigation("/training-systems");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useTrainingSystemForm();

  const { data: entity, isLoading, isError, refetch } = useTrainingSystemDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được hệ đào tạo");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      name: entity.name ?? "",
      code: entity.code ?? "",
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-systems"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingSystems.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật hệ đào tạo "${(variables.name as string)?.trim()}"`);
      crudNav.view(String(id));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật hệ đào tạo";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: TrainingSystemFormValues) => {
      await updateMutation.mutateAsync(buildTrainingSystemPayload(values));
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
      <TrainingSystemFormShell
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

export default function EditTrainingSystemPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditTrainingSystemPageInner />
    </AdminPageGuard>
  );
}
