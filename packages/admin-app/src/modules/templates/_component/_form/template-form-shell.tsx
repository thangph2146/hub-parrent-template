"use client"

import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { FormFieldCol } from "@ui/components/typing"
import { TreePicker } from "@ui/components/pickers"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller, type UseFormReturn } from "react-hook-form"
import { cn } from "@ui/lib/utils"
import { LayoutTemplate } from "lucide-react"
import type { TemplateFormValues } from "../types"

export interface TemplateFormShellProps {
  form: UseFormReturn<TemplateFormValues>
  onSubmit: (v: TemplateFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function TemplateFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: TemplateFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa mẫu hiển thị" : "Thêm mẫu hiển thị"}
        subtitle="Quản lý mẫu hiển thị."
        onBack={onBack}
        onReset={onReset}
        formId="template-form"
        submitting={submitting}
        isEdit={!!editingId}
      />
      <AdminFormLayout
        id="template-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={LayoutTemplate}
              title="Thông tin mẫu"
              description="Thông tin cơ bản của mẫu hiển thị."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên mẫu" required>
                    <Input
                      placeholder="VD: Mẫu hiển thị mặc định"
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
                name="code"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Mã mẫu">
                    <Input placeholder="TEMPLATE_001" {...field} />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={LayoutTemplate}
              title="Trạng thái"
              description="Trạng thái hoạt động của mẫu hiển thị."
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
                        { value: "0", label: "Khóa" },
                      ]}
                      placeholder="Chọn trạng thái"
                    />
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
