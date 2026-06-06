"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useTrainingSystemForm();

  const { data: entity, isLoading, isError, refetch } = useTrainingSystemDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được hệ đào tạo");
      router.push("/training-systems");
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
    await queryClient.invalidateQueries({ queryKey: ["training-systems"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingSystems.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật hệ đào tạo "${(variables.name as string)?.trim()}"`);
      router.push(`/training-systems/${id}`);
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
      <AdminPageLoading />
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
        onBack={() => router.push(`/training-systems/${id}`)}
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
