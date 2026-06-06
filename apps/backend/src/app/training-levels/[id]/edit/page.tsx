"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  TrainingLevelFormShell,
  useTrainingLevelForm,
  useTrainingLevelDetailQuery,
  buildTrainingLevelPayload,
} from "../../_component";
import type { TrainingLevelFormValues } from "../../_component";

function EditTrainingLevelPageInner() {
  const crudNav = useAdminCrudNavigation("/training-levels");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useTrainingLevelForm();

  const { data: entity, isLoading, isError, refetch } = useTrainingLevelDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được bậc học");
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
    await queryClient.invalidateQueries({ queryKey: ["training-levels"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingLevels.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật bậc học "${(variables.name as string)?.trim()}"`);
      crudNav.view(String(id));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật bậc học";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: TrainingLevelFormValues) => {
      await updateMutation.mutateAsync(buildTrainingLevelPayload(values));
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
      <TrainingLevelFormShell
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

export default function EditTrainingLevelPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditTrainingLevelPageInner />
    </AdminPageGuard>
  );
}
