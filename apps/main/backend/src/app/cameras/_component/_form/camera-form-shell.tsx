"use client"

import { useMemo } from "react"
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
import { Hash, Camera, Link2 } from "lucide-react"
import { api } from "@/lib/api"
import { useEventsListQuery } from "@/app/events/_component/_query"
import type { CameraFormValues } from "../types"

export interface CameraFormShellProps {
  form: UseFormReturn<CameraFormValues>
  onSubmit: (v: CameraFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function CameraFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: CameraFormShellProps) {
  const { control } = form
  const { data: events } = useEventsListQuery(api, true)
  const eventOptions = useMemo(
    () => [
      { value: "", label: "— Không gắn sự kiện —" },
      ...(events ?? []).map((ev) => ({
        value: ev.id,
        label: ev.title?.trim() ? ev.title : ev.id,
      })),
    ],
    [events]
  )

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa camera" : "Thêm camera"}
        subtitle="Quản lý camera."
        onBack={onBack}
        onReset={onReset}
        formId="camera-form"
        submitting={submitting}
        isEdit={!!editingId}
      />
      <AdminFormLayout id="camera-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Camera}
              title="Thông tin camera"
              description="Thông tin cơ bản của camera."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tên camera" required>
                    <Input
                      placeholder="VD: Camera cổng A"
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
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Mã camera (deviceID HANET)" required>
                      <Input
                        placeholder="VD: 2933962531988832256"
                        {...field}
                        className={cn(
                          "font-mono text-sm",
                          fieldState.error && "border-destructive"
                        )}
                      />
                      {fieldState.error ? (
                        <FieldError>{fieldState.error.message}</FieldError>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Copy đúng mã thiết bị từ HANET — khớp trường{" "}
                          <code className="text-[10px]">deviceID</code> /{" "}
                          <code className="text-[10px]">camera_id</code> khi
                          webhook gửi về.
                        </p>
                      )}
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="ipAddress"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Địa chỉ IP">
                      <Input placeholder="192.168.1.100" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="port"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Cổng">
                      <Input
                        type="number"
                        placeholder="554"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Tên đăng nhập">
                      <Input placeholder="admin" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Mật khẩu">
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Hash}
                title="Trạng thái"
                description="Trạng thái hoạt động của camera."
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
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={Link2}
                title="HANET"
                description="Bắt buộc: mã deviceID. Tùy chọn: gắn sự kiện (webhook chung). Vai trò check-in/out chọn ở form sự kiện."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <ul className="list-inside list-disc space-y-1 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Mã camera</strong> =
                    deviceID trên{" "}
                    <a
                      href="https://developers.hanet.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      developers.hanet.ai
                    </a>
                  </li>
                  <li>
                    Webhook cấu hình trên App HANET (tab realtime sự kiện)
                  </li>
                  <li>IP / user / pass: không dùng cho webhook HANET</li>
                </ul>
                <Controller
                  name="linkedEventId"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Sự kiện theo dõi (tùy chọn)">
                      <TreePicker
                        value={field.value ?? ""}
                        onChange={(v) => field.onChange(v ?? "")}
                        options={eventOptions}
                        placeholder="Chọn sự kiện"
                      />
                    </FormFieldCol>
                  )}
                />
              </FieldSetContent>
            </FieldSet>
          </div>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
