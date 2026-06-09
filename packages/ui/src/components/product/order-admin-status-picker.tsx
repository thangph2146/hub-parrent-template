"use client"

import { ChevronDown, Loader2 } from "lucide-react"
import type { OrderStatus } from "@workspace/api-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { StoreOrderStatusBadge } from "../badge-presets"
import { ORDER_STATUS_VISUAL } from "./order-status-visual"
import { cn } from "../../lib/utils"

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]

export type OrderAdminStatusPickerProps = {
  value: OrderStatus
  onChange: (status: OrderStatus) => void
  disabled?: boolean
  pending?: boolean
  className?: string
}

export function OrderAdminStatusPicker({
  value,
  onChange,
  disabled,
  pending,
  className,
}: OrderAdminStatusPickerProps) {
  const visual = ORDER_STATUS_VISUAL[value]
  const Icon = visual.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || pending}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-outline-variant/30 bg-background px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              visual.iconBgClassName,
            )}
          >
            <Icon className={cn("size-4", visual.iconClassName)} aria-hidden />
          </span>
          <span className="min-w-0 space-y-0.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái đơn
            </span>
            <StoreOrderStatusBadge status={value} className="max-w-full" />
          </span>
        </span>
        {pending ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,16rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Cập nhật trạng thái
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ALL_STATUSES.map((status) => {
            const itemVisual = ORDER_STATUS_VISUAL[status]
            const ItemIcon = itemVisual.icon
            const selected = status === value
            return (
              <DropdownMenuItem
                key={status}
                className={cn("gap-2 py-2", selected && "bg-muted/60")}
                onClick={() => onChange(status)}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    itemVisual.iconBgClassName,
                  )}
                >
                  <ItemIcon
                    className={cn("size-3.5", itemVisual.iconClassName)}
                    aria-hidden
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <StoreOrderStatusBadge status={status} />
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
