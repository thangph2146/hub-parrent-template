"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import type { StoreSyncSdk } from "@workspace/api-client";
import type { GuideFormData, UpdateGuideData, GuideGroup, ListResult } from "../types";
import { PAGE_KEY, parseContent, applyOrderToGroups } from "../utils";

interface CreateGuideVariables {
  api: StoreSyncSdk;
  data: GuideFormData;
  nextOrder: number;
}

interface UpdateGuideVariables {
  api: StoreSyncSdk;
  id: string;
  data: UpdateGuideData;
}

async function createGuide({ api, data, nextOrder }: CreateGuideVariables): Promise<void> {
  await api.guides.create({
    pageKey: PAGE_KEY,
    sectionKey: data.sectionKey,
    isVisible: data.isVisible,
    content: { ...data.content, order: nextOrder },
  });
}

async function updateGuide({ api, id, data }: UpdateGuideVariables): Promise<void> {
  await api.guides.update(id, data as unknown as Record<string, unknown>);
}

async function deleteGuide(api: StoreSyncSdk, id: string): Promise<void> {
  await api.guides.remove(id);
}

async function reorderGuides(api: StoreSyncSdk, ordered: GuideGroup[]): Promise<void> {
  const withOrder = applyOrderToGroups(ordered);
  for (const grp of withOrder) {
    const c = parseContent(grp.content);
    await api.guides.update(grp.id, {
      isVisible: grp.isVisible,
      content: c,
    });
  }
}

interface GuidesListCacheSnapshot {
  queryKey: readonly unknown[];
  previous: ListResult | undefined;
}

function patchGuidesListOrderCache(
  queryClient: QueryClient,
  ordered: GuideGroup[],
): GuidesListCacheSnapshot[] {
  const optimisticById = new Map(
    applyOrderToGroups(ordered).map((grp) => [grp.id, grp] as const),
  );
  const snapshots: GuidesListCacheSnapshot[] = [];

  for (const [queryKey, old] of queryClient.getQueriesData<ListResult>({
    queryKey: ["admin", "guides"],
  })) {
    if (!old?.data) continue;

    snapshots.push({ queryKey, previous: old });
    queryClient.setQueryData<ListResult>(queryKey, {
      ...old,
      data: old.data.map((grp) => optimisticById.get(grp.id) ?? grp),
    });
  }

  return snapshots;
}

export function useCreateGuideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGuide,
    onSuccess: () => {
      toast.success("Đã tạo nhóm hướng dẫn");
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể tạo nhóm");
    },
  });
}

export function useUpdateGuideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGuide,
    onSuccess: () => {
      toast.success("Đã cập nhật");
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể cập nhật");
    },
  });
}

export function useDeleteGuideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ api, id }: { api: StoreSyncSdk; id: string }) => deleteGuide(api, id),
    onSuccess: () => {
      toast.success("Đã xóa nhóm");
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa");
    },
  });
}

export function useReorderGuidesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ api, ordered }: { api: StoreSyncSdk; ordered: GuideGroup[] }) =>
      reorderGuides(api, ordered),
    onMutate: async ({ ordered }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "guides"] });
      const snapshots = patchGuidesListOrderCache(queryClient, ordered);
      return { snapshots };
    },
    onSuccess: () => {
      toast.success("Đã lưu thứ tự");
      void queryClient.invalidateQueries({ queryKey: ["admin", "guides"] });
    },
    onError: (error: Error, _variables, context) => {
      for (const { queryKey, previous } of context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, previous);
      }
      toast.error(error.message || "Không thể lưu thứ tự");
    },
  });
}
