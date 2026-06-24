"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MapPin } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { defineDataTableActionsColumn } from "@ui/components/data-table"
import { FieldCopyButton } from "@ui/components/field"
import type { HanetPlaceOption } from "../shared/hanet-place-parse"
import {
  HanetPlaceRowActions,
  hanetPlaceActionsColumnMeta,
} from "./hanet-place-row-actions"

export function getHanetPlaceColumns({
  defaultPlaceId = "",
  canWrite = false,
  onEdit,
  onDelete,
}: {
  defaultPlaceId?: string
  canWrite?: boolean
  onEdit?: (place: HanetPlaceOption) => void
  onDelete?: (place: HanetPlaceOption) => void
}): ColumnDef<HanetPlaceOption>[] {
  const normalizedDefault = defaultPlaceId.trim()

  const dataColumns: ColumnDef<HanetPlaceOption>[] = [
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
  ]

  if (!canWrite || (!onEdit && !onDelete)) {
    return dataColumns
  }

  return [
    ...dataColumns,
    defineDataTableActionsColumn<HanetPlaceOption>({
      columnMeta: hanetPlaceActionsColumnMeta,
      cell: ({ row }) => (
        <HanetPlaceRowActions
          place={row.original}
          canWrite={canWrite}
          onEdit={onEdit ? () => onEdit(row.original) : undefined}
          onDelete={onDelete ? () => onDelete(row.original) : undefined}
        />
      ),
    }),
  ]
}
