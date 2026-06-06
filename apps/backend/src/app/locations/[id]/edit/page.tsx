"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  LocationFormShell,
  useLocationForm,
  useLocationDetailQuery,
  buildLocationPayload,
} from "../../_component";
import type { LocationFormValues } from "../../_component";

function EditLocationPageInner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useLocationForm();

  const { data: entity, isLoading, isError, refetch } = useLocationDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được địa điểm");
      router.push("/locations");
    }
  }, [isError, router]);

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

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.locations.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật địa điểm "${(variables.name as string)?.trim() || (variables.mapUrl as string)?.trim()}"`);
      router.push(`/locations/${id}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật địa điểm";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: LocationFormValues) => {
      await updateMutation.mutateAsync(buildLocationPayload(values));
    },
    [updateMutation],
  );

  if (isLoading) {
    return (
      <AdminPageLoading />
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
        onBack={() => router.push(`/locations/${id}`)}
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
