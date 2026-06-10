"use client"

import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import { Loader2, FileText, Globe } from "lucide-react"
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
import { api } from "@/lib/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  seoMetaFormSchema,
  useSeoMetaDetailQuery,
  type SeoMetaDetail,
  type SeoMetaFormValues,
} from "../../_component"
import { cn } from "@ui/lib/utils"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
import { useAdminEditFormHydration } from "@/hooks/use-admin-edit-form-hydration"
function seoMetaToFormValues(detail: SeoMetaDetail): SeoMetaFormValues {
  return {
    page: detail.page ?? "",
    title: detail.title ?? "",
    description: detail.description ?? "",
    keywords: detail.keywords ?? "",
    ogTitle: detail.ogTitle ?? "",
    ogDescription: detail.ogDescription ?? "",
    ogImage: detail.ogImage ?? "",
    status: detail.status,
  }
}

function EditSeoMetaPageInner() {
  const crudNav = useAdminCrudNavigation("/seo-metas")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()

  const form = useForm<SeoMetaFormValues>({
    resolver: zodResolver(seoMetaFormSchema),
  })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const { data: detail, isLoading, isError } = useSeoMetaDetailQuery(api, id)

  const { clearDraft } = useAdminEditFormHydration({
    scope: "seo-metas",
    entityId: id,
    data: detail,
    form,
    toFormValues: seoMetaToFormValues,
  })

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được SEO metadata")
      crudNav.list()
    }
  }, [isError, crudNav])

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["seo-metas"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã cập nhật SEO metadata",
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.seoMetas.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const onSubmit = useCallback(
    async (values: SeoMetaFormValues) => {
      await updateMutation.mutateAsync(
        values as unknown as Record<string, unknown>
      )
    },
    [updateMutation]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <AdminPageSection>
      <AdminFormPageHeader
        title={`Chỉnh sửa SEO: ${detail?.page ?? ""}`}
        subtitle="Cập nhật thông tin SEO metadata."
        onBack={() => crudNav.view(String(id))}
        formId="seo-meta-edit-form"
        isEdit
        submitting={isSubmitting}
      />

      <AdminFormLayout
        id="seo-meta-edit-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FileText}
              title="Thông tin SEO"
              description="Cập nhật thông tin SEO cho trang."
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

export default function EditSeoMetaPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditSeoMetaPageInner />
    </AdminPageGuard>
  )
}
