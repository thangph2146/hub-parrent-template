import type { UseMutationResult } from "@tanstack/react-query"

import type { StoreSyncSdk } from "@workspace/api-client"
import type { PostListRow } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
export interface UsePostsMutationsProps {
  api: StoreSyncSdk
  invalidateAll: () => Promise<void>
}

export function useDeleteMutation({
  api,
  invalidateAll,
}: UsePostsMutationsProps): UseMutationResult<unknown, Error, string, unknown> {
  return useAdminMutation({
    mutationFn: async (id: string) => api.posts.remove(id),
    onSuccess: invalidateAll,
  })
}

export function useRestoreMutation({
  api,
  invalidateAll,
}: UsePostsMutationsProps): UseMutationResult<
  PostListRow,
  Error,
  string,
  unknown
> {
  return useAdminMutation({
    mutationFn: async (id: string) => api.posts.restore<PostListRow>(id),
    onSuccess: invalidateAll,
  })
}

export function usePurgeMutation({
  api,
  invalidateAll,
}: UsePostsMutationsProps): UseMutationResult<unknown, Error, string, unknown> {
  return useAdminMutation({
    mutationFn: async (id: string) => api.posts.purge(id),
    onSuccess: invalidateAll,
  })
}

export function useBulkMutation({
  api,
  invalidateAll,
}: UsePostsMutationsProps): UseMutationResult<
  unknown,
  Error,
  { action: "delete" | "restore" | "hard-delete"; ids: string[] },
  unknown
> {
  return useAdminMutation({
    mutationFn: async (input: {
      action: "delete" | "restore" | "hard-delete"
      ids: string[]
    }) => api.posts.bulk(input),
    onSuccess: invalidateAll,
  })
}
