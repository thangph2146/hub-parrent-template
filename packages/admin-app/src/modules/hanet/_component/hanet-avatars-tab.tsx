"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import { api } from "@workspace/admin-app/lib/api"
import type { HanetSyncAvatarsResult } from "@workspace/api-client"
import { useQueryClient } from "@tanstack/react-query"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import {
  HanetAvatarCard,
  useHanetAvatarsQuery,
} from "@workspace/admin-app/modules/hanet-avatars/_component"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"

const PAGE_SIZE = 50

export function HanetAvatarsTab() {
  const queryClient = useQueryClient()
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput, 350)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const listQuery = useHanetAvatarsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  })

  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

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

  const items = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{total}</span> avatar đã
          lưu
          {items.length < total ? (
            <>
              {" "}
              · hiển thị {items.length} / trang {page}
            </>
          ) : null}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={
            !hanetStatus?.configured ||
            syncMutation.isPending ||
            !effectivePlaceId
          }
          onClick={() => syncMutation.mutate()}
        >
          {syncMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Đồng bộ từ HANET
        </Button>
        <Link
          href="https://developers.hanet.ai/document"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Tài liệu HANET
        </Link>
      </div>

      {hanetStatus?.configured && !effectivePlaceId ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Chọn địa điểm HANET bên dưới rồi bấm &quot;Đồng bộ từ HANET&quot;.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        {hanetStatus?.configured ? (
          <div className="min-w-[min(100%,16rem)] flex-1">
            <HanetPlaceSelect
              value={selectedPlaceId}
              onChange={setSelectedPlaceId}
              defaultPlaceId={hanetStatus.defaultPlaceId}
              disabled={syncMutation.isPending}
            />
          </div>
        ) : null}
        <div className="relative w-full max-w-md sm:min-w-[14rem] sm:flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm tên, mã SV, email, personID…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {listQuery.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Không tải được danh sách</p>
              <p className="mt-1 text-sm opacity-90">{listQuery.error.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      {listQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Đang tải avatar…
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((row) => (
            <HanetAvatarCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/80 py-16 text-center text-sm text-muted-foreground">
          Chưa có avatar — chọn địa điểm và đồng bộ từ HANET.
        </div>
      )}

      {total > PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || listQuery.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || listQuery.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
