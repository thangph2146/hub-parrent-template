"use client"

import { useState } from "react"
import Link from "next/link"
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
import {
  HanetPlaceSelect,
  buildHanetDeviceSelectOptions,
  readHanetAdminPlaceId,
  useHanetDevicesQuery,
  useHanetStatusQuery,
} from "@workspace/admin-app/modules/hanet/_component"
import { useAdminModulePath } from "@workspace/admin-app/runtime"
import type { ScreenFormValues } from "../shared/types"

export interface ScreenFormShellProps {
  form: UseFormReturn<ScreenFormValues>
  onSubmit: (v: ScreenFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function ScreenFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: ScreenFormShellProps) {
  const hanetPath = useAdminModulePath("hanet")
  const { control } = form
  const { data: hanetStatus } = useHanetStatusQuery()
  const [hanetPlaceId, setHanetPlaceId] = useState(readHanetAdminPlaceId)
  const effectivePlaceId =
    hanetPlaceId || hanetStatus?.defaultPlaceId || ""
  const { data: hanetDevices, isLoading: devicesLoading } = useHanetDevicesQuery(
    effectivePlaceId,
    hanetStatus?.configured === true
  )
  const deviceOptions = buildHanetDeviceSelectOptions(hanetDevices)

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
                  name="hanetDeviceId"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Camera (HANET)">
                      <div className="space-y-2">
                        {hanetStatus?.configured ? (
                          <HanetPlaceSelect
                            layout="stacked"
                            value={hanetPlaceId}
                            onChange={setHanetPlaceId}
                            defaultPlaceId={hanetStatus.defaultPlaceId}
                          />
                        ) : (
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Chưa cấu hình OAuth HANET —{" "}
                            <Link
                              href={hanetPath()}
                              className="font-medium underline"
                            >
                              trang HANET
                            </Link>
                            .
                          </p>
                        )}
                        <SelectPicker
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value != null ? String(value) : "")
                            const selected = deviceOptions.find(
                              (o) => o.value === value
                            )
                            form.setValue("cameraName", selected?.label ?? "")
                          }}
                          options={deviceOptions}
                          placeholder={
                            devicesLoading
                              ? "Đang tải thiết bị HANET…"
                              : "Chọn camera"
                          }
                        />
                        {devicesLoading ? (
                          <p className="text-xs text-muted-foreground">
                            Đang tải danh sách thiết bị HANET…
                          </p>
                        ) : hanetStatus?.configured &&
                          effectivePlaceId &&
                          !hanetDevices?.length ? (
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Không có thiết bị cho địa điểm này — kiểm tra cổng
                            HANET hoặc chọn địa điểm khác.
                          </p>
                        ) : null}
                      </div>
                    </FormFieldCol>
                  )}
                />
              </div>
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
