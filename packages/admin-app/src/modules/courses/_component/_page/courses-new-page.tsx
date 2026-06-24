"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { CourseFormShell } from "../_form"
import { useCourseForm, buildCoursePayload } from "../_hooks"
import type { CourseFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewCoursePageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("courses")
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
