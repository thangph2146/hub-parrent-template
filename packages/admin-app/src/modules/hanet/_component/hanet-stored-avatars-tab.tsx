"use client"

import { useState } from "react"
import { Database, Loader2 } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { DataTableToolbarField } from "@ui/components/data-table"
import {
  HanetAvatarCard,
  useHanetAvatarsQuery,
} from "@workspace/admin-app/modules/hanet/_component"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"

const PAGE_SIZE = 24

export function HanetStoredAvatarsTab() {
  const { data: hanetStatus } = useHanetStatusQuery()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  const query = useHanetAvatarsQuery({
    page,
    limit: PAGE_SIZE,
    search: appliedSearch,
    enabled: hanetStatus?.configured === true,
  })

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (!hanetStatus?.configured) {
    return (
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
        Chưa cấu hình HANET OAuth.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-sm">
        <DataTableToolbarField label="Tìm kiếm" className="min-w-[12rem] flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tên, aliasID, personID…"
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAppliedSearch(search)
                setPage(1)
              }
            }}
          />
        </DataTableToolbarField>
        <Button
          type="button"
          size="sm"
          className="h-9"
          disabled={query.isFetching}
          onClick={() => {
            setAppliedSearch(search)
            setPage(1)
          }}
        >
          Tải danh sách
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        <Database className="mr-1 inline size-3.5" />
        Bản ghi Hub{" "}
        <code className="text-xs">GET /admin/hanet/avatars</code> (bảng{" "}
        <code className="text-xs">face_data</code>) ·{" "}
        <span className="font-medium text-foreground">{total}</span> bản ghi
        {appliedSearch ? (
          <>
            {" "}
            · lọc «{appliedSearch}»
          </>
        ) : null}
        . Ảnh trên disk (folder MSSV/userId) xem tab «Kho disk».
      </p>

      {query.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Đang tải avatar đã lưu…
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Chưa có avatar trong face_data — dùng tab «HANET (live)» và bấm «Đồng bộ
          vào face_data».
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((row) => (
            <HanetAvatarCard key={row.id} row={row} />
          ))}
        </div>
      )}

      {total > PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
          <span className="text-muted-foreground">
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
