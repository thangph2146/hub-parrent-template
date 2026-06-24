"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSerializedEditorState, createParagraphNode } from "../shared/utils"

export const postFormSchema = z.object({
  id: z.coerce.string().optional(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string(),
  excerpt: z.string(),
  image: z.string(),
  content: z.record(z.any()),
  published: z.boolean(),
  publishedAt: z.string(),
  categoryIds: z.array(z.coerce.string()),
  tagIds: z.array(z.coerce.string()),
})

export type PostFormValues = z.infer<typeof postFormSchema>

/** API/draft có thể trả id số — form + TreeMultiSelect cần string. */
export function normalizePostFormValues(
  values: Partial<PostFormValues>,
): PostFormValues {
  return {
    ...EMPTY_VALUES,
    ...values,
    id: values.id != null && values.id !== "" ? String(values.id) : undefined,
    title: values.title ?? "",
    slug: values.slug ?? "",
    excerpt: values.excerpt ?? "",
    image: values.image ?? "",
    content: values.content ?? EMPTY_VALUES.content,
    published: values.published ?? false,
    publishedAt: values.publishedAt ?? "",
    categoryIds: (values.categoryIds ?? []).map(String),
    tagIds: (values.tagIds ?? []).map(String),
  }
}

const EMPTY_VALUES: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  image: "",
  content: createSerializedEditorState([createParagraphNode()]),
  published: false,
  publishedAt: "",
  categoryIds: [],
  tagIds: [],
}

export function usePostForm(defaultValues?: Partial<PostFormValues>) {
  return useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  })
}
