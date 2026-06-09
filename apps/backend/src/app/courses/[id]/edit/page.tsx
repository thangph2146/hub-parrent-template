"use client"

import { useCallback, useEffect } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/api"
import {
  CourseFormShell,
  useCourseForm,
  useCourseDetailQuery,
  buildCoursePayload,
} from "../../_component"
import type { CourseFormValues } from "../../_component"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
import { useAdminFormDraftPersistence } from "@/hooks/use-admin-edit-form-hydration"
function EditCoursePageInner() {
  const crudNav = useAdminCrudNavigation("/courses")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useCourseForm()

  const {
    data: entity,
    isLoading,
    isError,
    refetch,
  } = useCourseDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được khóa học")
      crudNav.list()
    }
  }, [isError, crudNav])

  useHydrateOncePerEntity(id, entity, (entity) => {
    const draft = loadEntityDraft(buildEntityDraftKey("courses", id))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      name: entity.name ?? "",
      startYear: entity.startYear ?? undefined,
      endYear: entity.endYear ?? undefined,
      departmentId:
        entity.departmentId != null ? String(entity.departmentId) : "",
      status: entity.status ?? 1,
    })
  })

  const { clearDraft } = useAdminFormDraftPersistence("courses", id, form)

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật khóa học "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật khóa học",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.courses.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: CourseFormValues) => {
      await updateMutation.mutateAsync(buildCoursePayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading />
  }

  if (!entity) return null

  return (
    <AdminPageSection>
      <CourseFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(String(id))}
        onReset={async () => {
          await refetch()
        }}
      />
    </AdminPageSection>
  )
}

export default function EditCoursePage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditCoursePageInner />
    </AdminPageGuard>
  )
}
