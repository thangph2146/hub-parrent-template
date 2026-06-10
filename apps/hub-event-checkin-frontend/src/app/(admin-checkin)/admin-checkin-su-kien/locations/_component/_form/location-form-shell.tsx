"use client"

import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { Textarea } from "@ui/components/textarea"
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
import { MapPin, Hash, Globe } from "lucide-react"
import type { LocationFormValues } from "../types"

export interface LocationFormShellProps {
  form: UseFormReturn<LocationFormValues>
  onSubmit: (values: LocationFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function LocationFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: LocationFormShellProps) {
  const { control } = form

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        subtitle="Quản lý địa điểm trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="location-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="location-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={MapPin}
              title="Thông tin địa điểm"
              description="Thông tin cơ bản của địa điểm."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="mapUrl"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="URL bản đồ (Google Maps Embed)" required>
                    <Input
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      {...field}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="size-3 shrink-0" />
                      <span>
                        Nhập Google Maps Embed URL để hiển thị bản đồ.
                      </span>
                    </div>
                  </FormFieldCol>
                )}
              />
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Tên địa điểm">
                    <Input placeholder="VD: Hội trường A" {...field} />
                  </FormFieldCol>
                )}
              />
              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Địa chỉ">
                    <Textarea
                      placeholder="Địa chỉ chi tiết của địa điểm..."
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
                      value={String(field.value ?? 1)}
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
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-3">
                <p className="text-xs text-muted-foreground">
                  Địa điểm sau khi lưu có thể được chọn khi tạo sự kiện.
                </p>
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
