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
import {
  IconPickerField,
  TreePicker,
  type TreeOption,
} from "@ui/components/pickers"
import { Badge } from "@ui/components/badge"
import { Controller, type UseFormReturn } from "react-hook-form"
import type { CategoryTreeOption } from "../types"
import { cn } from "@ui/lib/utils"
import { FolderTree, Globe, Layers, ListOrdered, Tag } from "lucide-react"
import type { CategoryFormValues } from "../_hooks"
import { ROOT_PARENT_VALUE } from "../_hooks"

function buildParentTreeOptions(
  rows: CategoryTreeOption[],
  excludedIds: Set<string>
): TreeOption[] {
  const result: TreeOption[] = []
  for (const row of rows) {
    if (excludedIds.has(row.id)) continue
    const children = row.subRows
      ? buildParentTreeOptions(row.subRows, excludedIds)
      : []
    result.push({
      value: row.id,
      label: row.name,
      icon: row.icon ?? undefined,
      children: children.length > 0 ? children : undefined,
    })
  }
  return result
}

export interface CategoryFormShellProps {
  form: UseFormReturn<CategoryFormValues>
  onSubmit: (values: CategoryFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  categoryTreeOptions: CategoryTreeOption[]
  onBack: () => void
  onReset: () => void
}

export function CategoryFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  categoryTreeOptions,
  onBack,
  onReset,
}: CategoryFormShellProps) {
  const { control, watch } = form
  const watchedName = watch("name")
  const watchedDescription = watch("description")

  const nameLength = watchedName.trim().length
  const descLength = watchedDescription.trim().length

  const excludedIds = editingId ? new Set([editingId]) : new Set<string>()
  const parentTreeOptions = buildParentTreeOptions(
    categoryTreeOptions,
    excludedIds
  )

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
        subtitle={
          "Slug được tự động sinh từ tên. Cập nhật slug sẽ tự động đồng bộ lại tham chiếu trên các nội dung liên quan."
        }
        onBack={onBack}
        onReset={onReset}
        formId="category-form"
        submitting={submitting}
        isEdit={Boolean(editingId)}
      />

      <AdminFormLayout
        id="category-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tag}
              title="Thông tin cơ bản"
              description="Tên danh mục, slug và mô tả — những yếu tố ảnh hưởng đến khả năng tìm thấy và nhận diện."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Tên hiển thị" required>
                      <Input
                        placeholder="VD: Tin tuyển sinh"
                        {...field}
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tối đa 50 ký tự.</span>
                        <Badge
                          variant={nameLength > 50 ? "destructive" : "outline"}
                          className="ml-auto"
                        >
                          {nameLength} ký tự
                        </Badge>
                      </div>
                    </FormFieldCol>
                  )}
                />

                <Controller
                  name="slug"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormFieldCol label="Slug / đường dẫn">
                      <Input
                        placeholder="tin-tuyen-sinh"
                        {...field}
                        className={cn(fieldState.error && "border-destructive")}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="size-3 shrink-0" />
                        <span className="font-mono break-all">
                          /danh-muc/{field.value || "ten-danh-muc"}
                        </span>
                      </div>
                    </FormFieldCol>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormFieldCol label="Mô tả">
                    <Textarea
                      placeholder="Mô tả ngắn gọn về danh mục này..."
                      {...field}
                      rows={3}
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Giúp phân biệt danh mục trong danh sách và SEO.
                      </span>
                      <Badge variant="outline">{descLength} ký tự</Badge>
                    </div>
                  </FormFieldCol>
                )}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>

        <AdminFormSidebar>
          <FieldSet
            variant="section"
            className="sticky top-2 max-h-[calc(100vh-6rem)] overflow-y-auto"
          >
            <FieldSectionLegend
              icon={Layers}
              title="Phân cấp & Hiển thị"
              description="Danh mục cha, biểu tượng và thứ tự sắp xếp."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => {
                  const pid = field.value ?? ROOT_PARENT_VALUE
                  const isRoot =
                    pid === "" || pid == null || pid === ROOT_PARENT_VALUE
                  return (
                    <FormFieldCol
                      label={
                        <div className="flex items-center gap-2">
                          <FolderTree className="size-4 text-muted-foreground" />
                          Danh mục cha
                        </div>
                      }
                    >
                      <TreePicker
                        value={isRoot ? "" : String(pid)}
                        onChange={(value) =>
                          field.onChange(
                            value == null || value === ""
                              ? ROOT_PARENT_VALUE
                              : String(value)
                          )
                        }
                        options={parentTreeOptions}
                        placeholder="Cấp gốc (không có cha)"
                      />
                      <p className="text-xs text-muted-foreground">
                        {isRoot
                          ? "Cấp gốc trong cây phân cấp."
                          : "Đã chọn danh mục cha."}
                      </p>
                    </FormFieldCol>
                  )
                }}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol label="Biểu tượng">
                      <IconPickerField
                        value={field.value}
                        onChange={(v) =>
                          field.onChange((v as string) ?? "Package2")
                        }
                        placeholder="Chọn biểu tượng"
                      />
                    </FormFieldCol>
                  )}
                />

                <Controller
                  name="sortOrder"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCol
                      label={
                        <div className="flex items-center gap-2">
                          <ListOrdered className="size-4 text-muted-foreground" />
                          Thứ tự
                        </div>
                      }
                    >
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Số nhỏ hiển thị trước.
                      </p>
                    </FormFieldCol>
                  )}
                />
              </div>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
