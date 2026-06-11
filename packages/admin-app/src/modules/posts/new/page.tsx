"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  PostFormShell,
  usePostForm,
  buildCategoryOptionTree,
} from "../_component"
import { useCategoriesQuery, useTagsQuery } from "../_component/_query"
import type { PostFormValues } from "../_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewPostPageInner() {
  const crudNav = useAdminModuleNavigation("posts")
  const queryClient = useQueryClient()
  const form = usePostForm()

  const categoriesQuery = useCategoriesQuery(api)
  const tagsQuery = useTagsQuery(api)

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  )

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo bài viết "${(variables.title as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo bài viết",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.posts.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media", "posts"] })
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: PostFormValues) => {
      const payload = {
        title: values.title.trim(),
        slug:
          values.slug.trim() ||
          values.title.trim().toLowerCase().replace(/\s+/g, "-"),
        excerpt: values.excerpt.trim() || null,
        image: values.image.trim() || null,
        content: values.content,
        published: values.published,
        publishedAt: values.publishedAt || null,
        categoryIds: values.categoryIds,
        tagIds: values.tagIds,
      }
      await createMutation.mutateAsync(payload)
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <PostFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        categoryTreeOptions={categoryTreeOptions}
        tagsOptions={tagsQuery.data ?? []}
        onBack={() => crudNav.list()}
        onReset={() => {
          form.reset()
        }}
      />
    </AdminPageSection>
  )
}

export default function NewPostPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewPostPageInner />
    </AdminPageGuard>
  )
}
