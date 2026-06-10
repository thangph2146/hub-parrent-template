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
import { DatePicker, TreePicker } from "@ui/components/pickers"
import { Controller, type UseFormReturn } from "react-hook-form"
import { cn } from "@ui/lib/utils"
import { CalendarDays, Hash } from "lucide-react"
import type { AcademicYearFormValues } from "../types"

export interface AcademicYearFormShellProps {
  form: UseFormReturn<AcademicYearFormValues>
  onSubmit: (values: AcademicYearFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function AcademicYearFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: AcademicYearFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa niên khóa" : "Tạo niên khóa mới"}
        subtitle="Quản lý các niên khóa trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="academic-year-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="academic-year-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={CalendarDays}
              title="Thông tin niên khóa"
              description="Tên niên khóa."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên niên khóa" required>
                    <Input
                      placeholder="VD: 2024-2025"
                      {...field}
                      className={cn(fieldState.error && "border-destructive")}
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
              description="Ngày bắt đầu và kết thúc của niên khóa."
            />
            <FieldSetContent variant="section" className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Ngày bắt đầu">
                      <DatePicker
                        id={field.name}
                        value={field.value ?? ""}
                        onChange={(v) => {
                          field.onChange(typeof v === "string" ? v : "")
                          field.onBlur()
                        }}
                        placeholder="Chọn ngày"
                      />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Ngày kết thúc">
                      <DatePicker
                        id={field.name}
                        value={field.value ?? ""}
                        onChange={(v) => {
                          field.onChange(typeof v === "string" ? v : "")
                          field.onBlur()
                        }}
                        placeholder="Chọn ngày"
                      />
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
              description="Trạng thái hoạt động của niên khóa."
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
                  Niên khóa sau khi lưu có thể được sử dụng trong các chức năng
                  liên quan.
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
