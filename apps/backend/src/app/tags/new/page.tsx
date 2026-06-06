"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  TagFormShell,
  useTagForm,
  buildTagPayload,
} from "../_component";
import type { TagFormValues } from "../_component";

function NewTagPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { form } = useTagForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "tags"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.tags.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo thẻ "${(variables.name as string)?.trim()}"`);
      router.push("/tags");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo thẻ";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: TagFormValues) => {
      await createMutation.mutateAsync(buildTagPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <TagFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => router.push("/tags")}
        onReset={() => { form.reset(); }}
      />
    </AdminPageSection>
  );
}

export default function NewTagPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTagPageInner />
    </AdminPageGuard>
  );
}
