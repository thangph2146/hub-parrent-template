"use client"

import { useAdminCrudNavigation } from "@/lib/admin-navigation"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { api } from "@/lib/api"
import {
  CourseFormShell,
  useCourseForm,
  buildCoursePayload,
} from "../_component"
import type { CourseFormValues } from "../_component"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
function NewCoursePageInner() {
  const crudNav = useAdminCrudNavigation("/courses")
  const queryClient = useQueryClient()
  const { form } = useCourseForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo khóa học "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo khóa học",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.courses.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: CourseFormValues) => {
      await createMutation.mutateAsync(buildCoursePayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <CourseFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={() => {
          form.reset()
        }}
      />
    </AdminPageSection>
  )
}

export default function NewCoursePage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewCoursePageInner />
    </AdminPageGuard>
  )
}
