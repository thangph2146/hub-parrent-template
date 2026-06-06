"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  CourseFormShell,
  useCourseForm,
  buildCoursePayload,
} from "../_component";
import type { CourseFormValues } from "../_component";

function NewCoursePageInner() {
  const crudNav = useAdminCrudNavigation("/courses");
  const queryClient = useQueryClient();
  const { form } = useCourseForm();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.courses.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo khóa học "${(variables.name as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể tạo khóa học";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: CourseFormValues) => {
      await createMutation.mutateAsync(buildCoursePayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <CourseFormShell
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

export default function NewCoursePage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewCoursePageInner />
    </AdminPageGuard>
  );
}
