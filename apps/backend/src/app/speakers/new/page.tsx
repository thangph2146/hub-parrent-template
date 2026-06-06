"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  SpeakerFormShell,
  useSpeakerForm,
  buildSpeakerPayload,
} from "../_component";
import type { SpeakerFormValues } from "../_component";

function NewSpeakerPageInner() {
  const crudNav = useAdminCrudNavigation("/speakers");
  const queryClient = useQueryClient();
  const { form } = useSpeakerForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["speakers"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.speakers.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo diễn giả "${(variables.name as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo diễn giả";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: SpeakerFormValues) => {
      await createMutation.mutateAsync(buildSpeakerPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <SpeakerFormShell
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

export default function NewSpeakerPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewSpeakerPageInner />
    </AdminPageGuard>
  );
}
