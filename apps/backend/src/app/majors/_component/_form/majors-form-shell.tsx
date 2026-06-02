"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { FieldError } from "@ui/components/field";
import { Input } from "@ui/components/input";
import { FormFieldCol } from "@ui/components/typing";
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin";
import { TreePicker } from "@ui/components/pickers";
import { Controller, type UseFormReturn } from "react-hook-form";
import { cn } from "@ui/lib/utils";
import { FileText, Hash } from "lucide-react";
import type { MajorFormValues } from "../types";

export interface MajorsFormShellProps {
  form: UseFormReturn<MajorFormValues>;
  onSubmit: (values: MajorFormValues) => Promise<void>;
  submitting: boolean;
  editingId: string | null;
  onBack: () => void;
  onReset: () => void;
}

export function MajorsFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: MajorsFormShellProps) {
  const { control } = form;

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa ngành học" : "Tạo ngành học mới"}
        subtitle={"Quản lý các ngành học trong hệ thống."}
        onBack={onBack}
        onReset={onReset}
        formId="majors-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="majors-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-primary" />
                  Thông tin ngành học
                </CardTitle>
                <CardDescription>
                  Tên và mã của ngành học.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Tên ngành học" required>
                      <Input
                        placeholder="VD: Công nghệ thông tin"
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
                    <FormFieldCol label="Mã ngành" required>
                      <Input
                        placeholder="VD: CNTT"
                        {...field}
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
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
                    Ngành học sau khi lưu có thể được sử dụng trong các chức năng liên quan.
                  </p>
                </div>
              </CardContent>
            </Card>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  );
}
