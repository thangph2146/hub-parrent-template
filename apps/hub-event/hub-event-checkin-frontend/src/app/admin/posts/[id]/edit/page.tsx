"use client"

import { useCallback, useEffect, useMemo } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import {
  PostFormShell,
  usePostForm,
  buildCategoryOptionTree,
  normalizeContentForEditor,
  toLocalInputValue,
} from "../../_component"
import {
  usePostDetailQuery,
  useCategoriesQuery,
  useTagsQuery,
} from "../../_component/_query"
import type { PostFormValues } from "../../_component"

import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
function EditPostPageInner() {
  const crudNav = useAdminCrudNavigation("/admin/posts")
  const params = useParams()
  const postId = params.id as string
  const queryClient = useQueryClient()
  const form = usePostForm()

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = usePostDetailQuery(api, postId)
  const categoriesQuery = useCategoriesQuery(api)
  const tagsQuery = useTagsQuery(api)

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  )

  useEffect(() => {
    if (error) {
      toast.error("Không tải được bài viết")
      crudNav.list()
    }
  }, [error, crudNav])

  useHydrateOncePerEntity(postId, post, (post) => {
    const draft = loadEntityDraft(buildEntityDraftKey("posts", postId))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      image: post.image ?? "",
      content: normalizeContentForEditor(post.content),
      published: post.published,
      publishedAt: toLocalInputValue(post.publishedAt ?? ""),
      categoryIds: post.categories.map((item) => item.id),
      tagIds: post.tags.map((item) => item.id),
    })
  })

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật bài viết "${(variables.title as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật bài viết",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.posts.update(postId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media", "posts"] })
      crudNav.view(String(postId))
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
      await updateMutation.mutateAsync(payload)
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!post) return null

  return (
    <AdminPageSection>
      <PostFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={postId}
        categoryTreeOptions={categoryTreeOptions}
        tagsOptions={tagsQuery.data ?? []}
        onBack={() => crudNav.view(String(postId))}
        onReset={async () => {
          await refetch()
        }}
      />
    </AdminPageSection>
  )
}

export default function EditPostPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.POSTS_UPDATE}>
      <EditPostPageInner />
    </AdminPageGuard>
  )
}
