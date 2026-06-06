"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  TrainingLevelFormShell,
  useTrainingLevelForm,
  buildTrainingLevelPayload,
} from "../_component";
import type { TrainingLevelFormValues } from "../_component";

function NewTrainingLevelPageInner() {
  const crudNav = useAdminCrudNavigation("/training-levels");
  const queryClient = useQueryClient();
  const { form } = useTrainingLevelForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-levels"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingLevels.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo bậc học "${(variables.name as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo bậc học";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: TrainingLevelFormValues) => {
      await createMutation.mutateAsync(buildTrainingLevelPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <TrainingLevelFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={() => { form.reset(); }}
      />
    </AdminPageSection>
  );
}

export default function NewTrainingLevelPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTrainingLevelPageInner />
    </AdminPageGuard>
  );
}
