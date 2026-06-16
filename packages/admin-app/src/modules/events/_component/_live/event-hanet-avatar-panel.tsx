"use client"

import Link from "next/link"
import { ExternalLink, Loader2, RefreshCw, Users } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModulePath } from "@workspace/admin-app/runtime"
import type { HanetSyncAvatarsResult } from "@workspace/api-client"
import {
  HanetAvatarCard,
  useHanetAvatarsQuery,
} from "@workspace/admin-app/modules/hanet/_component"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet/_component/hanet-place-select"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { useCallback, useState } from "react"

export function EventHanetAvatarPanel({
  defaultPlaceId,
}: {
  defaultPlaceId?: string | null
}) {
  const queryClient = useQueryClient()
  const hanetPath = useAdminModulePath("hanet")
  const { data: hanetStatus } = useHanetStatusQuery()
  const [search, setSearch] = useState("")
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)

  const avatarsQuery = useHanetAvatarsQuery({
    page: 1,
    limit: 12,
    search,
  })

  const effectivePlaceId =
    selectedPlaceId || defaultPlaceId || hanetStatus?.defaultPlaceId || ""

  const syncMutation = useAdminMutation({
    mutationKey: ["hanet", "avatars", "sync"],
    mutationFn: () =>
      api.hanet.syncPersonAvatars(effectivePlaceId || undefined),
    toast: {
      loading: "Đang đồng bộ avatar từ HANET…",
      success: (res: HanetSyncAvatarsResult) =>
        `Đã đồng bộ ${res.fetched} người (${res.created} mới, ${res.updated} cập nhật)`,
      error: (err) =>
        err instanceof Error ? err.message : "Không đồng bộ được avatar HANET",
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hanet", "avatars"] })
    },
  })

  const onSearch = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const items = avatarsQuery.data?.items ?? []
  const total = avatarsQuery.data?.total ?? 0

  return (
    <div className="space-y-3 rounded-md border border-border/70 bg-background px-3 py-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Users className="size-4 shrink-0 text-primary" aria-hidden />
        <p className="font-medium text-foreground">Avatar HANET đã lưu</p>
        <span className="text-muted-foreground">{total} bản ghi</span>
        <Link
          href={`${hanetPath()}/avatar`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Xem trang đầy đủ
          <ExternalLink className="size-3" aria-hidden />
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto h-7 gap-1.5 text-xs"
          disabled={syncMutation.isPending || !effectivePlaceId}
          onClick={() => syncMutation.mutate()}
        >
          {syncMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Đồng bộ
        </Button>
      </div>

      {hanetStatus?.configured ? (
        <HanetPlaceSelect
          value={selectedPlaceId}
          onChange={setSelectedPlaceId}
          defaultPlaceId={defaultPlaceId ?? hanetStatus.defaultPlaceId}
          disabled={syncMutation.isPending}
        />
      ) : null}

      <Input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Tìm tên, email, personID…"
        className="h-8 text-xs"
      />

      {avatarsQuery.isLoading ? (
        <div className="flex items-center gap-2 py-4 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Đang tải…
        </div>
      ) : items.length ? (
        <div className="flex flex-col gap-2">
          {items.map((row) => (
            <HanetAvatarCard key={row.id} row={row} compact />
          ))}
        </div>
      ) : (
        <p className="py-3 text-center text-muted-foreground">
          Chưa có avatar —{" "}
          <Link href={`${hanetPath()}?tab=avatars`} className="text-primary hover:underline">
            mở trang HANET → Avatar
          </Link>
        </p>
      )}
    </div>
  )
}
