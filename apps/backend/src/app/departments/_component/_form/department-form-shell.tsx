"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { FieldError } from "@ui/components/field";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
import { FormFieldCol } from "@ui/components/typing";
import { TreePicker } from "@ui/components/pickers";
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin";
import { Controller, type UseFormReturn } from "react-hook-form";
import { cn } from "@ui/lib/utils";
import { Building2, Hash } from "lucide-react";
import type { DepartmentFormValues } from "../types";

export interface DepartmentFormShellProps {
  form: UseFormReturn<DepartmentFormValues>;
  onSubmit: (values: DepartmentFormValues) => Promise<void>;
  submitting: boolean;
  editingId: string | null;
  onBack: () => void;
  onReset: () => void;
}

export function DepartmentFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: DepartmentFormShellProps) {
  const { control } = form;

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa phòng khoa" : "Tạo phòng khoa mới"}
        subtitle="Quản lý các phòng khoa trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="department-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="department-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="size-5 text-primary" />
                  Thông tin phòng khoa
                </CardTitle>
                <CardDescription>
                  Tên, mã và mô tả của phòng khoa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Tên phòng khoa" required>
                      <Input
                        placeholder="VD: Phòng Công nghệ thông tin"
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
                    <FormFieldCol label="Mã phòng khoa" required>
                      <Input
                        placeholder="VD: P.CNTT"
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
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Mô tả">
                      <Textarea
                        placeholder="Mô tả ngắn về phòng khoa..."
                        {...field}
                        rows={3}
                      />
                    </FormFieldCol>
                  )}
                />
              </CardContent>
            </Card>
        </AdminFormMain>

        <AdminFormSidebar>
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                  <Hash className="size-5" />
                  Trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Trạng thái">
                      <TreePicker
                        value={String(field.value)}
                        onChange={(v) => field.onChange(v != null ? Number(v) : 1)}
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
                    Phòng khoa sau khi lưu có thể được sử dụng trong các chức năng liên quan.
                  </p>
                </div>
              </CardContent>
            </Card>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  );
}
