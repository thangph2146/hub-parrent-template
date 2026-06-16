import { resolveStorageFolderSlugPath } from "@workspace/api-client"
import {
  createStorageFolder,
  fetchStorageFolders,
  type FolderItem,
} from "@workspace/admin-app/lib/admin-uploads"
import {
  extensionsFromGroupIds,
  getRealmDefaultGroupIds,
  resolveFolderPathAfterCreate,
} from "@workspace/admin-app/modules/file-storage/_component"

export const PRODUCT_IMAGE_PARENT_LABEL = "Sản phẩm"
export const PRODUCT_IMAGE_PARENT_SLUG = "san-pham"

export type ProductImageUploadInput = {
  productName?: string
  productSlug?: string
  productSku?: string
}

export type ProductImageUploadContext = {
  productName: string
  productSlug: string
  productSku?: string
  folderLabel: string
}

function leafSlugFromText(input: string): string {
  const from = resolveStorageFolderSlugPath(input.trim())
  if (!from?.slugPath) return ""
  const parts = from.slugPath.split("/").filter(Boolean)
  return parts[parts.length - 1] ?? ""
}

export function resolveProductImageSlug(
  productName: string,
  productSlug?: string,
  productSku?: string
): string {
  const explicit = productSlug?.trim()
  if (explicit) return explicit

  const fromName = leafSlugFromText(productName)
  if (fromName) return fromName

  return leafSlugFromText(productSku ?? "")
}

/** Đọc trực tiếp từ form — tránh `watch` trong dialog bị stale. */
export function buildProductImageUploadContext(
  input: ProductImageUploadInput
): ProductImageUploadContext | null {
  const name = input.productName?.trim() ?? ""
  const sku = input.productSku?.trim() ?? ""
  const folderLabel = name || sku
  const slug = resolveProductImageSlug(name, input.productSlug, sku)

  if (!folderLabel || !slug) return null

  return {
    productName: name || folderLabel,
    productSlug: slug,
    productSku: sku || undefined,
    folderLabel,
  }
}

export function resolveProductImageFolderNav(
  productName: string,
  productSlug?: string,
  productSku?: string
): { navPath: string; slug: string; label: string } | null {
  const ctx = buildProductImageUploadContext({
    productName,
    productSlug,
    productSku,
  })
  if (!ctx) return null
  return {
    navPath: `${PRODUCT_IMAGE_PARENT_SLUG}/${ctx.productSlug}`,
    slug: ctx.productSlug,
    label: ctx.folderLabel,
  }
}

function folderNavPath(folder: FolderItem): string {
  return resolveFolderPathAfterCreate(folder.path.replace(/\\/g, "/"), "images")
}

export function folderMatchesProductImage(
  folder: FolderItem,
  slug: string
): boolean {
  const nav = folderNavPath(folder)
  if (nav === `${PRODUCT_IMAGE_PARENT_SLUG}/${slug}`) return true
  if (!nav.startsWith(`${PRODUCT_IMAGE_PARENT_SLUG}/`)) return false
  const leaf = nav.split("/").pop()
  return leaf === slug
}

export function findProductImageFolder(
  folders: FolderItem[],
  input: ProductImageUploadInput
): { navPath: string; uploadFolderPath: string } | null {
  const resolved = resolveProductImageFolderNav(
    input.productName ?? "",
    input.productSlug,
    input.productSku
  )
  if (!resolved) return null
  const match = folders.find((folder) =>
    folderMatchesProductImage(folder, resolved.slug)
  )
  if (!match) return null
  const navPath = folderNavPath(match)
  return { navPath, uploadFolderPath: navPath }
}

async function ensureProductImageParentFolder(
  folders: FolderItem[]
): Promise<void> {
  const parentExists = folders.some((folder) => {
    const nav = folderNavPath(folder)
    return nav === PRODUCT_IMAGE_PARENT_SLUG
  })
  if (parentExists) return

  await createStorageFolder({
    folderName: PRODUCT_IMAGE_PARENT_LABEL,
    parentPath: "images",
    resourceType: "images",
    allowedExtensions: extensionsFromGroupIds(
      "images",
      getRealmDefaultGroupIds("images")
    ),
  })
}

/** Tạo hoặc tái sử dụng folder ảnh chính của sản phẩm dưới «Sản phẩm». */
export async function ensureProductImageFolder(
  input: ProductImageUploadInput
): Promise<{ navPath: string; uploadFolderPath: string; created: boolean }> {
  const resolved = resolveProductImageFolderNav(
    input.productName ?? "",
    input.productSlug,
    input.productSku
  )
  if (!resolved) {
    throw new Error(
      "Nhập tên hoặc SKU sản phẩm ở form — hệ thống cần tạo slug folder lưu ảnh"
    )
  }

  let folders = await fetchStorageFolders()
  const existing = findProductImageFolder(folders, input)
  if (existing) {
    return { ...existing, created: false }
  }

  await ensureProductImageParentFolder(folders)
  folders = await fetchStorageFolders()

  const parentFolder = folders.find(
    (folder) => folderNavPath(folder) === PRODUCT_IMAGE_PARENT_SLUG
  )
  const parentDisk =
    parentFolder?.path.replace(/\\/g, "/") ??
    `images/${PRODUCT_IMAGE_PARENT_SLUG}`

  const created = await createStorageFolder({
    folderName: resolved.label,
    parentPath: parentDisk,
    resourceType: "images",
  })

  const navPath = resolveFolderPathAfterCreate(created.folderPath, "images")
  return {
    navPath,
    uploadFolderPath: navPath,
    created: true,
  }
}
