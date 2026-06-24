"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { GuideFormShell } from "../_form"
import { useGuideForm } from "../_hooks"
import { useGuidesQuery } from "../_query"
import { PAGE_KEY, sortGroupsByOrder } from "../shared/utils"
import type { GuideFormData } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewGuidePageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("guides")
  const queryClient = useQueryClient()
  const { form, resetForm } = useGuideForm()

  const { data } = useGuidesQuery({ api, page: 1, limit: 1000, search: "" })
  const existingGroups = sortGroupsByOrder(
    (data?.data ?? []).filter((g) => g.pageKey === PAGE_KEY)
  )
  const nextOrder = existingGroups.length + 1

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "guides"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo nhóm hướng dẫn "${variables.sectionKey}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo nhóm hướng dẫn",
    },
    mutationFn: async (input: GuideFormData) => {
      await api.guides.create({
        pageKey: PAGE_KEY,
        sectionKey: input.sectionKey,
        isVisible: input.isVisible,
        content: { ...input.content, order: nextOrder },
      })
    },
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: GuideFormData) => {
      await createMutation.mutateAsync(values)
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <GuideFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={resetForm}
      />
    </AdminPageSection>
  )
}

export default function NewGuidePage() {
  return (
    <AdminPageGuard permission="page_contents:create">
      <NewGuidePageInner />
    </AdminPageGuard>
  )
}
