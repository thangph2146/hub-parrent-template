"use client";

import { FieldError, FieldSet, FieldSetContent, FieldSectionLegend } from "@ui/components/field";
import { Input } from "@ui/components/input";
import { FormFieldCol } from "@ui/components/typing";
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
} from "@ui/components/admin";
import { IconPickerField } from "@ui/components/pickers";
import { Badge } from "@ui/components/badge";
import { Controller, type UseFormReturn } from "react-hook-form";
import { cn } from "@ui/lib/utils";
import { Globe, ImageIcon, Tag } from "lucide-react";
import type { TagFormValues } from "../types";

export interface TagFormShellProps {
  form: UseFormReturn<TagFormValues>;
  onSubmit: (values: TagFormValues) => Promise<void>;
  submitting: boolean;
  editingId: string | null;
  onBack: () => void;
  onReset: () => void;
}

export function TagFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: TagFormShellProps) {
  const { control, watch } = form;
  const watchedName = watch("name");

  const nameLength = watchedName.trim().length;

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa thẻ" : "Tạo thẻ mới"}
        subtitle={"Slug được tự động sinh từ tên. Cập nhật slug sẽ tự động đồng bộ lại tham chiếu trên các nội dung liên quan."}
        onBack={onBack}
        onReset={onReset}
        formId="tag-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="tag-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain className="lg:col-span-3">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tag}
              title="Thông tin cơ bản"
              description="Tên thẻ và slug — những yếu tố ảnh hưởng đến khả năng tìm thấy và nhận diện."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label={<div className="flex items-center gap-2"><Tag className="size-4 text-muted-foreground" />Tên hiển thị</div>} required>
                      <Input
                        placeholder="VD: công nghệ, giải trí, giáo dục"
                        {...field}
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tối đa 50 ký tự, nên ngắn gọn.</span>
                        <Badge variant={nameLength > 50 ? "destructive" : "outline"} className="ml-auto">{nameLength} ký tự</Badge>
                      </div>
                    </FormFieldCol>
                  )}
                />

                <Controller
                  name="slug"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label={<div className="flex items-center gap-2"><Globe className="size-4 text-muted-foreground" />Slug / đường dẫn</div>}>
                      <Input
                        placeholder="cong-nghe"
                        {...field}
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="size-3 shrink-0" />
                        <span className="break-all font-mono">/the/{field.value || "ten-the"}</span>
                      </div>
                    </FormFieldCol>
                  )}
                />
              </div>

              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label={<div className="flex items-center gap-2"><ImageIcon className="size-4 text-muted-foreground" />Biểu tượng</div>}>
                    <IconPickerField
                      value={field.value}
                      onChange={(v) => field.onChange((v as string) ?? null)}
                      placeholder="Chọn biểu tượng"
                    />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>
      </AdminFormLayout>
    </>
  );
}
