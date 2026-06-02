"use client"

import type { ComponentType } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import {
  ChevronDown,
  ClipboardList,
  LogIn,
  LogOut,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Trash2,
  Undo2,
} from "lucide-react"
import { api } from "@/lib/api"
import {
  asAttendanceBool,
  buildManualAttendancePayload,
  buildPayloadFromRegistrationRow,
} from "./_live/event-attendance-sync"
import { useEventAttendanceContext } from "./_live/event-attendance-provider"
import { AttendanceStatusBadge } from "./attendance-status"

type RegistrationRow = Record<string, unknown>

type AttendanceAction =
  | "checkin"
  | "checkout"
  | "reset-checkin"
  | "reset-checkout"
  | "reset-all"

function AttendanceMenuItem({
  icon: Icon,
  iconClassName,
  iconBgClassName,
  label,
  hint,
  disabled,
  variant = "default",
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  iconClassName?: string
  iconBgClassName?: string
  label: string
  hint?: string
  disabled?: boolean
  variant?: "default" | "destructive"
  onClick?: () => void
}) {
  return (
    <DropdownMenuItem
      disabled={disabled}
      variant={variant}
      onClick={onClick}
      className="items-start gap-2.5 py-2"
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          iconBgClassName ?? "bg-muted",
        )}
      >
        <Icon className={cn("size-3.5", iconClassName)} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium leading-tight">{label}</span>
        {hint ? (
          <span className="text-[11px] leading-snug text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </DropdownMenuItem>
  )
}

export function RegistrationAttendanceActions({
  eventId,
  row,
  compact,
}: {
  eventId: string
  row: RegistrationRow
  compact?: boolean
}) {
  const queryClient = useQueryClient()
  const { applyAttendance } = useEventAttendanceContext()
  const registrationId = String(row.id ?? "")
  const hasCheckin = asAttendanceBool(row.hasCheckin)
  const hasCheckout = asAttendanceBool(row.hasCheckout)

  const mutation = useMutation({
    mutationFn: async (action: AttendanceAction) => {
      return api.eventRegistrations.setAttendance<RegistrationRow>(
        registrationId,
        { action },
      )
    },
    onMutate: async (action) => {
      const payload = buildManualAttendancePayload(
        eventId,
        registrationId,
        row,
        action,
      )
      applyAttendance(payload)
      await queryClient.cancelQueries({
        queryKey: ["events", eventId, "registrations"],
      })
      const previous = queryClient.getQueryData<RegistrationRow[]>([
        "events",
        eventId,
        "registrations",
      ])
      return { previous, payload }
    },
    onError: (_err, _action, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["events", eventId, "registrations"],
          context.previous,
        )
      }
    },
    onSuccess: (updated) => {
      applyAttendance(buildPayloadFromRegistrationRow(eventId, updated))
    },
  })

  const busy = mutation.isPending

  const triggerLabel = compact ? "Sửa trạng thái" : "Thao tác"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant={compact ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 gap-1.5 rounded-lg font-medium",
              compact && "shadow-sm",
            )}
            disabled={busy || !registrationId}
            aria-label="Thao tác trạng thái check-in"
          />
        }
      >
        {busy ? (
          <RefreshCw className="size-3.5 animate-spin" aria-hidden />
        ) : compact ? (
          <ClipboardList className="size-3.5" aria-hidden />
        ) : (
          <MoreHorizontal className="size-3.5" aria-hidden />
        )}
        {compact ? (
          <>
            <span className="hidden sm:inline">{triggerLabel}</span>
            <span className="sm:hidden">Trạng thái</span>
            <ChevronDown className="size-3 opacity-70" aria-hidden />
          </>
        ) : (
          <span className="sr-only">{triggerLabel}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 px-1 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <ClipboardList className="size-3.5 shrink-0 text-primary" />
            Trạng thái check-in
          </DropdownMenuLabel>
          <div className="mb-1.5 px-1">
            <AttendanceStatusBadge
              row={{ hasCheckin, hasCheckout }}
            />
          </div>
          <AttendanceMenuItem
            icon={LogIn}
            iconBgClassName="bg-emerald-500/15"
            iconClassName="text-emerald-700 dark:text-emerald-400"
            label="Ghi nhận check-in"
            hint={
              hasCheckin
                ? "Đã có check-in — không ghi nhận lại"
                : "Đánh dấu người tham dự đã vào sự kiện"
            }
            disabled={hasCheckin || busy}
            onClick={() => mutation.mutate("checkin")}
          />
          <AttendanceMenuItem
            icon={LogOut}
            iconBgClassName="bg-sky-500/15"
            iconClassName="text-sky-700 dark:text-sky-400"
            label="Ghi nhận check-out"
            hint={
              hasCheckout
                ? "Đã có check-out — không ghi nhận lại"
                : !hasCheckin
                  ? "Cần check-in trước khi check-out"
                  : "Đánh dấu người tham dự đã rời sự kiện"
            }
            disabled={hasCheckout || !hasCheckin || busy}
            onClick={() => mutation.mutate("checkout")}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1 py-1 text-[11px] font-medium text-muted-foreground">
            Hoàn tác / xóa
          </DropdownMenuLabel>
          <AttendanceMenuItem
            icon={Undo2}
            iconBgClassName="bg-amber-500/15"
            iconClassName="text-amber-700 dark:text-amber-400"
            label="Hoàn tác check-out"
            hint={
              !hasCheckout
                ? "Chưa có check-out để hoàn tác"
                : "Bỏ trạng thái check-out, giữ check-in"
            }
            disabled={!hasCheckout || busy}
            onClick={() => mutation.mutate("reset-checkout")}
          />
          <AttendanceMenuItem
            icon={RotateCcw}
            iconBgClassName="bg-violet-500/15"
            iconClassName="text-violet-700 dark:text-violet-400"
            label="Hoàn tác check-in"
            hint={
              !hasCheckin
                ? "Chưa có check-in để hoàn tác"
                : "Bỏ check-in (và check-out nếu có)"
            }
            disabled={!hasCheckin || busy}
            onClick={() => mutation.mutate("reset-checkin")}
          />
          <AttendanceMenuItem
            icon={Trash2}
            iconBgClassName="bg-destructive/10"
            iconClassName="text-destructive"
            label="Xóa toàn bộ trạng thái"
            hint={
              !hasCheckin && !hasCheckout
                ? "Chưa có trạng thái để xóa"
                : "Xóa cả check-in và check-out"
            }
            disabled={(!hasCheckin && !hasCheckout) || busy}
            variant="destructive"
            onClick={() => mutation.mutate("reset-all")}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
