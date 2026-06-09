"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/api"
import {
  CategoryFormShell,
  useCategoriesOptionsQuery,
  useCategoryDetailQuery,
  buildCategoryOptionTree,
  buildCategoryPayload,
  categoryFormSchema,
  getCategoryDefaultValues,
} from "../../_component"
import type { CategoryFormValues, CategoryDetail } from "../../_component"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
import { useAdminEditFormHydration } from "@/hooks/use-admin-edit-form-hydration"

function EditCategoryForm({
  category,
  categoryTreeOptions,
}: {
  category: CategoryDetail
  categoryTreeOptions: ReturnType<typeof buildCategoryOptionTree>
}) {
  const crudNav = useAdminCrudNavigation("/categories")
  const queryClient = useQueryClient()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getCategoryDefaultValues(category),
  })

  const { clearDraft, resetFromServer } = useAdminEditFormHydration({
    scope: "categories",
    entityId: String(category.id),
    data: category,
    form,
    toFormValues: getCategoryDefaultValues,
  })

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật danh mục "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật danh mục",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.categories.update(
        category.id,
        input as Parameters<typeof api.categories.update>[1]
      ),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
      crudNav.view(String(category.id))
    },
  })

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      await updateMutation.mutateAsync(buildCategoryPayload(values))
    },
    [updateMutation]
  )

  return (
    <AdminPageSection>
      <CategoryFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={category.id}
        categoryTreeOptions={categoryTreeOptions}
        onBack={() => crudNav.view(String(category.id))}
        onReset={resetFromServer}
      />
    </AdminPageSection>
  )
}

function EditCategoryPageInner() {
  const crudNav = useAdminCrudNavigation("/categories")
  const params = useParams()
  const categoryId = params.id as string

  const {
    data: category,
    isLoading,
    isError,
  } = useCategoryDetailQuery(api, categoryId)
  const categoriesOptionsQuery = useCategoriesOptionsQuery(api)

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesOptionsQuery.data ?? []),
    [categoriesOptionsQuery.data]
  )

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được danh mục")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading variant="form" />
  if (!category) return null

  return (
    <EditCategoryForm
      category={category}
      categoryTreeOptions={categoryTreeOptions}
    />
  )
}

export default function EditCategoryPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditCategoryPageInner />
    </AdminPageGuard>
  )
}
