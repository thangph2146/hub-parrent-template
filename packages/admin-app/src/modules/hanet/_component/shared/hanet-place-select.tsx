"use client"

import { useEffect, useId, useMemo } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@ui/components/button"
import { DataTableToolbarField } from "@ui/components/data-table"
import {
  SelectPicker,
  type SelectPickerOption,
  type PickerSize,
} from "@ui/components/pickers"
import { cn } from "@ui/lib/utils"
import { useHanetPlacesQuery } from "../queries/use-hanet-places-query"
import { HANET_ADMIN_PLACE_STORAGE_KEY } from "./hanet-place-storage"
import type { HanetPlaceOption } from "./hanet-place-parse"

const STORAGE_KEY = HANET_ADMIN_PLACE_STORAGE_KEY

export function useHanetSelectedPlaceId(defaultPlaceId?: string | null) {
  const placesQuery = useHanetPlacesQuery(Boolean(defaultPlaceId) || true)

  const places = useMemo<HanetPlaceOption[]>(
    () => placesQuery.data ?? [],
    [placesQuery.data],
  )

  const resolvedDefault = useMemo(() => {
    if (defaultPlaceId?.trim()) return defaultPlaceId.trim()
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY)?.trim()
      if (saved && places.some((p) => p.placeId === saved)) return saved
    }
    if (places.length === 1) return places[0]!.placeId
    return ""
  }, [defaultPlaceId, places])

  return { placesQuery, places, resolvedDefault, storageKey: STORAGE_KEY }
}

export function HanetPlaceSelect({
  value,
  onChange,
  defaultPlaceId,
  disabled,
  layout = "inline",
  pickerSize,
  className,
}: {
  value: string
  onChange: (placeId: string) => void
  defaultPlaceId?: string | null
  disabled?: boolean
  /** `stacked` — label trên, dùng trong toolbar DataTable. */
  layout?: "inline" | "stacked"
  /** Mặc định: `sm` khi stacked, `default` khi inline. */
  pickerSize?: PickerSize
  className?: string
}) {
  const selectId = useId()
  const { placesQuery, places, resolvedDefault } =
    useHanetSelectedPlaceId(defaultPlaceId)

  useEffect(() => {
    if (!value && resolvedDefault) {
      onChange(resolvedDefault)
    }
  }, [value, resolvedDefault, onChange])

  useEffect(() => {
    if (!value) return
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // ignore quota / private mode
    }
  }, [value])

  const selectedPlaceId = value || resolvedDefault

  const placeOptions = useMemo<SelectPickerOption[]>(
    () =>
      places.map((place) => ({
        value: place.placeId,
        label: place.name,
        render: () => (
          <>
            {place.name}{" "}
            <span className="font-mono text-xs text-muted-foreground">
              ({place.placeId})
            </span>
          </>
        ),
      })),
    [places]
  )

  if (placesQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tải địa điểm HANET…
      </div>
    )
  }

  if (placesQuery.isError) {
    const detail =
      placesQuery.error instanceof Error
        ? placesQuery.error.message
        : "Lỗi không xác định"
    return (
      <div className="space-y-2 text-sm text-destructive">
        <p>Không tải được danh sách place — kiểm tra OAuth HANET.</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => void placesQuery.refetch()}
        >
          <RefreshCw className="mr-1.5 size-3.5" />
          Tải lại places
        </Button>
      </div>
    )
  }

  if (!places.length) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-400">
        Tài khoản HANET chưa có place — tạo địa điểm trên{" "}
        <a
          href="https://developers.hanet.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          developers.hanet.ai
        </a>{" "}
        hoặc đặt{" "}
        <code className="text-xs">HANET_DEFAULT_PLACE_ID</code> trong .env API.
      </p>
    )
  }

  const resolvedPickerSize =
    pickerSize ?? (layout === "stacked" ? "sm" : "default")

  const selectControl = (
    <SelectPicker
      id={selectId}
      value={selectedPlaceId}
      onChange={(placeId) => {
        if (typeof placeId === "string" && placeId) onChange(placeId)
      }}
      options={placeOptions}
      placeholder="Chọn địa điểm"
      disabled={disabled}
      allowClear={false}
      size={resolvedPickerSize}
      className={layout === "stacked" ? "w-full" : "max-w-xs"}
    />
  )

  if (layout === "stacked") {
    return (
      <DataTableToolbarField
        label="Địa điểm HANET"
        htmlFor={selectId}
        className={cn("min-w-0", className)}
      >
        {selectControl}
      </DataTableToolbarField>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Địa điểm HANET</span>
      {selectControl}
    </div>
  )
}
