"use client"

import { Camera, Copy, Radio } from "lucide-react"
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import type { HanetDeviceOption } from "@workspace/admin-app/lib/hanet-device-parse"

export type HanetDeviceRowActionsProps = {
  device: HanetDeviceOption
  busy?: boolean
  ensureBusy?: boolean
  onCheckConnection: () => void
  onEnsureCamera?: () => void
}

export function HanetDeviceRowActions({
  device,
  busy,
  ensureBusy,
  onCheckConnection,
  onEnsureCamera,
}: HanetDeviceRowActionsProps) {
  const actions: DataTableRowActionItem[] = [
    {
      key: "check-connection",
      label: "Kiểm tra kết nối",
      hint: "Gọi getConnectionStatus cho thiết bị này",
      onClick: onCheckConnection,
      icon: <Radio />,
      group: "primary",
      disabled: busy,
    },
  ]

  if (onEnsureCamera) {
    actions.push({
      key: "ensure-camera",
      label: "Gắn camera Hub",
      hint: "Tạo/cập nhật bản ghi cameras theo deviceID (gắn sự kiện)",
      onClick: onEnsureCamera,
      icon: <Camera />,
      group: "primary",
      disabled: ensureBusy,
    })
  }

  if (device.deviceId) {
    actions.push({
      key: "copy-device-id",
      label: "Sao chép deviceID",
      hint: device.deviceId,
      onClick: () => {
        void navigator.clipboard.writeText(device.deviceId)
      },
      icon: <Copy />,
      group: "primary",
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={busy || ensureBusy}
      autoConfirmDangerousActions={false}
      triggerLabel={`Thao tác thiết bị ${device.name || device.deviceId}`}
      groups={{
        primary: { label: "Thao tác", sublabel: false },
      }}
    />
  )
}

export const hanetDeviceActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
}
