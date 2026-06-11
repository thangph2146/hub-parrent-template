"use client"

import { LexicalEditor } from "@thangph2146/lexical-editor"
import { Badge } from "@ui/components/badge"
import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { Switch } from "@ui/components/switch"
import { Textarea } from "@ui/components/textarea"
import { FormFieldCol, TreeMultiSelectInline } from "@ui/components/typing"
import { DatePicker } from "@ui/components/pickers"
import { cn } from "@ui/lib/utils"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller, type UseFormReturn } from "react-hook-form"
import {
  CalendarClock,
  FileText,
  Globe,
  ImageIcon,
  Search,
  Tags,
} from "lucide-react"
import { getSeoStatus, slugify as defaultSlugify } from "../utils"
import { PostImageField } from "./post-image-field"
import type { PostFormValues } from "../_hooks"
import type { CategoryTreeOption, TaxonomyOption } from "../types"

export interface PostFormShellProps {
  form: UseFormReturn<PostFormValues>
  onSubmit: (values: PostFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  categoryTreeOptions: CategoryTreeOption[]
  tagsOptions: TaxonomyOption[]
  onBack: () => void
  onReset: () => void
}

export function PostFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  categoryTreeOptions,
  tagsOptions,
  onBack,
  onReset,
}: PostFormShellProps) {
  const { control, setValue, watch } = form

  const watchedTitle = watch("title")
  const watchedSlug = watch("slug")
  const watchedExcerpt = watch("excerpt")
  const watchedImage = watch("image") ?? ""

  const titleLength = watchedTitle.trim().length
  const excerptLength = watchedExcerpt.trim().length
  const normalizedSlug = watchedSlug.trim() || defaultSlugify(watchedTitle)
  const previewPath = normalizedSlug
    ? `/bai-viet/${normalizedSlug}`
    : "/bai-viet/ten-bai-viet"
  const titleSeo = getSeoStatus(titleLength, 30, 65)
  const excerptSeo = getSeoStatus(excerptLength, 70, 160)

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
        subtitle="Quản lý bài viết và nội dung xuất bản."
        onBack={onBack}
        onReset={onReset}
        formId="post-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout id="post-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section" className="overflow-visible">
            <FieldSectionLegend
              icon={FileText}
              title="Nội dung chi tiết"
              description="Nội dung phong phú cho bài viết (hỗ trợ rich text)."
            />
            <FieldSetContent
              variant="section"
              className="overflow-visible pt-0"
            >
              <div className="mx-auto max-w-4xl overflow-visible">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <LexicalEditor
                      value={field.value}
                      placeholder="Nhập nội dung bài viết..."
                      onChange={(value) => field.onChange(value)}
                      uploadsContext={undefined}
                    />
                  )}
                />
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={ImageIcon}
              title="Hình ảnh đại diện"
              description="Ảnh đại diện cho preview chia sẻ và danh sách bài viết."
            />
            <FieldSetContent variant="section" className="pt-0">
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <PostImageField
                    value={watchedImage || field.value || ""}
                    onChange={(url) => {
                      field.onChange(url)
                      setValue("image", url, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: false,
                      })
                    }}
                    postTitle={watchedTitle}
                  />
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Search}
              title="Thông tin cơ bản"
              description="Tiêu đề, slug và mô tả ngắn — ảnh hưởng trực tiếp tới SEO."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tiêu đề bài viết" required>
                    <Input
                      placeholder="VD: Thông báo tuyển sinh 2026"
                      {...field}
                      onChange={(e) => {
                        const { value } = e.target
                        field.onChange(value)
                        if (!editingId)
                          form.setValue("slug", defaultSlugify(value))
                      }}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        Tiêu đề nên rõ chủ đề chính, dễ đọc và thu hút.
                      </span>
                      <Badge variant={titleSeo.tone} className="mt-1">
                        {titleLength} ký tự
                      </Badge>
                    </div>
                  </FormFieldCol>
                )}
              />

              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Slug / đường dẫn">
                    <Input
                      placeholder="thong-bao-tuyen-sinh-2026"
                      {...field}
                      onChange={(e) =>
                        field.onChange(defaultSlugify(e.target.value))
                      }
                    />
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="size-3 shrink-0" />
                      <span className="font-mono break-all">{previewPath}</span>
                    </div>
                  </FormFieldCol>
                )}
              />

              <Controller
                name="excerpt"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Mô tả ngắn gọn">
                    <Textarea
                      placeholder="Đoạn mô tả ngắn để hiển thị danh sách..."
                      {...field}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Dùng làm mô tả tóm tắt và preview SEO.</span>
                      <Badge variant={excerptSeo.tone} className="mt-1">
                        {excerptLength} ký tự
                      </Badge>
                    </div>
                  </FormFieldCol>
                )}
              />

              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Preview kết quả tìm kiếm
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-primary">
                  {watchedTitle.trim() ||
                    "Tiêu đề bài viết sẽ hiển thị tại đây"}
                </p>
                <p className="mt-1 text-xs break-all text-emerald-700 dark:text-emerald-400">
                  hub.local{previewPath}
                </p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {watchedExcerpt.trim() ||
                    "Mô tả ngắn của bài viết sẽ hiển thị ở đây để bạn kiểm tra cách trình bày SEO cơ bản."}
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={CalendarClock}
              title="Xuất bản"
              description="Trạng thái hiển thị và thời điểm phát hành bài viết."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="published"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Trạng thái hiển thị</p>
                      <p className="text-xs text-muted-foreground">
                        {field.value
                          ? "Bài viết đang ở chế độ xuất bản."
                          : "Bài viết đang là bản nháp, chưa hiển thị công khai."}
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </div>
                )}
              />

              <Controller
                name="publishedAt"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Ngày xuất bản">
                    <DatePicker
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Chọn ngày"
                    />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tags}
              title="Phân loại"
              description="Gắn danh mục và thẻ để bài viết dễ tìm hơn."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="categoryIds"
                control={control}
                render={({ field }) => (
                  <FormFieldCol
                    label={
                      <div className="flex items-center justify-between gap-2">
                        <Label>Danh mục dùng chung</Label>
                        <Badge variant="outline">
                          {field.value.length} mục
                        </Badge>
                      </div>
                    }
                  >
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="mb-3 text-xs text-muted-foreground">
                        Danh mục theo cấu trúc cha-con.
                      </p>
                      <TreeMultiSelectInline
                        value={field.value}
                        onChange={(v) => field.onChange((v as string[]) ?? [])}
                        options={categoryTreeOptions.map((c) => ({
                          value: c.id,
                          label: c.name,
                          children: c.subRows?.map((s) => ({
                            value: s.id,
                            label: s.name,
                            children: s.subRows?.map((ss) => ({
                              value: ss.id,
                              label: ss.name,
                            })),
                          })),
                        }))}
                      />
                    </div>
                  </FormFieldCol>
                )}
              />
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <FormFieldCol
                    label={
                      <div className="flex items-center justify-between gap-2">
                        <Label>Thẻ</Label>
                        <Badge variant="outline">
                          {field.value.length} thẻ
                        </Badge>
                      </div>
                    }
                  >
                    <div className="rounded-lg border border-border/70 p-3">
                      <TreeMultiSelectInline
                        value={field.value}
                        onChange={(v) => field.onChange((v as string[]) ?? [])}
                        options={(tagsOptions ?? []).map((t) => ({
                          value: t.id,
                          label: t.name,
                        }))}
                      />
                    </div>
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
