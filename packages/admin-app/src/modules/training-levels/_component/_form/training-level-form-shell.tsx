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
import { Hash, Tag } from "lucide-react"
import type { TrainingLevelFormValues } from "../shared/types"

export interface TrainingLevelFormShellProps {
  form: UseFormReturn<TrainingLevelFormValues>
  onSubmit: (values: TrainingLevelFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function TrainingLevelFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: TrainingLevelFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa bậc học" : "Tạo bậc học mới"}
        subtitle="Quản lý các bậc học trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="training-level-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="training-level-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tag}
              title="Thông tin cơ bản"
              description="Tên và mã của bậc học."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên bậc học" required>
                    <Input
                      placeholder="VD: Đại học, Cao đẳng, Trung cấp"
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
                  <FormFieldCol label="Mã bậc học">
                    <Input
                      placeholder="VD: DH, CD, TC"
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
            <FieldSectionLegend icon={Hash} title="Trạng thái" />
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
                  Bậc học sau khi lưu có thể được sử dụng trong hệ thống.
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
