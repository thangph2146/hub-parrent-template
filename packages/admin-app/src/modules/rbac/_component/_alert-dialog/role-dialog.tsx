"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@ui/components/button"
import { Checkbox } from "@ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { ScrollArea } from "@ui/components/scroll-area"
import { Textarea } from "@ui/components/textarea"
import { FieldError } from "@ui/components/field"
import type { RbacPermission } from "@workspace/api-client"
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "../_query/use-rbac-queries"

const schema = z.object({
  code: z
    .string()
    .min(1, "Mã vai trò không được để trống")
    .regex(/^[a-z_]+$/, "Chỉ chứa chữ thường và gạch dưới"),
  name: z.string().min(1, "Tên nội bộ không được để trống"),
  displayName: z.string().min(1, "Tên hiển thị không được để trống"),
  description: z.string().optional(),
  permissionCodes: z.array(z.string()).min(1, "Phải chọn ít nhất 1 quyền"),
})

type FormData = z.infer<typeof schema>

export interface RoleDialogProps {
  open: boolean
  onClose: () => void
  role?: {
    id: number
    code: string
    name: string
    description: string | null
    permissions: string[]
  } | null
  permissions: RbacPermission[]
}

export function RoleDialog({
  open,
  onClose,
  role,
  permissions,
}: RoleDialogProps) {
  const isEdit = !!role
  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const busy = createMutation.isPending || updateMutation.isPending

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: role?.code || "",
      name: role?.name || "",
      displayName: role?.name || "",
      description: role?.description || "",
      permissionCodes: role?.permissions || [],
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      code: role?.code || "",
      name: role?.name || "",
      displayName: role?.name || "",
      description: role?.description || "",
      permissionCodes: role?.permissions || [],
    })
  }, [open, role, form])

  const handleSubmit = async (data: FormData) => {
    if (isEdit && role) {
      await updateMutation.mutateAsync({
        id: String(role.id),
        data: {
          code: role.code,
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          permissionCodes: data.permissionCodes,
        },
      })
    } else {
      await createMutation.mutateAsync({
        code: data.code,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        permissionCodes: data.permissionCodes,
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật vai trò" : "Tạo vai trò mới"}
          </DialogTitle>
          <DialogDescription>
            Thiết lập thông tin vai trò và chọn quyền hạn phù hợp.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 py-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Mã vai trò</Label>
              <Controller
                name="code"
                control={form.control}
                render={({ field }) => (
                  <>
                    <Input
                      id="code"
                      {...field}
                      disabled={isEdit}
                      placeholder="content_editor"
                    />
                    <FieldError>
                      {form.formState.errors.code?.message}
                    </FieldError>
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Controller
                name="displayName"
                control={form.control}
                render={({ field }) => (
                  <>
                    <Input
                      id="displayName"
                      {...field}
                      placeholder="Biên tập nội dung"
                    />
                    <FieldError>
                      {form.formState.errors.displayName?.message}
                    </FieldError>
                  </>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên nội bộ</Label>
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <>
                  <Input id="name" {...field} placeholder="Biên tập nội dung" />
                  <FieldError>{form.formState.errors.name?.message}</FieldError>
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  {...field}
                  placeholder="Mô tả rõ vai trò này phục vụ bộ phận nào..."
                />
              )}
            />
          </div>

          <Controller
            name="permissionCodes"
            control={form.control}
            render={({ field: { value, onChange }, fieldState }) => (
              <div className="space-y-2">
                <Label>Quyền hạn *</Label>
                <ScrollArea className="max-h-[300px] rounded-lg border border-border p-3">
                  <div className="space-y-2">
                    {permissions.map((perm) => (
                      <div key={perm.code} className="flex items-center gap-3">
                        <Checkbox
                          checked={value.includes(perm.code)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onChange([...value, perm.code])
                            } else {
                              onChange(value.filter((c) => c !== perm.code))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{perm.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {perm.code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  {isEdit ? "Lưu thay đổi" : "Tạo vai trò"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
