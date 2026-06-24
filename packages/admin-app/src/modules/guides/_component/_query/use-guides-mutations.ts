"use client"
import { useQueryClient, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import type {
  GuideFormData,
  UpdateGuideData,
  GuideGroup,
  ListResult,
} from "../shared/types"
import { PAGE_KEY, parseContent, applyOrderToGroups } from "../shared/utils"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
interface CreateGuideVariables {
  api: StoreSyncSdk
  data: GuideFormData
  nextOrder: number
}

interface UpdateGuideVariables {
  api: StoreSyncSdk
  id: string | number
  data: UpdateGuideData
}

async function createGuide({
  api,
  data,
  nextOrder,
}: CreateGuideVariables): Promise<void> {
  await api.guides.create({
    pageKey: PAGE_KEY,
    sectionKey: data.sectionKey,
    isVisible: data.isVisible,
    content: { ...data.content, order: nextOrder },
  })
}

async function updateGuide({
  api,
  id,
  data,
}: UpdateGuideVariables): Promise<void> {
  await api.guides.update(id, data as unknown as Record<string, unknown>)
}

async function deleteGuide(
  api: StoreSyncSdk,
  id: string | number,
): Promise<void> {
  await api.guides.remove(id)
}

async function reorderGuides(
  api: StoreSyncSdk,
  ordered: GuideGroup[]
): Promise<void> {
  const withOrder = applyOrderToGroups(ordered)
  for (const grp of withOrder) {
    const c = parseContent(grp.content)
    await api.guides.update(grp.id, {
      isVisible: grp.isVisible,
      content: c,
    })
  }
}

interface GuidesListCacheSnapshot {
  queryKey: readonly unknown[]
  previous: ListResult | undefined
}

function patchGuidesListOrderCache(
  queryClient: QueryClient,
  ordered: GuideGroup[]
): GuidesListCacheSnapshot[] {
  const optimisticById = new Map(
    applyOrderToGroups(ordered).map((grp) => [grp.id, grp] as const)
  )
  const snapshots: GuidesListCacheSnapshot[] = []

  for (const [queryKey, old] of queryClient.getQueriesData<ListResult>({
    queryKey: ["admin", "guides"],
  })) {
    if (!old?.data) continue

    snapshots.push({ queryKey, previous: old })
    queryClient.setQueryData<ListResult>(queryKey, {
      ...old,
      data: old.data.map((grp) => optimisticById.get(grp.id) ?? grp),
    })
  }

  return snapshots
}

export function useCreateGuideMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã tạo nhóm hướng dẫn",
      error: (error) => error.message || "Không thể tạo nhóm",
    },
    mutationFn: createGuide,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] })
    },
  })
}

export function useUpdateGuideMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã cập nhật",
      error: (error) => error.message || "Không thể cập nhật",
    },
    mutationFn: updateGuide,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] })
    },
  })
}

export function useDeleteGuideMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã xóa nhóm",
      error: (error) => error.message || "Không thể xóa",
    },
    mutationFn: ({ api, id }: { api: StoreSyncSdk; id: string | number }) =>
      deleteGuide(api, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] })
    },
  })
}

export function useReorderGuidesMutation() {
  const queryClient = useQueryClient()

  return useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: "Đã lưu thứ tự",
      error: (error) => error.message || "Không thể lưu thứ tự",
    },
    mutationFn: ({
      api,
      ordered,
    }: {
      api: StoreSyncSdk
      ordered: GuideGroup[]
    }) => reorderGuides(api, ordered),
    onMutate: async ({ ordered }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "guides"] })
      const snapshots = patchGuidesListOrderCache(queryClient, ordered)
      return { snapshots }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] })
    },
  })
}
