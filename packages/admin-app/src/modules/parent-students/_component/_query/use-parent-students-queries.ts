"use client"

import { useQueryClient } from "@tanstack/react-query"
import { api } from "@workspace/admin-app/lib/api"
import { queryKeys } from "@workspace/admin-app/hooks/queries"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
export function useReviewParentStudentMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        variables.action === "approved"
          ? "Đã duyệt yêu cầu liên kết."
          : "Đã từ chối yêu cầu liên kết.",
      error: (err) =>
        err instanceof Error
          ? err.message
          : "Không thể cập nhật yêu cầu liên kết.",
    },
    mutationFn: async ({
      id,
      action,
    }: {
      id: string
      action: "approved" | "rejected"
    }) => {
      await api.parentStudents.review(id, { action })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "parent-students"],
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myStudents() })
      onSuccess?.()
    },
  })
}
