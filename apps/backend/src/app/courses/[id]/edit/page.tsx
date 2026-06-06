"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  CourseFormShell,
  useCourseForm,
  useCourseDetailQuery,
  buildCoursePayload,
} from "../../_component";
import type { CourseFormValues } from "../../_component";

function EditCoursePageInner() {
  const crudNav = useAdminCrudNavigation("/courses");
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useCourseForm();

  const { data: entity, isLoading, isError, refetch } = useCourseDetailQuery(api, id);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được khóa học");
      crudNav.list();
    }
  }, [isError, crudNav]);

  useEffect(() => {
    if (!entity) return;
    form.reset({
      name: entity.name ?? "",
      startYear: entity.startYear ?? undefined,
      endYear: entity.endYear ?? undefined,
      departmentId:
        entity.departmentId != null ? String(entity.departmentId) : "",
      status: entity.status ?? 1,
    });
  }, [entity, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.courses.update(id, input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật khóa học "${(variables.name as string)?.trim()}"`);
      crudNav.view(String(id));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật khóa học";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: CourseFormValues) => {
      await updateMutation.mutateAsync(buildCoursePayload(values));
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
      <CourseFormShell
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

export default function EditCoursePage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditCoursePageInner />
    </AdminPageGuard>
  );
}
