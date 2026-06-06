"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  LocationFormShell,
  useLocationForm,
  useLocationDetailQuery,
  buildLocationPayload,
} from "../../_component";
import type { LocationFormValues } from "../../_component";

import { useAdminMutation } from "@/hooks/use-admin-mutation";
function EditLocationPageInner() {
  const crudNav = useAdminCrudNavigation("/locations");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useLocationForm();

  const { data: entity, isLoading, isError, refetch } = useLocationDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được địa điểm");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      mapUrl: entity.mapUrl ?? "",
      name: entity.name ?? "",
      address: entity.address ?? "",
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) => `Đã cập nhật địa điểm "${(variables.name as string)?.trim() || (variables.mapUrl as string)?.trim()}"`,
      error: (err) => err instanceof Error ? err.message : "Không thể cập nhật địa điểm",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.locations.update(id, input),
    onSuccess: async () => {
      await invalidateAll();
      crudNav.view(String(id));
    }
    
  });

  const handleSubmit = useCallback(
    async (values: LocationFormValues) => {
      await updateMutation.mutateAsync(buildLocationPayload(values));
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
      <LocationFormShell
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

export default function EditLocationPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditLocationPageInner />
    </AdminPageGuard>
  );
}
