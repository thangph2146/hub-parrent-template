"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useReviewParentStudentMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approved" | "rejected";
    }) => {
      await api.parentStudents.review(id, { action });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "parent-students"] });
      toast.success(
        variables.action === "approved"
          ? "Đã duyệt yêu cầu liên kết."
          : "Đã từ chối yêu cầu liên kết.",
      );
      onSuccess?.();
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật yêu cầu liên kết.",
      );
    },
  });
}
