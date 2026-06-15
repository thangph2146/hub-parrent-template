"use client"

import { useEffect, useMemo } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"
import { useHanetPlacesQuery } from "./use-hanet-places-query"
import { HANET_ADMIN_PLACE_STORAGE_KEY } from "@workspace/admin-app/lib/hanet-place-storage"

const STORAGE_KEY = HANET_ADMIN_PLACE_STORAGE_KEY

export function useHanetSelectedPlaceId(defaultPlaceId?: string | null) {
  const placesQuery = useHanetPlacesQuery(Boolean(defaultPlaceId) || true)

  const places = placesQuery.data ?? []

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
}: {
  value: string
  onChange: (placeId: string) => void
  defaultPlaceId?: string | null
  disabled?: boolean
}) {
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

  const selectedPlaceId = value || resolvedDefault
  const selectedPlace = places.find((p) => p.placeId === selectedPlaceId)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Địa điểm HANET</span>
      <Select
        value={selectedPlaceId}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 w-full max-w-xs">
          <SelectValue placeholder="Chọn địa điểm">
            {selectedPlace?.name ?? null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {places.map((place) => (
            <SelectItem key={place.placeId} value={place.placeId}>
              {place.name}{" "}
              <span className="font-mono text-xs text-muted-foreground">
                ({place.placeId})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
