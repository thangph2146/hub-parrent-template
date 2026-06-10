import type {
  AdminStoragePickerFolderScope,
  AdminStoragePickerUploadConfig,
} from "@ui/components/admin/storage"
import { toast } from "@ui/components/sonner"
import {
  ensureProductImageFolder,
  resolveProductImageFolderNav,
  type ProductImageUploadContext,
} from "@/app/products/_component/product-image-storage"
import { uploadAdminImage } from "./admin-upload"

export function buildProductStorageFolderScope(
  ctx: ProductImageUploadContext
): AdminStoragePickerFolderScope {
  const nav = resolveProductImageFolderNav(
    ctx.productName,
    ctx.productSlug,
    ctx.productSku
  )
  return {
    folderPath: nav?.navPath ?? `san-pham/${ctx.productSlug}`,
    folderLabel: ctx.folderLabel,
    parentLabel: "Sản phẩm",
    realm: "images",
    onBootstrap: async () => {
      const ensured = await ensureProductImageFolder({
        productName: ctx.productName,
        productSlug: ctx.productSlug,
        productSku: ctx.productSku,
      })
      return { folderPath: ensured.navPath }
    },
  }
}

export function buildProductStorageUploadConfig(
  resolveProductUpload: () => ProductImageUploadContext | null,
  productCtx: ProductImageUploadContext | null
): AdminStoragePickerUploadConfig {
  return {
    accept: "image/*",
    label: "Tải ảnh lên",
    disabled: !productCtx,
    uploadFiles: async (files: File[]) => {
      const ctx = resolveProductUpload()
      if (!ctx) {
        throw new Error("Nhập tên hoặc SKU sản phẩm trước khi tải ảnh lên")
      }
      const { uploadFolderPath, created } = await ensureProductImageFolder({
        productName: ctx.productName,
        productSlug: ctx.productSlug,
        productSku: ctx.productSku,
      })
      const urls: string[] = []
      let fail = 0
      for (const file of files) {
        try {
          const url = await uploadAdminImage(file, {
            folderPath: uploadFolderPath,
            isExistingFolder: true,
          })
          urls.push(url)
        } catch {
          fail += 1
        }
      }
      if (created && urls.length > 0) {
        toast.success(`Đã tạo folder «${ctx.folderLabel}»`)
      }
      if (fail > 0 && urls.length > 0) {
        toast.error(`${fail} ảnh tải lên thất bại`)
      }
      return urls
    },
  }
}
