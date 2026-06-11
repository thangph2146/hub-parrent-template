"use client"

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
  AdminFormSidebar,
} from "@ui/components/admin"
import { TreePicker } from "@ui/components/pickers"
import { Controller, type UseFormReturn } from "react-hook-form"
import { cn } from "@ui/lib/utils"
import { BookOpen, CalendarDays, Hash } from "lucide-react"
import type { CourseFormValues } from "../types"

export interface CourseFormShellProps {
  form: UseFormReturn<CourseFormValues>
  onSubmit: (values: CourseFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function CourseFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: CourseFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
        subtitle="Quản lý các khóa học trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="course-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout id="course-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={BookOpen}
              title="Thông tin khóa học"
              description="Tên và mã khoa liên kết."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên khóa học" required>
                    <Input
                      placeholder="VD: Khóa học 2026-2030"
                      {...field}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </FormFieldCol>
                )}
              />
              <Controller
                name="departmentId"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Mã khoa">
                    <Input
                      placeholder="VD: P.CNTT"
                      {...field}
                      value={field.value ?? ""}
                      className={cn(
                        "font-mono text-sm",
                        fieldState.error && "border-destructive"
                      )}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={CalendarDays}
              title="Thời gian"
              description="Năm bắt đầu và kết thúc của khóa học."
            />
            <FieldSetContent variant="section" className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="startYear"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Năm bắt đầu">
                      <Input
                        type="number"
                        placeholder="VD: 2026"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="endYear"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Năm kết thúc">
                      <Input
                        type="number"
                        placeholder="VD: 2030"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </FormFieldCol>
                  )}
                />
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Hash}
              title="Trạng thái"
              description="Trạng thái hoạt động của khóa học."
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Trạng thái">
                    <TreePicker
                      value={String(field.value)}
                      onChange={(v) =>
                        field.onChange(v != null ? Number(v) : 1)
                      }
                      options={[
                        { value: "1", label: "Hoạt động" },
                        { value: "0", label: "Tắt" },
                      ]}
                      placeholder="Chọn trạng thái"
                    />
                  </FormFieldCol>
                )}
              />
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-3">
                <p className="text-xs text-muted-foreground">
                  Khóa học sau khi lưu có thể được sử dụng trong hệ thống.
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
