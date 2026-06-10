"use client"

import { useCallback, useEffect } from "react"
import { useHydrateOncePerEntity } from "@workspace/query-client"
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
  AcademicYearFormShell,
  useAcademicYearForm,
  useAcademicYearDetailQuery,
  buildAcademicYearPayload,
} from "../../_component"
import type { AcademicYearFormValues } from "../../_component"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
import { useAdminFormDraftPersistence } from "@/hooks/use-admin-edit-form-hydration"
function EditAcademicYearPageInner() {
  const crudNav = useAdminCrudNavigation("/academic-years")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useAcademicYearForm()

  const {
    data: entity,
    isLoading,
    isError,
    refetch,
  } = useAcademicYearDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được niên khóa")
      crudNav.list()
    }
  }, [isError, crudNav])

  useHydrateOncePerEntity(id, entity, (entity) => {
    const toDateInput = (value: string | null | undefined) => {
      if (!value) return ""
      const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim())
      if (match) return match[1]
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ""
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, "0")
      const d = String(date.getDate()).padStart(2, "0")
      return `${y}-${m}-${d}`
    }
    form.reset({
      name: entity.name ?? "",
      startDate: toDateInput(entity.startDate),
      endDate: toDateInput(entity.endDate),
      status: entity.status ?? 1,
    })
  })

  const { clearDraft } = useAdminFormDraftPersistence("academic-years", id, form)

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["academic-years"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật niên khóa "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật niên khóa",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.academicYears.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: AcademicYearFormValues) => {
      await updateMutation.mutateAsync(buildAcademicYearPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!entity) return null

  return (
    <AdminPageSection>
      <AcademicYearFormShell
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

export default function EditAcademicYearPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditAcademicYearPageInner />
    </AdminPageGuard>
  )
}
