"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  DepartmentFormShell,
  useDepartmentForm,
  buildDepartmentPayload,
} from "../_component";
import type { DepartmentFormValues } from "../_component";

function NewDepartmentPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { form } = useDepartmentForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["departments"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.departments.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo phòng khoa "${(variables.name as string)?.trim()}"`);
      router.push("/departments");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo phòng khoa";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: DepartmentFormValues) => {
      await createMutation.mutateAsync(buildDepartmentPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <DepartmentFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => router.push("/departments")}
        onReset={() => { form.reset(); }}
      />
    </AdminPageSection>
  );
}

export default function NewDepartmentPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewDepartmentPageInner />
    </AdminPageGuard>
  );
}
