"use client"

import { ChevronDown, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { StoreOrderStatusBadge } from "@ui/components/product"
import type { OrderStatus } from "@workspace/api-client"
import { ORDER_STATUSES } from "./types"
import { ORDER_STATUS_VISUAL } from "./order-status-visual"

export function OrderBulkStatusMenu({
  disabled,
  onPickStatus,
}: {
  disabled?: boolean
  onPickStatus: (status: OrderStatus) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Package className="size-3.5 shrink-0" aria-hidden />
        Đổi trạng thái
        <ChevronDown className="size-3 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Chọn trạng thái mới
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ORDER_STATUSES.map((status) => {
            const visual = ORDER_STATUS_VISUAL[status]
            const Icon = visual.icon
            return (
              <DropdownMenuItem
                key={status}
                className="gap-2 py-2"
                onClick={() => onPickStatus(status)}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-md ${visual.iconBgClassName}`}
                >
                  <Icon className={`size-3.5 ${visual.iconClassName}`} />
                </span>
                <StoreOrderStatusBadge status={status} className="shrink-0" />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
