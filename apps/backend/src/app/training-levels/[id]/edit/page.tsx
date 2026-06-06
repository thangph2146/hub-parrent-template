"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useTrainingLevelForm();

  const { data: entity, isLoading, isError, refetch } = useTrainingLevelDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được bậc học");
      router.push("/training-levels");
    }
  }, [isError, router]);

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
      router.push(`/training-levels/${id}`);
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
      <AdminPageLoading />
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
        onBack={() => router.push(`/training-levels/${id}`)}
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
