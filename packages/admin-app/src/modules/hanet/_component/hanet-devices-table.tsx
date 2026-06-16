"use client"

import { useMemo, type ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Camera, Loader2 } from "lucide-react"
import { AdminDataTable, defineDataTableActionsColumn } from "@ui/components/data-table"
import { FieldCopyButton } from "@ui/components/field"
import type { HanetDeviceOption } from "@workspace/admin-app/lib/hanet-device-parse"
import { ConnectionStatusBadge } from "./hanet-device-connection-panel"
import {
  HanetDeviceRowActions,
  hanetDeviceActionsColumnMeta,
} from "./hanet-device-row-actions"

export type HanetDeviceConnectionStatusMap = Record<string, boolean | undefined>

export type HanetDevicesTableProps = {
  data: HanetDeviceOption[]
  isLoading?: boolean
  emptyLabel?: string
  filterToolbarExtra?: ReactNode
  connectionStatusByDeviceId?: HanetDeviceConnectionStatusMap
  checkingDeviceId?: string | null
  isCheckingConnection?: boolean
  ensuringDeviceId?: string | null
  isEnsuringCamera?: boolean
  onCheckConnection: (deviceId: string) => void
  onEnsureCamera?: (device: HanetDeviceOption) => void
}

export function HanetDevicesTable({
  data,
  isLoading = false,
  emptyLabel = "Không có thiết bị cho địa điểm này.",
  filterToolbarExtra,
  connectionStatusByDeviceId = {},
  checkingDeviceId = null,
  isCheckingConnection = false,
  ensuringDeviceId = null,
  isEnsuringCamera = false,
  onCheckConnection,
  onEnsureCamera,
}: HanetDevicesTableProps) {
  const columns = useMemo<ColumnDef<HanetDeviceOption>[]>(
    () => [
      {
        accessorKey: "deviceId",
        header: "deviceID",
        enableColumnFilter: false,
        size: 200,
        cell: ({ getValue }) => {
          const deviceId = String(getValue() ?? "").trim()
          if (!deviceId) return "—"
          return (
            <div className="flex items-center gap-2">
              <code className="text-xs font-medium">{deviceId}</code>
              <FieldCopyButton text={deviceId} />
            </div>
          )
        },
      },
      {
        accessorKey: "name",
        header: "Tên",
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const name = String(getValue() ?? "").trim() || "—"
          return (
            <div className="flex min-w-0 items-center gap-2">
              <Camera
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 truncate">{name}</span>
            </div>
          )
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        enableColumnFilter: false,
        size: 120,
        cell: ({ row }) => {
          const deviceId = row.original.deviceId
          const isChecking =
            isCheckingConnection && checkingDeviceId === deviceId
          const online = connectionStatusByDeviceId[deviceId]

          if (isChecking) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Đang kiểm tra…
              </span>
            )
          }

          if (online === undefined) {
            return (
              <span className="text-xs text-muted-foreground">Chưa kiểm tra</span>
            )
          }

          return <ConnectionStatusBadge online={online} />
        },
      },
      defineDataTableActionsColumn<HanetDeviceOption>({
        columnMeta: hanetDeviceActionsColumnMeta,
        cell: ({ row }) => {
          const deviceId = row.original.deviceId
          const isBusy =
            isCheckingConnection && checkingDeviceId === deviceId
          const isEnsuring =
            isEnsuringCamera && ensuringDeviceId === deviceId

          return (
            <HanetDeviceRowActions
              device={row.original}
              busy={isBusy}
              ensureBusy={isEnsuring}
              onCheckConnection={() => onCheckConnection(deviceId)}
              onEnsureCamera={
                onEnsureCamera
                  ? () => onEnsureCamera(row.original)
                  : undefined
              }
            />
          )
        },
      }),
    ],
    [
      checkingDeviceId,
      connectionStatusByDeviceId,
      ensuringDeviceId,
      isCheckingConnection,
      isEnsuringCamera,
      onCheckConnection,
      onEnsureCamera,
    ]
  )

  return (
    <AdminDataTable<HanetDeviceOption>
      tableScope="hanet-devices"
      data={data}
      columns={columns}
      getRowId={(row) => row.deviceId}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      globalFilterPlaceholder="Tìm theo deviceID hoặc tên thiết bị…"
      globalFilterLabel="Tìm kiếm"
      getGlobalFilterText={(row) =>
        [row.deviceId, row.name].filter(Boolean).join(" ")
      }
      filterToolbarExtra={filterToolbarExtra}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Đang tải…"
            : `Tổng ${data.length} thiết bị`}
        </p>
      }
    />
  )
}
