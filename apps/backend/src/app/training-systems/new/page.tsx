"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  TrainingSystemFormShell,
  useTrainingSystemForm,
  buildTrainingSystemPayload,
} from "../_component";
import type { TrainingSystemFormValues } from "../_component";

function NewTrainingSystemPageInner() {
  const crudNav = useAdminCrudNavigation("/training-systems");
  const queryClient = useQueryClient();
  const { form } = useTrainingSystemForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-systems"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingSystems.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo hệ đào tạo "${(variables.name as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo hệ đào tạo";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: TrainingSystemFormValues) => {
      await createMutation.mutateAsync(buildTrainingSystemPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <TrainingSystemFormShell
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

export default function NewTrainingSystemPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTrainingSystemPageInner />
    </AdminPageGuard>
  );
}
