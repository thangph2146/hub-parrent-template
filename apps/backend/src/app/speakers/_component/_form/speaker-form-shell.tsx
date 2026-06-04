"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/card"
import { FieldError } from "@ui/components/field"
import { Input } from "@ui/components/input"
import { Textarea } from "@ui/components/textarea"
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
import { Camera, Hash, Loader2, User } from "lucide-react"
import type { SpeakerFormValues } from "../types"
import Image from "next/image"

export interface SpeakerFormShellProps {
  form: UseFormReturn<SpeakerFormValues>
  onSubmit: (values: SpeakerFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}

export function SpeakerFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: SpeakerFormShellProps) {
  const { control, watch, setValue } = form
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const avatarValue = watch("avatar")
  const nameValue = watch("name")

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  const handleUploadAvatar = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const { uploadAdminImage } = await import("@/lib/admin-upload")
      const url = await uploadAdminImage(file, { folderPath: "avatars" })
      setValue("avatar", url)
      toast.success("Đã tải ảnh đại diện")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload ảnh")
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa diễn giả" : "Thêm diễn giả"}
        subtitle="Quản lý diễn giả trong hệ thống."
        onBack={onBack}
        onReset={onReset}
        formId="speaker-form"
        submitting={submitting}
        isEdit={!!editingId}
      />

      <AdminFormLayout
        id="speaker-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
            <Card className="border border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="size-5 text-primary" />
                  Thông tin diễn giả
                </CardTitle>
                <CardDescription>
                  Thông tin cơ bản của diễn giả.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormFieldCol label="Ảnh đại diện">
                  <div className="flex items-start gap-4">
                    <div className="relative aspect-[3/4] w-40 shrink-0 sm:w-60">
                      {avatarValue ? (
                        <Image
                          src={avatarValue}
                          alt="Avatar"
                          fill
                          sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, (max-width: 1280px) 320px, (max-width: 1536px) 400px, 480px"
                          unoptimized
                          className="rounded-lg border-2 border-border/60 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                          {nameValue ? initials(nameValue) : "?"}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent disabled:opacity-50"
                        title="Tải ảnh đại diện"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          <Camera className="size-3.5 text-muted-foreground" />
                        )}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void handleUploadAvatar(file)
                        }}
                      />
                    </div>
                    <div className="flex w-full flex-col gap-2.5">
                      <Controller
                        name="avatar"
                        control={control}
                        render={({ field }) => (
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              URL ảnh đại diện
                            </p>
                            <Input
                              placeholder="https://example.com/avatar.jpg"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        )}
                      />
                      <Controller
                        name="name"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormFieldCol label="Tên diễn giả" required>
                            <Input
                              placeholder="VD: Nguyễn Văn A"
                              {...field}
                              className={cn(
                                fieldState.error && "border-destructive"
                              )}
                            />
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </FormFieldCol>
                        )}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Controller
                          name="email"
                          control={control}
                          render={({ field }) => (
                            <FormFieldCol label="Email">
                              <Input
                                placeholder="email@example.com"
                                {...field}
                              />
                            </FormFieldCol>
                          )}
                        />

                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <FormFieldCol label="Số điện thoại">
                              <Input placeholder="+84 123 456 789" {...field} />
                            </FormFieldCol>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <FormFieldCol label="Chức danh">
                              <Input
                                placeholder="VD: Giám đốc điều hành"
                                {...field}
                              />
                            </FormFieldCol>
                          )}
                        />

                        <Controller
                          name="organization"
                          control={control}
                          render={({ field }) => (
                            <FormFieldCol label="Tổ chức">
                              <Input placeholder="VD: Công ty ABC" {...field} />
                            </FormFieldCol>
                          )}
                        />
                      </div>

                      <Controller
                        name="bio"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormFieldCol label="Tiểu sử">
                            <Textarea
                              placeholder="Tiểu sử của diễn giả..."
                              {...field}
                              className={cn(
                                fieldState.error && "border-destructive"
                              )}
                            />
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </FormFieldCol>
                        )}
                      />
                    </div>
                  </div>
                </FormFieldCol>
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
                    Diễn giả sau khi lưu có thể được chọn khi tạo sự kiện.
                  </p>
                </div>
              </CardContent>
            </Card>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
