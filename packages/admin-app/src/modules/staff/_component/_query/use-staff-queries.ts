import { useQueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import { ApiError } from "@workspace/admin-app/lib/api"
import { queryKeys } from "@workspace/admin-app/hooks/queries"
import { syncAdminSessionIfCurrentUser } from "@workspace/admin-app/lib/auth-session"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"

import type { StaffCreateInput, StaffUpdateInput } from "../staff-form.types"

function formatStaffUpdateDetails(data: unknown, input: StaffUpdateInput): string {
  const row =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {}
  const email = typeof row.email === "string" ? row.email : undefined
  const fullName =
    typeof row.fullName === "string"
      ? row.fullName
      : typeof row.name === "string"
        ? row.name
        : undefined
  const changedFields = Object.entries(input)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key)

  return [
    email ? `Email: ${email}` : undefined,
    fullName ? `Tên: ${fullName}` : undefined,
    changedFields.length
      ? `Trường cập nhật: ${changedFields.join(", ")}`
      : undefined,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n")
}

export interface UseStaffMutationsProps {
  api: StoreSyncSdk
}

export function useStaffMutations({ api: apiClient }: UseStaffMutationsProps) {
  const queryClient = useQueryClient()

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã tạo tài khoản",
      error: (error) =>
        error instanceof ApiError ? error.message : "Không tạo được user",
    },
    mutationFn: async (input: StaffCreateInput) => {
      return apiClient.users.create(input)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() })
    },
  })

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã cập nhật nhân sự",
      successDescription: (data, variables) =>
        formatStaffUpdateDetails(data, variables.input),
      error: (error) =>
        error instanceof ApiError ? error.message : "Không lưu được",
    },
    mutationFn: async ({
      id,
      input,
    }: {
      id: string | number
      input: StaffUpdateInput
    }) => {
      return apiClient.users.update(id, input)
    },
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.staffProfile(variables.id),
        }),
      ])
      await syncAdminSessionIfCurrentUser(variables.id, data)
    },
  })

  const deleteMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã đưa tài khoản vào thùng rác",
      error: (error) =>
        error instanceof ApiError ? error.message : "Không xoá được",
    },
    mutationFn: async (id: string | number) => apiClient.users.remove(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usersTrashed() }),
      ])
    },
  })

  const restoreMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã khôi phục tài khoản",
      error: (error) =>
        error instanceof ApiError ? error.message : "Không khôi phục được",
    },
    mutationFn: async (id: string | number) => apiClient.users.restore(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usersTrashed() }),
      ])
    },
  })

  const purgeMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã xóa vĩnh viễn tài khoản",
      error: (error) =>
        error instanceof ApiError ? error.message : "Không xóa vĩnh viễn được",
    },
    mutationFn: async (id: string | number) =>
      apiClient.users.purgeTrashed(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usersTrashed() }),
      ])
    },
  })

  const bulkMutation = useAdminMutation({
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete"
      ids: string[]
    }) => apiClient.users.bulk(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usersTrashed() }),
      ])
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    restoreMutation,
    purgeMutation,
    bulkMutation,
  }
}
