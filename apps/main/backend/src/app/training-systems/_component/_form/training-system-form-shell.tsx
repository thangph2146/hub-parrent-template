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
import { Hash, Building2 } from "lucide-react"
import type { TrainingSystemFormValues } from "../types"

export interface TrainingSystemFormShellProps {
  form: UseFormReturn<TrainingSystemFormValues>
  onSubmit: (values: TrainingSystemFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function TrainingSystemFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: TrainingSystemFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa hệ đào tạo" : "Tạo hệ đào tạo mới"}
        subtitle="Quản lý các hệ đào tạo trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="training-system-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="training-system-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Building2}
              title="Thông tin cơ bản"
              description="Tên và mã của hệ đào tạo."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên hệ đào tạo" required>
                    <Input
                      placeholder="VD: Chính quy, Vừa làm vừa học, Liên thông"
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
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Mã hệ đào tạo">
                    <Input
                      placeholder="VD: CQ, VLVH, LT"
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
        </AdminFormMain>

        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Hash}
              title="Trạng thái"
              description="Trạng thái hoạt động của hệ đào tạo."
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
                  Hệ đào tạo sau khi lưu có thể được sử dụng trong hệ thống.
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
