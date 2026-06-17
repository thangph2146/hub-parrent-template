"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { AdminDataTable } from "@ui/components/data-table"
import { ImageLightbox } from "@ui/components/image-lightbox"
import type { HanetCheckinRow } from "@workspace/admin-app/lib/hanet-checkin-parse"
import { getHanetCheckinColumns } from "./hanet-checkins-columns"

export type HanetCheckinsTableProps = {
  data: HanetCheckinRow[]
  isLoading?: boolean
  emptyLabel?: string
  /** Camera HANET của địa điểm — dropdown lọc cột deviceID. */
  deviceSelectOptions?: { value: string; label: string }[]
  filterToolbarExtra?: ReactNode
  summaryLine?: string | null
}

export function HanetCheckinsTable({
  data,
  isLoading = false,
  emptyLabel = "Chưa có dữ liệu check-in.",
  deviceSelectOptions = [],
  filterToolbarExtra,
  summaryLine,
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
