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
  SelectPicker,
  TreePicker,
  type SelectPickerOption,
} from "@ui/components/pickers"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller, type UseFormReturn } from "react-hook-form"
import { cn } from "@ui/lib/utils"
import { Hash, Monitor } from "lucide-react"
import type { ScreenFormValues } from "../types"

export interface ScreenFormShellProps {
  form: UseFormReturn<ScreenFormValues>
  onSubmit: (v: ScreenFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  cameraOptions: SelectPickerOption[]
  templateOptions: SelectPickerOption[]
  onBack: () => void
  onReset: () => void
}

export function ScreenFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  cameraOptions,
  templateOptions,
  onBack,
  onReset,
}: ScreenFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa màn hình" : "Thêm màn hình"}
        subtitle="Quản lý màn hình."
        onBack={onBack}
        onReset={onReset}
        formId="screen-form"
        submitting={submitting}
        isEdit={!!editingId}
      />
      <AdminFormLayout id="screen-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Monitor}
              title="Thông tin màn hình"
              description="Thông tin cơ bản của màn hình."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên màn hình" required>
                    <Input
                      placeholder="VD: Màn hình sảnh A"
                      {...field}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </FormFieldCol>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Mã màn hình">
                      <Input placeholder="SCR-001" {...field} />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="cameraId"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Camera">
                      <SelectPicker
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          const s = cameraOptions.find((o) => o.value === value)
                          form.setValue("cameraName", s?.label ?? "")
                        }}
                        options={cameraOptions}
                        placeholder="Chọn camera"
                      />
                    </FormFieldCol>
                  )}
                />
              </div>
              <Controller
                name="templateId"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Template">
                    <SelectPicker
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        const s = templateOptions.find((o) => o.value === value)
                        form.setValue("templateName", s?.label ?? "")
                      }}
                      options={templateOptions}
                      placeholder="Chọn template"
                    />
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
              description="Trạng thái hoạt động của màn hình."
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
