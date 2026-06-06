"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  AcademicYearFormShell,
  useAcademicYearForm,
  useAcademicYearDetailQuery,
  buildAcademicYearPayload,
} from "../../_component";
import type { AcademicYearFormValues } from "../../_component";

function EditAcademicYearPageInner() {
  const crudNav = useAdminCrudNavigation("/academic-years");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useAcademicYearForm();

  const { data: entity, isLoading, isError, refetch } = useAcademicYearDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được niên khóa");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    const toDateInput = (value: string | null | undefined) => {
      if (!value) return "";
      const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
      if (match) return match[1];
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    form.reset({
      name: entity.name ?? "",
      startDate: toDateInput(entity.startDate),
      endDate: toDateInput(entity.endDate),
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["academic-years"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.academicYears.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật niên khóa "${(variables.name as string)?.trim()}"`);
      crudNav.view(String(id));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật niên khóa";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: AcademicYearFormValues) => {
      await updateMutation.mutateAsync(buildAcademicYearPayload(values));
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
      <AcademicYearFormShell
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

export default function EditAcademicYearPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditAcademicYearPageInner />
    </AdminPageGuard>
  );
}
