"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  LocationFormShell,
  useLocationForm,
  buildLocationPayload,
} from "../_component";
import type { LocationFormValues } from "../_component";

function NewLocationPageInner() {
  const crudNav = useAdminCrudNavigation("/locations");
  const queryClient = useQueryClient();
  const { form } = useLocationForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.locations.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo địa điểm "${(variables.name as string)?.trim() || (variables.mapUrl as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo địa điểm";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: LocationFormValues) => {
      await createMutation.mutateAsync(buildLocationPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <LocationFormShell
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

export default function NewLocationPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewLocationPageInner />
    </AdminPageGuard>
  );
}
