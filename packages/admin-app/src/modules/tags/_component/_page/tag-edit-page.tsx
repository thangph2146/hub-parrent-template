"use client"
import { useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminEditFormHydration } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
import { TagFormShell } from "../_form"
import { useTagForm, buildTagPayload } from "../_hooks"
import { useTagDetailQuery } from "../_query"
import type { TagDetail, TagFormValues } from "../shared/types"

function tagToFormValues(tag: TagDetail): TagFormValues {
  return {
    name: tag.name ?? "",
    slug: tag.slug ?? "",
    icon: tag.icon ?? null,
  }
}

function EditTagPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("tags")
  const params = useParams()
  const tagId = params.id as string
  const queryClient = useQueryClient()
  const { form } = useTagForm()

  const { data: tag, isLoading, isError } = useTagDetailQuery(api, tagId)

  const { clearDraft, resetFromServer } = useAdminEditFormHydration({
    scope: "tags",
    entityId: tagId,
    data: tag,
    form,
    toFormValues: tagToFormValues,
  })

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được thẻ")
      crudNav.list()
    }
  }, [isError, crudNav])

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "tags"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật thẻ "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật thẻ",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.tags.update(tagId, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(tagId))
    },
  })

  const handleSubmit = useCallback(
    async (values: TagFormValues) => {
      await updateMutation.mutateAsync(buildTagPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!tag) return null

  return (
    <AdminPageSection>
      <TagFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={tagId}
        onBack={() => crudNav.view(String(tagId))}
        onReset={resetFromServer}
      />
    </AdminPageSection>
  )
}

export default function EditTagPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditTagPageInner />
    </AdminPageGuard>
  )
}
