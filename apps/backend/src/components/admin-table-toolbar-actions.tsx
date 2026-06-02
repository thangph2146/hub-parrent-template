"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"

type AdminTableToolbarActionsProps = {
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

/** Nút phụ cạnh ô tìm nhanh (vd. Làm mới). Xóa bộ lọc dùng prop `onClearFilters` trên AdminDataTable. */
export function AdminTableToolbarActions({
  onRefresh,
  isRefreshing = false,
  className,
}: AdminTableToolbarActionsProps) {
  if (!onRefresh) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button type="button" variant="outline" onClick={() => void onRefresh()}>
        <RefreshCw
          className={isRefreshing ? "size-4 animate-spin" : "size-4"}
          aria-hidden
        />
        Làm mới
      </Button>
    </div>
  )
}
