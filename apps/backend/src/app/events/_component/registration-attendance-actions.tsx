"use client"

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
import { MoreHorizontal, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import {
  asAttendanceBool,
  buildManualAttendancePayload,
  buildPayloadFromRegistrationRow,
} from "./_live/event-attendance-sync"
import { useEventAttendanceContext } from "./_live/event-attendance-provider"

type RegistrationRow = Record<string, unknown>

type AttendanceAction =
  | "checkin"
  | "checkout"
  | "reset-checkin"
  | "reset-checkout"
  | "reset-all"

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant={compact ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1"
            disabled={busy || !registrationId}
            aria-label="Thao tác trạng thái check-in"
          />
        }
      >
        {busy ? (
          <RefreshCw className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <MoreHorizontal className="size-3.5" aria-hidden />
        )}
        {compact ? "Sửa trạng thái" : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Trạng thái check-in</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={hasCheckin || busy}
            onClick={() => mutation.mutate("checkin")}
          >
            Ghi nhận check-in
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={hasCheckout || busy}
            onClick={() => mutation.mutate("checkout")}
          >
            Ghi nhận check-out
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={(!hasCheckin && !hasCheckout) || busy}
            onClick={() => mutation.mutate("reset-checkout")}
          >
            Hoàn tác check-out
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasCheckin || busy}
            onClick={() => mutation.mutate("reset-checkin")}
          >
            Hoàn tác check-in
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={(!hasCheckin && !hasCheckout) || busy}
            onClick={() => mutation.mutate("reset-all")}
            variant="destructive"
          >
            Xóa toàn bộ trạng thái
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
