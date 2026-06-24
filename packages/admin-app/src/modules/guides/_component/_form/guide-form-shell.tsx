"use client"

import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { FormFieldCol } from "@ui/components/typing"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { Textarea } from "@ui/components/textarea"
import { Switch } from "@ui/components/switch"
import { Badge } from "@ui/components/badge"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller, type UseFormReturn } from "react-hook-form"
import { cn } from "@ui/lib/utils"
import { BookOpen, Layers, ListOrdered } from "lucide-react"
import { StepEditor } from "./step-editor"
import type { GuideFormData } from "../shared/types"

export interface GuideFormShellProps {
  form: UseFormReturn<GuideFormData>
  onSubmit: (values: GuideFormData) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function GuideFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: GuideFormShellProps) {
  const { control, watch } = form
  const watchedSectionKey = watch("sectionKey")
  const watchedTitle = watch("content.title")
  const watchedDescription = watch("content.description")

  const sectionKeyLength = watchedSectionKey?.trim().length ?? 0
  const titleLength = watchedTitle?.trim().length ?? 0
  const descLength = watchedDescription?.trim().length ?? 0

  return (
    <>
      <AdminFormPageHeader
        title={
          editingId ? "Chỉnh sửa nhóm hướng dẫn" : "Tạo nhóm hướng dẫn mới"
        }
        subtitle="Mỗi nhóm gồm tiêu đề, mô tả và danh sách các bước kèm ảnh minh họa."
        onBack={onBack}
        onReset={onReset}
        formId="guide-form"
        submitting={submitting}
        isEdit={!!editingId}
      />

      <AdminFormLayout id="guide-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Layers}
              title="Các bước thực hiện"
              description="Danh sách các bước chi tiết kèm ảnh minh họa."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="content.steps"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <StepEditor
                      steps={field.value ?? []}
                      onChange={(steps) => field.onChange(steps)}
                    />
                  </div>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={BookOpen}
              title="Thông tin cơ bản"
              description="Mã nhóm, tiêu đề và mô tả — thông tin hiển thị trên trang hướng dẫn."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="sectionKey"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Mã nhóm (sectionKey)" required>
                    <Input
                      id="sectionKey"
                      placeholder="vd: dang-nhap, xem-diem"
                      {...field}
                      disabled={!!editingId}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Slug duy nhất, không dấu, dùng gạch ngang.</span>
                      <Badge
                        variant={
                          sectionKeyLength > 50 ? "destructive" : "outline"
                        }
                        className="ml-auto"
                      >
                        {sectionKeyLength} ký tự
                      </Badge>
                    </div>
                  </FormFieldCol>
                )}
              />

              <Controller
                name="content.title"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tiêu đề nhóm">
                    <Input
                      id="title"
                      placeholder="vd: Hướng dẫn đăng nhập hệ thống"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tiêu đề ngắn gọn, dễ hiểu.</span>
                      <Badge
                        variant={titleLength > 100 ? "destructive" : "outline"}
                        className="ml-auto"
                      >
                        {titleLength} ký tự
                      </Badge>
                    </div>
                  </FormFieldCol>
                )}
              />

              <Controller
                name="content.description"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Mô tả nhóm">
                    <Textarea
                      id="desc"
                      placeholder="Mô tả ngắn về nhóm hướng dẫn này…"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Mô tả ngắn giúp phân biệt nhóm.</span>
                      <Badge variant="outline">{descLength} ký tự</Badge>
                    </div>
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={ListOrdered}
              title="Cài đặt hiển thị"
              description="Điều chỉnh cách hiển thị nhóm hướng dẫn."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="isVisible"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Switch
                      id="visible"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <div className="flex-1">
                      <Label htmlFor="visible" className="cursor-pointer">
                        Hiển thị công khai
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Tắt để ẩn nhóm này khỏi trang frontend.
                      </p>
                    </div>
                  </div>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend icon={Layers} title="Tổng quan" />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Trạng thái
                </p>
                <p className="mt-1 text-sm font-medium">
                  {editingId ? "Đang chỉnh sửa" : "Tạo mới"}
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-3">
                <p className="text-xs text-muted-foreground">
                  Nhóm hướng dẫn sau khi lưu sẽ hiển thị trên trang hướng dẫn sử
                  dụng cho người dùng.
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
