"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageSection } from "@ui/components/layout";
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
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useAcademicYearForm();

  const { data: entity, isLoading, isError, refetch } = useAcademicYearDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được niên khóa");
      router.push("/academic-years");
    }
  }, [isError, router]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      name: entity.name ?? "",
      startDate: entity.startDate ?? "",
      endDate: entity.endDate ?? "",
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
      router.push(`/academic-years/${id}`);
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
      <AdminPageLoading />
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
        onBack={() => router.push(`/academic-years/${id}`)}
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
