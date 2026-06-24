"use client"
import { useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { FileText, Globe } from "lucide-react"
import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { FormFieldCol } from "@ui/components/typing"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { seoMetaFormSchema, type SeoMetaFormValues } from "../shared/types"
import { cn } from "@ui/lib/utils"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewSeoMetaPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("seo-metas")
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SeoMetaFormValues>({
    resolver: zodResolver(seoMetaFormSchema),
    defaultValues: {
      page: "",
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      status: 1,
    },
  })

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["seo-metas"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã tạo SEO metadata",
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo SEO metadata",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.seoMetas.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const onSubmit = useCallback(
    async (values: SeoMetaFormValues) => {
      await createMutation.mutateAsync(
        values as unknown as Record<string, unknown>
      )
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <AdminFormPageHeader
        title="Thêm SEO metadata"
        subtitle="Tạo SEO metadata mới cho một trang."
        onBack={() => crudNav.list()}
        formId="seo-meta-form"
        submitting={isSubmitting}
      />

      <AdminFormLayout id="seo-meta-form" onSubmit={handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FileText}
              title="Thông tin SEO"
              description="Nhập thông tin SEO cho trang."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FormFieldCol label="Đường dẫn" required>
                <Input
                  id="page"
                  placeholder="/vi du"
                  {...register("page")}
                  className={cn(errors.page && "border-destructive")}
                />
                {errors.page && <FieldError>{errors.page.message}</FieldError>}
              </FormFieldCol>
              <FormFieldCol label="Title SEO">
                <Input
                  id="title"
                  placeholder="Title hiển thị trên SEO"
                  {...register("title")}
                />
              </FormFieldCol>
              <FormFieldCol label="Mô tả">
                <Input
                  id="description"
                  placeholder="Mô tả meta"
                  {...register("description")}
                />
              </FormFieldCol>
              <FormFieldCol label="Từ khóa">
                <Input
                  id="keywords"
                  placeholder="Từ khóa, cách nhau bằng dấu phẩy"
                  {...register("keywords")}
                />
              </FormFieldCol>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Globe}
              title="Open Graph"
              description="Tùy chỉnh hiển thị khi chia sẻ lên mạng xã hội."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FormFieldCol label="OG Title">
                <Input
                  id="ogTitle"
                  placeholder="Open Graph title"
                  {...register("ogTitle")}
                />
              </FormFieldCol>
              <FormFieldCol label="OG Mô tả">
                <Input
                  id="ogDescription"
                  placeholder="Open Graph description"
                  {...register("ogDescription")}
                />
              </FormFieldCol>
              <FormFieldCol label="OG Ảnh (URL)">
                <Input
                  id="ogImage"
                  placeholder="https://..."
                  {...register("ogImage")}
                />
              </FormFieldCol>
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>
      </AdminFormLayout>
    </AdminPageSection>
  )
}

export default function NewSeoMetaPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewSeoMetaPageInner />
    </AdminPageGuard>
  )
}
