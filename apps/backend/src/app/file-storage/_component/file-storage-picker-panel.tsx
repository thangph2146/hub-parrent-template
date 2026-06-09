"use client"

import { useMemo, type MutableRefObject } from "react"
import { AdminStoragePickerPanel } from "@ui/components/admin/storage"
import { createAdminStoragePickerAdapters } from "@/lib/admin-storage-picker-adapters"
import {
  buildProductStorageFolderScope,
  buildProductStorageUploadConfig,
} from "@/lib/build-product-storage-picker-config"
import type { ProductImageUploadContext } from "@/app/products/_component/product-image-storage"

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
  const adapters = useMemo(() => createAdminStoragePickerAdapters(), [])
  const productCtx = resolveProductUpload?.() ?? null

  const folderScope = useMemo(() => {
    if (!resolveProductUpload || !productCtx) return null
    return buildProductStorageFolderScope(productCtx)
  }, [productCtx, resolveProductUpload])

  const upload = useMemo(() => {
    if (!resolveProductUpload) return undefined
    return buildProductStorageUploadConfig(resolveProductUpload, productCtx)
  }, [productCtx, resolveProductUpload])

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
