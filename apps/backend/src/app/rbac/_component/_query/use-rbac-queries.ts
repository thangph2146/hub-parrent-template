"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api"
import type { RbacPermission, RbacRole } from "@workspace/api-client"
import type { CreateRoleInput, UpdateRoleInput } from "../types"

import { useAdminMutation } from "@/hooks/use-admin-mutation";
export type RoleRow = {
  id: string
  code: string
  name: string
  description: string | null
  permissions: string[]
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}

function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
      return value.map((p: Record<string, unknown>) => String(p.code ?? ""))
    }
    return value.map(String)
  }
  if (typeof value === "string") {
    if (value === "" || value === "null" || value === "undefined") return []
    try {
      const parsed = JSON.parse(value)
      return normalizePermissions(parsed)
    } catch {}
  }
  return []
}

function normalizeRole(raw: Record<string, unknown>): RoleRow {
  const perms = (normalizePermissions(raw.permissions).length > 0
    ? normalizePermissions(raw.permissions)
    : normalizePermissions(raw.permissionCodes).length > 0
      ? normalizePermissions(raw.permissionCodes)
      : normalizePermissions(raw.permissionsList).length > 0
        ? normalizePermissions(raw.permissionsList)
        : []
  )
  return {
    id: String(raw.id ?? ""),
    code: String(raw.name ?? ""),
    name: String(raw.displayName ?? raw.name ?? ""),
    description: (raw.description as string | null | undefined) ?? null,
    permissions: perms,
    isActive: Boolean(raw.isActive ?? true),
    createdAt: (raw.createdAt as string | null | undefined) ?? null,
    updatedAt: (raw.updatedAt as string | null | undefined) ?? null,
    deletedAt: (raw.deletedAt as string | null | undefined) ?? null,
  }
}

export const rbacQueryKeys = {
  all: ["rbac"] as const,
  catalog: () => [...rbacQueryKeys.all, "catalog", "full"] as const,
  detail: (id: string) => [...rbacQueryKeys.all, "detail", id] as const,
}

export function useRbacCatalog(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rbacQueryKeys.catalog(),
    queryFn: async (): Promise<{ roles: RbacRole[]; permissions: RbacPermission[] }> => {
      const [roles, permissions] = await Promise.all([
        api.roles.listAll<RbacRole>(),
        api.roles.listPermissions(),
      ])
      return { roles, permissions }
    },
    enabled: opts?.enabled ?? true,
  })
}

export function useRoleDetail(id: string) {
  return useQuery({
    queryKey: rbacQueryKeys.detail(id),
    queryFn: async () => {
      const data = await api.roles.get<Record<string, unknown>>(id)
      return normalizeRole(data)
    },
    enabled: !!id,
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang tạo vai trò…",
      success: "Đã tạo vai trò thành công",
      error: (error) => `Lỗi tạo vai trò: ${error.message}`,
    },
    mutationFn: async (data: CreateRoleInput) => {
      const role = await api.roles.create<Record<string, unknown>>({
        name: data.code,
        displayName: data.name,
        description: data.description || null,
        permissions: data.permissionCodes,
        isActive: data.isActive ?? true,
      })
      return normalizeRole(role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacQueryKeys.catalog() })
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles", "list"] })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang cập nhật vai trò…",
      success: "Đã cập nhật vai trò thành công",
      error: (error) => `Lỗi cập nhật vai trò: ${error.message}`,
    },
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleInput }) => {
      const role = await api.roles.update<Record<string, unknown>>(id, {
        name: data.code,
        displayName: data.name,
        description: data.description || null,
        permissions: data.permissionCodes,
        isActive: data.isActive,
      })
      return normalizeRole(role)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rbacQueryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: rbacQueryKeys.catalog() })
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles", "list"] })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang xóa vai trò…",
      success: "Đã xóa vai trò thành công",
      error: (error) => `Lỗi xóa vai trò: ${error.message}`,
    },
    mutationFn: async (id: string) => {
      await api.roles.bulk({ action: "delete", ids: [id] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacQueryKeys.catalog() })
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles", "list"] })
    },
  })
}
