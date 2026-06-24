"use client"

import { useQueryClient, type UseMutationResult } from "@tanstack/react-query"
import { useAdminApi } from "@workspace/admin-app/runtime"
import type {
  ContactRequest,
  CreateContactRequestInput,
  UpdateContactRequestInput,
} from "@workspace/api-client"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"

export const useCreateContactRequest = (): UseMutationResult<
  ContactRequest,
  Error,
  CreateContactRequestInput
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã tạo yêu cầu liên hệ mới",
      error: (error) => error.message || "Không thể tạo yêu cầu liên hệ",
    },
    mutationFn: async (input: CreateContactRequestInput) => {
      return api.contactRequests.create(input)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}

export const useUpdateContactRequest = (): UseMutationResult<
  ContactRequest,
  Error,
  { id: string | number; input: UpdateContactRequestInput }
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã cập nhật yêu cầu liên hệ",
      error: (error) => error.message || "Không thể cập nhật yêu cầu liên hệ",
    },
    mutationFn: async ({ id, input }) => {
      return api.contactRequests.update(id, input)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
      await queryClient.invalidateQueries({
        queryKey: ["contact-requests", data.id],
      })
    },
  })
}

export const useDeleteContactRequest = (): UseMutationResult<
  void,
  Error,
  string | number
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã xóa yêu cầu liên hệ",
      error: (error) => error.message || "Không thể xóa yêu cầu liên hệ",
    },
    mutationFn: async (id: string | number) => {
      return api.contactRequests.remove(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}

export const useRestoreContactRequest = (): UseMutationResult<
  ContactRequest,
  Error,
  string | number
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã khôi phục yêu cầu liên hệ",
      error: (error) => error.message || "Không thể khôi phục yêu cầu liên hệ",
    },
    mutationFn: async (id: string | number) => {
      return api.contactRequests.restore(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}

export const usePurgeContactRequest = (): UseMutationResult<
  void,
  Error,
  string | number
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã xóa vĩnh viễn yêu cầu liên hệ",
      error: (error) =>
        error.message || "Không thể xóa vĩnh viễn yêu cầu liên hệ",
    },
    mutationFn: async (id: string | number) => {
      return api.contactRequests.hardDelete(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}

export const useBulkDeleteContactRequest = (): UseMutationResult<
  { affected: number; message: string },
  Error,
  string[]
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã xóa các yêu cầu liên hệ được chọn",
      error: (error) => error.message || "Không thể xóa các yêu cầu liên hệ",
    },
    mutationFn: async (ids: string[]) => {
      return api.contactRequests.bulkDelete(ids)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}

export const useBulkRestoreContactRequest = (): UseMutationResult<
  { affected: number; message: string },
  Error,
  string[]
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã khôi phục các yêu cầu liên hệ được chọn",
      error: (error) =>
        error.message || "Không thể khôi phục các yêu cầu liên hệ",
    },
    mutationFn: async (ids: string[]) => {
      return api.contactRequests.bulkRestore(ids)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}

export const useBulkPurgeContactRequest = (): UseMutationResult<
  { affected: number; message: string },
  Error,
  string[]
> => {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã xóa vĩnh viễn các yêu cầu liên hệ được chọn",
      error: (error) =>
        error.message || "Không thể xóa vĩnh viễn các yêu cầu liên hệ",
    },
    mutationFn: async (ids: string[]) => {
      return api.contactRequests.bulkHardDelete(ids)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}
