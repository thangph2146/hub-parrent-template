"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  DepartmentFormShell,
  useDepartmentForm,
  useDepartmentDetailQuery,
  buildDepartmentPayload,
} from "../../_component";
import type { DepartmentFormValues } from "../../_component";

function EditDepartmentPageInner() {
  const crudNav = useAdminCrudNavigation("/departments");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useDepartmentForm();

  const { data: entity, isLoading, isError, refetch } = useDepartmentDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được phòng khoa");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      name: entity.name ?? "",
      code: entity.code ?? "",
      description: entity.description ?? "",
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["departments"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.departments.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật phòng khoa "${(variables.name as string)?.trim()}"`);
      crudNav.view(String(id));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật phòng khoa";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: DepartmentFormValues) => {
      await updateMutation.mutateAsync(buildDepartmentPayload(values));
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
      <DepartmentFormShell
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

export default function EditDepartmentPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditDepartmentPageInner />
    </AdminPageGuard>
  );
}
