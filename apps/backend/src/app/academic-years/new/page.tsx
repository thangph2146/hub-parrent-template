"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  AcademicYearFormShell,
  useAcademicYearForm,
  buildAcademicYearPayload,
} from "../_component";
import type { AcademicYearFormValues } from "../_component";

function NewAcademicYearPageInner() {
  const crudNav = useAdminCrudNavigation("/academic-years");
  const queryClient = useQueryClient();
  const { form } = useAcademicYearForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["academic-years"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.academicYears.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo niên khóa "${(variables.name as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo niên khóa";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: AcademicYearFormValues) => {
      await createMutation.mutateAsync(buildAcademicYearPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <AcademicYearFormShell
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

export default function NewAcademicYearPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewAcademicYearPageInner />
    </AdminPageGuard>
  );
}
