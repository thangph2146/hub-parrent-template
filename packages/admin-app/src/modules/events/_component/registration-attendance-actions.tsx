"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useQueryClient } from "@tanstack/react-query"
import {
  ClipboardList,
  LogIn,
  LogOut,
  RotateCcw,
  Trash2,
  Undo2,
} from "lucide-react"
import {
  DataTableRowActionsMenu,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import {
  asAttendanceBool,
  buildManualAttendancePayload,
  buildPayloadFromRegistrationRow,
} from "./_live/event-attendance-sync"
import { useEventAttendanceContext } from "./_live/event-attendance-provider"
import { AttendanceStatusBadge } from "./attendance-status"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
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

  const mutation = useAdminMutation({
    toast: {
      loading: "Đang cập nhật điểm danh…",
      success: "Đã cập nhật điểm danh",
      error: (err) =>
        err instanceof Error ? err.message : "Không cập nhật được điểm danh",
    },
    mutationFn: async (action: AttendanceAction) => {
      return api.eventRegistrations.setAttendance<RegistrationRow>(
        registrationId,
        { action }
      )
    },
    onMutate: async (action) => {
      const payload = buildManualAttendancePayload(
        eventId,
        registrationId,
        row,
        action
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
    onError: (_err, _action, ...rest) => {
      const context = rest[0] as { previous?: RegistrationRow[] } | undefined
      if (context?.previous) {
        queryClient.setQueryData(
          ["events", eventId, "registrations"],
          context.previous
        )
      }
    },
    onSuccess: (updated) => {
      applyAttendance(buildPayloadFromRegistrationRow(eventId, updated))
    },
  })

  const busy = mutation.isPending

  const actions: DataTableRowActionItem[] = []

  if (!hasCheckin && !busy && registrationId) {
    actions.push({
      key: "checkin",
      label: "Ghi nhận check-in",
      hint: "Đánh dấu người tham dự đã vào sự kiện",
      onClick: () => mutation.mutate("checkin"),
      icon: <LogIn />,
      group: "primary",
    })
  }

  if (!hasCheckout && hasCheckin && !busy && registrationId) {
    actions.push({
      key: "checkout",
      label: "Ghi nhận check-out",
      hint: "Đánh dấu người tham dự đã rời sự kiện",
      onClick: () => mutation.mutate("checkout"),
      icon: <LogOut />,
      group: "primary",
    })
  }

  if (hasCheckout && !busy && registrationId) {
    actions.push({
      key: "reset-checkout",
      label: "Hoàn tác check-out",
      hint: "Bỏ trạng thái check-out, giữ check-in",
      onClick: () => mutation.mutate("reset-checkout"),
      icon: <Undo2 />,
      group: "status",
    })
  }

  if (hasCheckin && !busy && registrationId) {
    actions.push({
      key: "reset-checkin",
      label: "Hoàn tác check-in",
      hint: "Bỏ check-in (và check-out nếu có)",
      onClick: () => mutation.mutate("reset-checkin"),
      icon: <RotateCcw />,
      group: "status",
    })
  }

  if ((hasCheckin || hasCheckout) && !busy && registrationId) {
    actions.push({
      key: "reset-all",
      label: "Xóa toàn bộ trạng thái",
      hint: "Xóa cả check-in và check-out",
      onClick: () => mutation.mutate("reset-all"),
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
    })
  }

  if (compact) {
    return (
      <DataTableRowActionsMenu
        actions={actions}
        busy={busy}
        triggerLabel="Thao tác trạng thái check-in"
        groups={{
          primary: { label: "Trạng thái check-in", icon: ClipboardList },
          status: {
            label: "Hoàn tác",
            sublabel: true,
            header: (
              <div className="mb-1.5 px-1">
                <AttendanceStatusBadge row={{ hasCheckin, hasCheckout }} />
              </div>
            ),
          },
          danger: { label: "Xóa trạng thái", sublabel: true },
        }}
      />
    )
  }

  return (
    <div className="flex w-full justify-center">
      <DataTableRowActionsMenu
        actions={actions}
        busy={busy}
        triggerLabel="Thao tác trạng thái check-in"
        className="w-full"
        groups={{
          primary: { label: "Trạng thái check-in", icon: ClipboardList },
          status: {
            label: "Hoàn tác",
            sublabel: true,
            header: (
              <div className="mb-1.5 px-1">
                <AttendanceStatusBadge row={{ hasCheckin, hasCheckout }} />
              </div>
            ),
          },
          danger: { label: "Xóa trạng thái", sublabel: true },
        }}
      />
    </div>
  )
}
