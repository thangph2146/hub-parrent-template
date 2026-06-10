"use client"

import { useMemo, type MutableRefObject } from "react"
import { AdminStoragePickerPanel } from "@ui/components/admin/storage"
import { createAdminStoragePickerAdapters } from "@/lib/admin/admin-storage-picker-adapters"

export type FileStoragePickerPanelProps = {
  onPick: (urls: string[]) => void
  imagesOnly?: boolean
  multiSelect?: boolean
  className?: string
  onSelectionCountChange?: (count: number) => void
  confirmPickRef?: MutableRefObject<(() => void) | null>
  clearSelectionRef?: MutableRefObject<(() => void) | null>
}

export function FileStoragePickerPanel({
  onPick,
  imagesOnly = true,
  multiSelect = true,
  className,
  onSelectionCountChange,
  confirmPickRef,
  clearSelectionRef,
}: FileStoragePickerPanelProps) {
  const adapters = useMemo(() => createAdminStoragePickerAdapters(), [])

  return (
    <AdminStoragePickerPanel
      adapters={adapters}
      onPick={onPick}
      imagesOnly={imagesOnly}
      multiSelect={multiSelect}
      canDelete
      className={className}
      onSelectionCountChange={onSelectionCountChange}
      confirmPickRef={confirmPickRef}
      clearSelectionRef={clearSelectionRef}
    />
  )
}
