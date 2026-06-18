/**
 * Stub type cho file-storage sync từ main — check-in không có module products.
 * `resolveProductUpload` không dùng trên check-in; chỉ cần type + export an toàn nếu gọi nhầm.
 */
export type ProductImageUploadContext = {
  productName: string
  productSlug: string
  productSku?: string
  folderLabel: string
}

export function resolveProductImageFolderNav(
  _productName: string,
  _productSlug?: string,
  _productSku?: string,
): { navPath: string } | null {
  void _productName
  void _productSlug
  void _productSku
  return null
}

export async function ensureProductImageFolder(
  _input: Pick<
    ProductImageUploadContext,
    "productName" | "productSlug" | "productSku"
  >,
): Promise<{ navPath: string; uploadFolderPath: string; created: boolean }> {
  void _input
  throw new Error(
    "Module products không có trên HUB Check-in — không dùng upload ảnh sản phẩm.",
  )
}
