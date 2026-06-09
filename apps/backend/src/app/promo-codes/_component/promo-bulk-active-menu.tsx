"use client"

import { ChevronDown, Power, PowerOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"

export function PromoBulkActiveMenu({
  disabled,
  onActivate,
  onDeactivate,
}: {
  disabled?: boolean
  onActivate: () => void
  onDeactivate: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Power className="size-3.5 shrink-0" aria-hidden />
        Trạng thái mã
        <ChevronDown className="size-3 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Áp dụng cho mã đã chọn
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 py-2" onClick={onActivate}>
            <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15">
              <Power className="size-3.5 text-emerald-700 dark:text-emerald-400" />
            </span>
            <span className="font-medium">Bật mã</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 py-2" onClick={onDeactivate}>
            <span className="flex size-7 items-center justify-center rounded-md bg-amber-500/15">
              <PowerOff className="size-3.5 text-amber-700 dark:text-amber-400" />
            </span>
            <span className="font-medium">Tắt mã</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
