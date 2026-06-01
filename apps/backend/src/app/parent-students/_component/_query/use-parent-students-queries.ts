"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useReviewParentStudentMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approved" | "rejected" }) => {
      await api.http.patch(`/admin/parent-students/${id}/review`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "parent-students"] });
      onSuccess?.();
    },
  });
}
