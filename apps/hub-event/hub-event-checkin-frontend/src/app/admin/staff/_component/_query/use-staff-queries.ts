import { useQueryClient } from "@tanstack/react-query"
import type {
  CreateUserInput,
  StoreSyncSdk,
  UpdateUserInput,
} from "@workspace/api-client"
import { ApiError } from "@/lib/admin/api"
import { queryKeys } from "@/hooks/admin/queries"
import { syncAdminSessionIfCurrentUser } from "@/lib/admin/auth-session"

import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
type CreateStaffInput = Pick<
  CreateUserInput,
  | "email"
  | "fullName"
  | "password"
  | "isActive"
  | "roleCodes"
  | "phone"
  | "address"
  | "citizenId"
>

type UpdateStaffInput = Pick<
  UpdateUserInput,
  | "fullName"
  | "password"
  | "isActive"
  | "roleCodes"
  | "avatar"
  | "phone"
  | "address"
  | "citizenId"
>

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
    mutationFn: async (input: CreateStaffInput) => {
      return apiClient.users.create({
        email: input.email,
        fullName: input.fullName,
        password: input.password,
        isActive: input.isActive,
        roleCodes: input.roleCodes,
        phone: input.phone,
        address: input.address,
        citizenId: input.citizenId,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staffUserList() }),
      ])
    },
  })

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã cập nhật nhân sự",
      error: (error) =>
        error instanceof ApiError ? error.message : "Không lưu được",
    },
    mutationFn: async ({
      id,
      input,
    }: {
      id: string | number
      input: UpdateStaffInput
    }) => {
      return apiClient.users.update(id, {
        fullName: input.fullName,
        isActive: input.isActive,
        password: input.password,
        roleCodes: input.roleCodes,
        avatar: input.avatar,
        phone: input.phone,
        address: input.address,
        citizenId: input.citizenId,
      })
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
