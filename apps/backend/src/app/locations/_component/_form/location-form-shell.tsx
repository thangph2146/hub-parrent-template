"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { FieldError } from "@ui/components/field";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
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
import { MapPin, Hash, Globe } from "lucide-react";
import type { LocationFormValues } from "../types";

export interface LocationFormShellProps {
  form: UseFormReturn<LocationFormValues>;
  onSubmit: (values: LocationFormValues) => Promise<void>;
  submitting: boolean;
  editingId: string | null;
  onBack: () => void;
  onReset: () => void;
}

export function LocationFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: LocationFormShellProps) {
  const { control } = form;

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        subtitle={"Quản lý địa điểm trong hệ thống."}
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
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="size-5 text-primary" />
                  Thông tin địa điểm
                </CardTitle>
                <CardDescription>
                  Thông tin cơ bản của địa điểm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Globe className="size-3 shrink-0" />
                        <span>Nhập Google Maps Embed URL để hiển thị bản đồ.</span>
                      </div>
                    </FormFieldCol>
                  )}
                />

                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Tên địa điểm">
                      <Input
                        placeholder="VD: Hội trường A"
                        {...field}
                      />
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
                        value={String(field.value ?? 1)}
                        onChange={(v) => field.onChange(v != null ? Number(v) : 1)}
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
              </CardContent>
            </Card>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  );
}
