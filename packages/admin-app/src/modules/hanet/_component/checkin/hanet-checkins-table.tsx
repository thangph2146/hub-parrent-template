"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { AdminDataTable } from "@ui/components/data-table"
import { cn } from "@ui/lib/utils"
import { ImageLightbox } from "@ui/components/image-lightbox"
import type { HanetCheckinRow } from "../shared/hanet-checkin-parse"
import { getHanetCheckinColumns } from "./hanet-checkins-columns"

export type HanetCheckinsTableProps = {
  data: HanetCheckinRow[]
  isLoading?: boolean
  emptyLabel?: string
  /** Camera HANET của địa điểm — dropdown lọc cột deviceID. */
  deviceSelectOptions?: { value: string; label: string }[]
  filterToolbarExtra?: ReactNode
  summaryLine?: string | null
  /** Row id vừa xuất hiện qua realtime — highlight tạm thời. */
  highlightRowIds?: ReadonlySet<string>
}

export function HanetCheckinsTable({
  data,
  isLoading = false,
  emptyLabel = "Chưa có dữ liệu check-in.",
  deviceSelectOptions = [],
  filterToolbarExtra,
  summaryLine,
  highlightRowIds,
}: HanetCheckinsTableProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const lightboxImages = useMemo(
    () =>
      data
        .filter((row) => row.avatarUrl.trim())
        .map((row) => ({
          key: row.rowId,
          src: row.avatarUrl,
          altText:
            row.displayName.trim() && row.displayName !== "—"
              ? row.displayName
              : `Check-in ${row.checkinAt}`,
        })),
    [data],
  )

  const openImagePreview = useCallback(
    (row: HanetCheckinRow) => {
      const index = lightboxImages.findIndex((item) => item.key === row.rowId)
      if (index < 0) return
      setLightboxIndex(index)
      setLightboxOpen(true)
    },
    [lightboxImages],
  )

  const columns = useMemo(
    () =>
      getHanetCheckinColumns({
        onPreviewImage: openImagePreview,
        deviceSelectOptions,
      }),
    [openImagePreview, deviceSelectOptions],
  )

  return (
    <>
      <AdminDataTable<HanetCheckinRow>
        tableScope="hanet-checkins"
        data={data}
        columns={columns}
        getRowId={(row) => row.rowId}
        isLoading={isLoading}
        emptyLabel={emptyLabel}
        globalFilterPlaceholder="Tìm theo tên, aliasID, personID, deviceID…"
        globalFilterLabel="Tìm kiếm"
        getRowClassName={(row) =>
          highlightRowIds?.has(row.original.rowId)
            ? cn(
                "!bg-[color-mix(in_oklch,var(--primary)_12%,var(--card))]",
                "ring-1 ring-inset ring-primary/25",
              )
            : undefined
        }
        getGlobalFilterText={(row) =>
          [
            row.displayName,
            row.aliasId,
            row.personId,
            row.deviceId,
            row.deviceName,
            row.placeName,
            row.checkinAt,
            row.personType,
          ]
            .filter(Boolean)
            .join(" ")
        }
        filterToolbarExtra={filterToolbarExtra}
        clientPagination={{
          initialPageSize: 20,
          pageSizeOptions: [20, 50, 100],
          itemLabel: "lượt",
          isLoading,
        }}
        footer={
          summaryLine ? (
            <p className="text-sm text-muted-foreground">{summaryLine}</p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : null
        }
      />

      <ImageLightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
