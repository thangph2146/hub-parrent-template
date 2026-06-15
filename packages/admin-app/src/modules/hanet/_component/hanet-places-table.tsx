"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MapPin } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { AdminDataTable } from "@ui/components/data-table"
import { FieldCopyButton } from "@ui/components/field"
import type { HanetPlaceOption } from "@workspace/admin-app/lib/hanet-place-parse"

export type HanetPlacesTableProps = {
  data: HanetPlaceOption[]
  isLoading?: boolean
  defaultPlaceId?: string | null
}

export function HanetPlacesTable({
  data,
  isLoading = false,
  defaultPlaceId,
}: HanetPlacesTableProps) {
  const normalizedDefault = defaultPlaceId?.trim() || ""

  const columns = useMemo<ColumnDef<HanetPlaceOption>[]>(
    () => [
      {
        accessorKey: "placeId",
        header: "placeID",
        enableColumnFilter: false,
        size: 160,
        cell: ({ getValue }) => {
          const placeId = String(getValue() ?? "").trim()
          if (!placeId) return "—"
          return (
            <div className="flex items-center gap-2">
              <code className="text-xs font-medium">{placeId}</code>
              <FieldCopyButton text={placeId} />
            </div>
          )
        },
      },
      {
        accessorKey: "name",
        header: "Tên địa điểm",
        enableColumnFilter: false,
        cell: ({ row, getValue }) => {
          const name = String(getValue() ?? "").trim() || "—"
          const isDefault =
            normalizedDefault &&
            row.original.placeId.trim() === normalizedDefault

          return (
            <div className="flex min-w-0 items-center gap-2">
              <MapPin
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 truncate">{name}</span>
              {isDefault ? (
                <Badge variant="secondary" className="h-5 shrink-0 text-[10px]">
                  Mặc định
                </Badge>
              ) : null}
            </div>
          )
        },
      },
    ],
    [normalizedDefault]
  )

  return (
    <AdminDataTable<HanetPlaceOption>
      tableScope="hanet-places"
      data={data}
      columns={columns}
      getRowId={(row) => row.placeId}
      isLoading={isLoading}
      emptyLabel="Không có địa điểm — kiểm tra tài khoản HANET trên cổng developer."
      globalFilterPlaceholder="Tìm theo placeID hoặc tên địa điểm…"
      getGlobalFilterText={(row) => [row.placeId, row.name].filter(Boolean).join(" ")}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Đang tải…"
            : `Tổng ${data.length} địa điểm từ HANET`}
        </p>
      }
    />
  )
}
