"use client"

import { ExternalLink, Loader2, XCircle } from "lucide-react"
import {
  DataTableRowActionsMenu,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import { getCancelRegistrationState } from "@/lib/my-registered-events"
import type { MyRegisteredEventRow } from "./types"

export type MyRegisteredEventRowActionHandlers = {
  onView: (row: MyRegisteredEventRow) => void
  onCancel: (row: MyRegisteredEventRow) => void | Promise<void>
  cancellingId?: string | null
}

function buildRowActions(
  row: MyRegisteredEventRow,
  handlers: MyRegisteredEventRowActionHandlers,
): DataTableRowActionItem[] {
  const cancelState = getCancelRegistrationState(row)
  const isCancelling = handlers.cancellingId === row.id

  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: "Xem sự kiện",
      hint: "Mở trang chi tiết và vé điện tử",
      icon: <ExternalLink className="size-4" />,
      onClick: () => handlers.onView(row),
      group: "primary",
    },
  ]

  if (cancelState.allowed || isCancelling) {
    actions.push({
      key: "cancel",
      label: "Hủy đăng ký",
      hint: cancelState.allowed
        ? "Chỉ hủy khi còn trong thời gian đăng ký"
        : cancelState.reason,
      icon: isCancelling ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <XCircle className="size-4" />
      ),
      disabled: !cancelState.allowed || isCancelling,
      title: !cancelState.allowed ? cancelState.reason : undefined,
      menuVariant: "destructive",
      group: "danger",
      confirm: cancelState.allowed
        ? {
            title: "Hủy đăng ký sự kiện?",
            description: `Bạn sẽ hủy đăng ký «${row.event.title}». Thao tác này không thể hoàn tác.`,
            confirmLabel: "Hủy đăng ký",
            destructive: true,
          }
        : false,
      onClick: () => handlers.onCancel(row),
    })
  }

  return actions
}

export function MyRegisteredEventRowActions({
  row,
  handlers,
}: {
  row: MyRegisteredEventRow
  handlers: MyRegisteredEventRowActionHandlers
}) {
  const actions = buildRowActions(row, handlers)
  const busy = handlers.cancellingId === row.id

  return (
    <div className="flex w-full justify-center">
      <DataTableRowActionsMenu
        actions={actions}
        busy={busy}
        triggerLabel="Thao tác đăng ký sự kiện"
        groups={{
          primary: { label: "Sự kiện" },
          danger: { label: "Hủy đăng ký", sublabel: true },
        }}
      />
    </div>
  )
}
