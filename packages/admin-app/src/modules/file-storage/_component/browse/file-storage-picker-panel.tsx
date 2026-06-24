"use client"

import { useMemo, type MutableRefObject } from "react"
import { AdminStoragePickerPanel } from "@ui/components/admin/storage"
import { createAdminStoragePickerAdapters } from "@workspace/admin-app/lib/admin-storage-picker-adapters"
import { useAdminApi } from "@workspace/admin-app/runtime"
import {
  buildProductStorageFolderScope,
  buildProductStorageUploadConfig,
} from "@workspace/admin-app/lib/build-product-storage-picker-config"
import type { ProductImageUploadContext } from "@workspace/admin-app/lib/product-image-storage-stub"

export type { ProductImageUploadContext }

export type FileStoragePickerPanelProps = {
  onPick: (urls: string[]) => void
  imagesOnly?: boolean
  multiSelect?: boolean
  resolveProductUpload?: () => ProductImageUploadContext | null
  className?: string
  onSelectionCountChange?: (count: number) => void
  confirmPickRef?: MutableRefObject<(() => void) | null>
  clearSelectionRef?: MutableRefObject<(() => void) | null>
}

/** @deprecated Dùng `AdminStoragePickerPanel` từ `@ui/components/admin/storage` — wrapper giữ tương thích import cũ. */
export function FileStoragePickerPanel({
  onPick,
  imagesOnly = true,
  multiSelect = true,
  resolveProductUpload,
  className,
  onSelectionCountChange,
  confirmPickRef,
  clearSelectionRef,
}: FileStoragePickerPanelProps) {
  const api = useAdminApi()
  const adapters = useMemo(() => createAdminStoragePickerAdapters(api), [api])
  const productCtx = resolveProductUpload?.() ?? null

  const folderScope = useMemo(() => {
    if (!resolveProductUpload || !productCtx) return null
    return buildProductStorageFolderScope(api, productCtx)
  }, [api, productCtx, resolveProductUpload])

  const upload = useMemo(() => {
    if (!resolveProductUpload) return undefined
    return buildProductStorageUploadConfig(api, resolveProductUpload, productCtx)
  }, [api, productCtx, resolveProductUpload])

  return (
    <AdminStoragePickerPanel
      adapters={adapters}
      onPick={onPick}
      imagesOnly={imagesOnly}
      multiSelect={multiSelect}
      folderScope={folderScope}
      upload={upload}
      canDelete
      className={className}
      onSelectionCountChange={onSelectionCountChange}
      confirmPickRef={confirmPickRef}
      clearSelectionRef={clearSelectionRef}
    />
  )
}
