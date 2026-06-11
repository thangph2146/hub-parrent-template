"use client"

import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export const roleFormSchema = z.object({
  code: z
    .string()
    .min(1, "Mã vai trò không được để trống")
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Chỉ chứa chữ thường, số và gạch dưới, bắt đầu bằng chữ"
    ),
  name: z.string().min(1, "Tên hiển thị không được để trống"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  permissions: z.array(z.string()),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>

export function useRoleForm() {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      isActive: true,
      permissions: [],
    },
    mode: "onChange",
  })

  const resetForm = useCallback(() => {
    form.reset({
      code: "",
      name: "",
      description: "",
      isActive: true,
      permissions: [],
    })
  }, [form])

  const populateForm = useCallback(
    (role: {
      code: string
      name: string
      description?: string | null
      isActive: boolean
      permissions: string[]
    }) => {
      form.reset({
        code: role.code,
        name: role.name,
        description: role.description ?? "",
        isActive: role.isActive,
        permissions: role.permissions,
      })
    },
    [form]
  )

  const togglePermission = useCallback(
    (code: string, checked: boolean) => {
      const current = form.getValues("permissions")
      if (checked) {
        form.setValue("permissions", [...new Set([...current, code])], {
          shouldDirty: true,
        })
      } else {
        form.setValue(
          "permissions",
          current.filter((c) => c !== code),
          { shouldDirty: true }
        )
      }
    },
    [form]
  )

  const getPayload = useCallback((): {
    code: string
    name: string
    description: string
    isActive: boolean
    permissions: string[]
  } => {
    const values = form.getValues()
    return {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || "",
      isActive: values.isActive,
      permissions: values.permissions,
    }
  }, [form])

  return {
    form,
    resetForm,
    populateForm,
    togglePermission,
    getPayload,
  }
}
