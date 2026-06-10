"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { LexicalEditor } from "@thangph2146/lexical-editor"
import {
  FieldError,
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
  FieldSectionLegend,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { Textarea } from "@ui/components/textarea"
import { FormFieldCol } from "@ui/components/typing"
import {
  SelectPicker,
  TreePicker,
  TreeMultiSelectPicker,
  type TreeOption,
} from "@ui/components/pickers"
import { Switch } from "@ui/components/switch"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import { Controller, type UseFormReturn } from "react-hook-form"
import { cn } from "@ui/lib/utils"
import {
  Hash,
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  Monitor,
  FileText,
  Search,
  Mic,
  Star,
} from "lucide-react"
import { useCamerasListQuery } from "@/app/cameras/_component"
import { slugify } from "@workspace/api-client"
import type { EventFormValues, EventFormSpeaker } from "../types"
import { EventPosterField } from "./event-poster-field"
import { api } from "@/lib/api"

interface LocationOption {
  value: string
  label: string
  address: string
}

export interface EventFormShellProps {
  form: UseFormReturn<EventFormValues>
  onSubmit: (values: EventFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

function useLocationOptions() {
  const [options, setOptions] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.locations
      .list<{ id: number; name: string | null; address: string | null }>({
        limit: 200,
        status: "active",
      })
      .then((res) => {
        setOptions(
          res.items
            .filter((loc) => loc.name)
            .map((loc) => ({
              value: loc.name!,
              label: loc.address ? `${loc.name} — ${loc.address}` : loc.name!,
              address: loc.address ?? "",
            }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { options, loading }
}

function SpeakerSelector({ form }: { form: EventFormShellProps["form"] }) {
  const [options, setOptions] = useState<TreeOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.speakers
      .list<{ id: number; name: string; title: string | null }>({
        limit: 200,
        status: "active",
      })
      .then((res) => {
        setOptions(
          res.items
            .filter((s) => s.name)
            .map((s) => ({
              value: String(s.id),
              label: s.title ? `${s.name} — ${s.title}` : s.name,
            }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const optionMap = new Map(options.map((o) => [o.value, o.label]))
  const [uiSpeakers, setUiSpeakers] = useState<EventFormSpeaker[]>(
    () => form.watch("speakers") ?? []
  )

  useEffect(() => {
    const sub = form.watch((values) => {
      const next = values.speakers
      if (next && Array.isArray(next)) {
        setUiSpeakers(next as EventFormSpeaker[])
      }
    })
    return () => sub.unsubscribe()
  }, [form])

  const selectedIds = uiSpeakers.map((s) => String(s.speakerId))

  function updateSpeakers(updated: EventFormSpeaker[]) {
    setUiSpeakers(updated)
    form.setValue("speakers", updated, { shouldDirty: true, shouldTouch: true })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mic className="size-3.5" />
          Chọn diễn giả tham gia sự kiện
        </p>
        <TreeMultiSelectPicker
          value={selectedIds}
          onChange={(v) => {
            const newIds = Array.isArray(v) ? (v as string[]).map(Number) : []
            const updated = newIds.map((id) => {
              const existing = uiSpeakers.find((s) => s.speakerId === id)
              return (
                existing ?? {
                  speakerId: id,
                  role: "",
                  presentationTitle: "",
                  duration: undefined,
                }
              )
            })
            updateSpeakers(updated)
          }}
          options={options}
          placeholder={loading ? "Đang tải danh sách…" : "Chọn diễn giả…"}
        />
      </div>

      {uiSpeakers.length > 0 && (
        <div className="space-y-3">
          {uiSpeakers.map((s, i) => (
            <div
              key={s.speakerId}
              className="space-y-2 rounded-lg border border-border/70 p-3"
            >
              <p className="text-sm font-medium">
                {optionMap.get(String(s.speakerId)) ||
                  `Diễn giả #${s.speakerId}`}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  placeholder="Vai trò (VD: Diễn giả chính)"
                  value={s.role ?? ""}
                  onChange={(e) => {
                    const updated = [...uiSpeakers]
                    updated[i] = { ...updated[i], role: e.target.value }
                    updateSpeakers(updated)
                  }}
                />
                <Input
                  placeholder="Chủ đề trình bày"
                  value={s.presentationTitle ?? ""}
                  onChange={(e) => {
                    const updated = [...uiSpeakers]
                    updated[i] = {
                      ...updated[i],
                      presentationTitle: e.target.value,
                    }
                    updateSpeakers(updated)
                  }}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Thời lượng (phút)"
                  value={s.duration ?? ""}
                  onChange={(e) => {
                    const v = e.target.value
                    const updated = [...uiSpeakers]
                    updated[i] = {
                      ...updated[i],
                      duration: v ? Number(v) : undefined,
                    }
                    updateSpeakers(updated)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LocationSelector({ form }: { form: EventFormShellProps["form"] }) {
  const { options, loading } = useLocationOptions()

  const handleSelect = useCallback(
    (value: unknown) => {
      if (!value || typeof value !== "string") return
      const loc = options.find((o) => o.value === value)
      if (loc) {
        form.setValue("location", loc.value, { shouldDirty: true })
        form.setValue("address", loc.address, { shouldDirty: true })
      }
    },
    [options, form]
  )

  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Search className="size-3.5" />
        Chọn địa điểm có sẵn
      </p>
      <TreePicker
        value=""
        onChange={handleSelect}
        options={options}
        placeholder={
          loading ? "Đang tải danh sách…" : "Chọn địa điểm từ danh sách…"
        }
      />
      <p className="text-[10px] text-muted-foreground/60">
        Hoặc nhập thủ công bên dưới.
      </p>
    </div>
  )
}

function buildCameraSelectOptions(
  cameras: { id: string; name: string; code: string | null }[] | undefined
) {
  return (cameras ?? []).map((cam) => ({
    value: String(cam.id),
    label: cam.code ? `${cam.name} (${cam.code})` : cam.name,
  }))
}

export function EventFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: EventFormShellProps) {
  const { control, setValue, watch } = form
  const watchedTitle = watch("title")
  const watchedPosterUrl = watch("posterUrl") ?? ""
  const { data: cameras, isLoading: camerasLoading } = useCamerasListQuery(
    api,
    true
  )
  const cameraOptions = buildCameraSelectOptions(cameras)

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa sự kiện" : "Thêm sự kiện"}
        subtitle="Quản lý sự kiện check-in."
        onBack={onBack}
        onReset={onReset}
        formId="event-form"
        submitting={submitting}
        isEdit={!!editingId}
      />

      <AdminFormLayout id="event-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section" className="overflow-visible">
            <FieldSectionLegend
              icon={FileText}
              title="Nội dung chi tiết"
              description="Nội dung phong phú cho sự kiện (hỗ trợ rich text)."
            />
            <FieldSetContent
              variant="section"
              className="overflow-visible pt-0"
            >
              <div className="mx-auto max-w-4xl overflow-visible">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <LexicalEditor
                      value={field.value}
                      placeholder="Nhập nội dung chi tiết sự kiện..."
                      onChange={(value) => field.onChange(value)}
                      uploadsContext={undefined}
                    />
                  )}
                />
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Calendar}
              title="Thông tin sự kiện"
              description="Thông tin cơ bản của sự kiện."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="posterUrl"
                control={control}
                render={({ field }) => (
                  <EventPosterField
                    value={watchedPosterUrl || field.value || ""}
                    onChange={(url) => {
                      field.onChange(url)
                      setValue("posterUrl", url, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: false,
                      })
                    }}
                    eventTitle={watchedTitle}
                  />
                )}
              />
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldCol label="Tiêu đề sự kiện" required>
                    <Input
                      placeholder="VD: Hội thảo công nghệ 2026"
                      {...field}
                      onChange={(e) => {
                        const { value } = e.target
                        field.onChange(value)
                        if (!editingId) form.setValue("slug", slugify(value))
                      }}
                      className={cn(fieldState.error && "border-destructive")}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </FormFieldCol>
                )}
              />
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Slug">
                    <Input
                      placeholder="hoi-thao-cong-nghe-2026"
                      {...field}
                      onChange={(e) => field.onChange(slugify(e.target.value))}
                    />
                  </FormFieldCol>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Mô tả ngắn">
                    <Textarea
                      placeholder="Mô tả ngắn về sự kiện..."
                      {...field}
                    />
                  </FormFieldCol>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Thời gian bắt đầu">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Thời gian kết thúc">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={MapPin}
              title="Thông tin check-in"
              description="Cấu hình thời gian check-in và địa điểm."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="checkinStart"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Check-in bắt đầu">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="checkinEnd"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Check-in kết thúc">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="checkoutStart"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Check-out bắt đầu">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="checkoutEnd"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Check-out kết thúc">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="registrationStart"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Đăng ký từ">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="registrationEnd"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Đăng ký đến">
                      <Input type="datetime-local" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
              <Controller
                name="organizer"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Đơn vị tổ chức">
                    <Input placeholder="VD: Trường Đại học ABC" {...field} />
                  </FormFieldCol>
                )}
              />
              <LocationSelector form={form} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Địa điểm">
                      <Input placeholder="VD: Hội trường A" {...field} />
                    </FormFieldCol>
                  )}
                />
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Địa chỉ">
                      <Input placeholder="VD: 123 Đường ABC" {...field} />
                    </FormFieldCol>
                  )}
                />
              </div>
            </FieldSetContent>
          </FieldSet>

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
              icon={Star}
              title="Sự kiện nổi bật"
              description='Sự kiện được đánh dấu sẽ hiển thị trên trang chủ và carousel "Sự kiện nổi bật" tại /su-kien.'
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => {
                  const checked = Boolean(field.value)
                  const toggleFeatured = () => {
                    const next = !checked
                    field.onChange(next)
                    setValue("isFeatured", next, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      className="relative z-10 flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onClick={toggleFeatured}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          toggleFeatured()
                        }
                      }}
                    >
                      <div className="pr-3">
                        <p className="text-sm font-medium">Đánh dấu nổi bật</p>
                        <p className="text-xs text-muted-foreground">
                          {checked
                            ? "Đang hiển thị trên landing và carousel /su-kien."
                            : "Bấm để hiển thị trên landing và strip nổi bật."}
                        </p>
                      </div>
                      <Switch
                        checked={checked}
                        onCheckedChange={(value) => {
                          field.onChange(value)
                          setValue("isFeatured", value, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        aria-label="Đánh dấu sự kiện nổi bật"
                      />
                    </div>
                  )
                }}
              />
              <Controller
                name="featuredOrder"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Thứ tự carousel (số nhỏ = trước)">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend icon={Monitor} title="Hình thức" />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Hình thức">
                    <SelectPicker
                      value={String(field.value ?? 0)}
                      onChange={(v) =>
                        field.onChange(v != null ? Number(v) : 0)
                      }
                      options={[
                        { value: "0", label: "Offline" },
                        { value: "1", label: "Online" },
                        { value: "2", label: "Hybrid" },
                      ]}
                      placeholder="Chọn hình thức"
                    />
                  </FormFieldCol>
                )}
              />
              <Controller
                name="onlineLink"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Link online">
                    <Input
                      placeholder="https://meet.google.com/..."
                      {...field}
                    />
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Mic}
              title="Diễn giả"
              description="Chọn diễn giả tham gia sự kiện."
            />
            <FieldSetContent variant="section" className="pt-0">
              <SpeakerSelector form={form} />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend icon={Users} title="Cấu hình" />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <Controller
                name="maxParticipants"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Số lượng tối đa">
                    <Input type="number" min={0} {...field} />
                  </FormFieldCol>
                )}
              />
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-muted-foreground" />
                  <span className="text-sm">Cho phép check-in</span>
                </div>
                <Controller
                  name="allowCheckin"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-muted-foreground" />
                  <span className="text-sm">Cho phép check-out</span>
                </div>
                <Controller
                  name="allowCheckout"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-muted-foreground" />
                  <span className="text-sm">Yêu cầu Face ID</span>
                </div>
                <Controller
                  name="requireFaceId"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <FieldSectionDivider />
              <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Camera HANET
              </p>
              <p className="px-1 text-xs text-muted-foreground">
                Chọn camera từ danh sách — mã camera phải trùng{" "}
                <code className="text-[10px]">deviceID</code> trên HANET.
              </p>
              <Controller
                name="checkinCameraId"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Camera check-in">
                    <SelectPicker
                      value={String(field.value ?? "")}
                      onChange={(v) =>
                        field.onChange(v != null ? String(v) : "")
                      }
                      options={cameraOptions}
                      placeholder={
                        camerasLoading
                          ? "Đang tải camera…"
                          : "Chọn camera check-in"
                      }
                    />
                  </FormFieldCol>
                )}
              />
              <Controller
                name="checkoutCameraId"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Camera check-out">
                    <SelectPicker
                      value={String(field.value ?? "")}
                      onChange={(v) =>
                        field.onChange(v != null ? String(v) : "")
                      }
                      options={cameraOptions}
                      placeholder={
                        camerasLoading
                          ? "Đang tải camera…"
                          : "Chọn camera check-out"
                      }
                    />
                  </FormFieldCol>
                )}
              />
              {camerasLoading ? (
                <p className="text-xs text-muted-foreground">
                  Đang tải danh sách camera…
                </p>
              ) : !cameras?.length ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Chưa có camera —{" "}
                  <Link href="/cameras/new" className="font-medium underline">
                    thêm camera
                  </Link>{" "}
                  trước khi gắn sự kiện.
                </p>
              ) : null}
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
