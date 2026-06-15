"use client"

import { useMemo, type ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Camera, Loader2, Radio } from "lucide-react"
import { Button } from "@ui/components/button"
import { AdminDataTable } from "@ui/components/data-table"
import { FieldCopyButton } from "@ui/components/field"
import type { HanetDeviceOption } from "@workspace/admin-app/lib/hanet-device-parse"
import { ConnectionStatusBadge } from "./hanet-device-connection-panel"

export type HanetDeviceConnectionStatusMap = Record<string, boolean | undefined>

export type HanetDevicesTableProps = {
  data: HanetDeviceOption[]
  isLoading?: boolean
  emptyLabel?: string
  filterToolbarExtra?: ReactNode
  connectionStatusByDeviceId?: HanetDeviceConnectionStatusMap
  checkingDeviceId?: string | null
  isCheckingConnection?: boolean
  onCheckConnection: (deviceId: string) => void
}

export function HanetDevicesTable({
  data,
  isLoading = false,
  emptyLabel = "Không có thiết bị cho địa điểm này.",
  filterToolbarExtra,
  connectionStatusByDeviceId = {},
  checkingDeviceId = null,
  isCheckingConnection = false,
  onCheckConnection,
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
      {
        id: "connection",
        header: "Kiểm tra",
        enableColumnFilter: false,
        enableHiding: false,
        size: 180,
        cell: ({ row }) => {
          const deviceId = row.original.deviceId
          const isActive =
            isCheckingConnection && checkingDeviceId === deviceId

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              disabled={isCheckingConnection}
              onClick={() => onCheckConnection(deviceId)}
            >
              {isActive ? (
                <Loader2 className="size-3 animate-spin" aria-hidden />
              ) : (
                <Radio className="size-3" aria-hidden />
              )}
              getConnectionStatus
            </Button>
          )
        },
      },
    ],
    [checkingDeviceId, connectionStatusByDeviceId, isCheckingConnection, onCheckConnection]
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
