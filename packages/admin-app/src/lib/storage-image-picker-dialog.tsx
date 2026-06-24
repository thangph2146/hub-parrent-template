"use client"

import { useMemo } from "react"

import {
  AdminStorageImagePickerDialog,
  type AdminStoragePickerFolderScope,
} from "@ui/components/admin/storage"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"

import type { ProductImageUploadContext } from "@workspace/admin-app/lib/product-image-storage-stub"

import { createAdminStoragePickerAdapters } from "./admin-storage-picker-adapters"
import { useAdminApi } from "@workspace/admin-app/runtime"

import {
  buildProductStorageFolderScope,
  buildProductStorageUploadConfig,
} from "./build-product-storage-picker-config"

export function StorageImagePickerDialog({
  open,

  onOpenChange,

  onSelect,

  title = "Chọn ảnh từ kho lưu trữ",

  resolveProductUpload,

  multiSelect = true,
}: {
  open: boolean

  onOpenChange: (open: boolean) => void

  onSelect: (urls: string[]) => void

  title?: string

  resolveProductUpload?: () => ProductImageUploadContext | null

  multiSelect?: boolean
}) {
  const api = useAdminApi()
  const adapters = useMemo(() => createAdminStoragePickerAdapters(api), [api])

  const productCtx = open ? (resolveProductUpload?.() ?? null) : null

  const folderScope = useMemo((): AdminStoragePickerFolderScope | null => {
    if (!resolveProductUpload || !productCtx) return null

    return buildProductStorageFolderScope(api, productCtx)
  }, [api, productCtx, resolveProductUpload])

  const upload = useMemo(() => {
    if (!resolveProductUpload) return undefined

    return buildProductStorageUploadConfig(api, resolveProductUpload, productCtx)
  }, [api, productCtx, resolveProductUpload])

  if (resolveProductUpload && !productCtx) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Nhập{" "}
            <span className="font-medium text-foreground">tên hoặc SKU</span>{" "}
            sản phẩm ở form — hệ thống cần slug để mở đúng folder «Sản phẩm /
            …».
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <AdminStorageImagePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      adapters={adapters}
      onSelect={onSelect}
      title={title}
      multiSelect={multiSelect}
      folderScope={folderScope}
      upload={upload}
      canDelete
    />
  )
}
