"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  MajorsFormShell,
  useMajorForm,
  useMajorDetailQuery,
  buildMajorPayload,
} from "../../_component";
import type { MajorFormValues } from "../../_component";

function EditMajorPageInner() {
  const crudNav = useAdminCrudNavigation("/majors");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useMajorForm();

  const { data: entity, isLoading, isError, refetch } = useMajorDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được ngành học");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      name: entity.name ?? "",
      code: entity.code ?? "",
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["majors"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.majors.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật ngành học "${(variables.name as string)?.trim()}"`);
      crudNav.view(String(id));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật ngành học";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: MajorFormValues) => {
      await updateMutation.mutateAsync(buildMajorPayload(values));
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
      <MajorsFormShell
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

export default function EditMajorPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditMajorPageInner />
    </AdminPageGuard>
  );
}
