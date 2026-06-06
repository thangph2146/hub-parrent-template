"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  DepartmentFormShell,
  useDepartmentForm,
  buildDepartmentPayload,
} from "../_component";
import type { DepartmentFormValues } from "../_component";

import { useAdminMutation } from "@/hooks/use-admin-mutation";
function NewDepartmentPageInner() {
  const crudNav = useAdminCrudNavigation("/departments");
  const queryClient = useQueryClient();
  const { form } = useDepartmentForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["departments"] });
  };

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) => `Đã tạo phòng khoa "${(variables.name as string)?.trim()}"`,
      error: (err) => err instanceof Error ? err.message : "Không thể tạo phòng khoa",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.departments.create(input),
    onSuccess: async () => {
      await invalidateAll();
      crudNav.list();
    }
    
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
        onBack={() => crudNav.list()}
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
