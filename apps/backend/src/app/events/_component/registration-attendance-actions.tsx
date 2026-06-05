"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
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

  const actions: DataTableRowActionItem[] = [
    {
      key: "checkin",
      label: "Ghi nhận check-in",
      hint: hasCheckin
        ? "Đã có check-in — không ghi nhận lại"
        : "Đánh dấu người tham dự đã vào sự kiện",
      onClick: () => mutation.mutate("checkin"),
      icon: <LogIn />,
      group: "primary",
      disabled: hasCheckin || busy || !registrationId,
    },
    {
      key: "checkout",
      label: "Ghi nhận check-out",
      hint: hasCheckout
        ? "Đã có check-out — không ghi nhận lại"
        : !hasCheckin
          ? "Cần check-in trước khi check-out"
          : "Đánh dấu người tham dự đã rời sự kiện",
      onClick: () => mutation.mutate("checkout"),
      icon: <LogOut />,
      group: "primary",
      disabled: hasCheckout || !hasCheckin || busy || !registrationId,
    },
    {
      key: "reset-checkout",
      label: "Hoàn tác check-out",
      hint: !hasCheckout
        ? "Chưa có check-out để hoàn tác"
        : "Bỏ trạng thái check-out, giữ check-in",
      onClick: () => mutation.mutate("reset-checkout"),
      icon: <Undo2 />,
      group: "status",
      disabled: !hasCheckout || busy || !registrationId,
    },
    {
      key: "reset-checkin",
      label: "Hoàn tác check-in",
      hint: !hasCheckin
        ? "Chưa có check-in để hoàn tác"
        : "Bỏ check-in (và check-out nếu có)",
      onClick: () => mutation.mutate("reset-checkin"),
      icon: <RotateCcw />,
      group: "status",
      disabled: !hasCheckin || busy || !registrationId,
    },
    {
      key: "reset-all",
      label: "Xóa toàn bộ trạng thái",
      hint:
        !hasCheckin && !hasCheckout
          ? "Chưa có trạng thái để xóa"
          : "Xóa cả check-in và check-out",
      onClick: () => mutation.mutate("reset-all"),
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      disabled: (!hasCheckin && !hasCheckout) || busy || !registrationId,
    },
  ]

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
