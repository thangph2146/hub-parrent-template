import type { Product } from "@workspace/api-client"

export type ProductRow = Omit<Product, "id"> & { id: string }

export function mapProductRow(product: Product): ProductRow {
  return { ...product, id: String(product.id) }
}

export type ProductUnitGiftFormRow = {
  label: string
  minQty: string
  name: string
  sku: string
  qty: string
  image: string
  productId: string
  scope: "line" | "product"
}

export type ProductUnitFormRow = {
  type: string
  label: string
  sku: string
  retailPrice: string
  wholesalePrice: string
  minWholesaleQty: string
  qtyPerUnit: string
  stock: string
  imageUrls: string
  tierMinQty: string
  tierUnitPrice: string
  tierLabel: string
  gifts: ProductUnitGiftFormRow[]
  isDefault: boolean
}

export const EMPTY_GIFT_ROW: ProductUnitGiftFormRow = {
  label: "",
  minQty: "",
  name: "",
  sku: "",
  qty: "1",
  image: "",
  productId: "",
  scope: "line",
}

export type ProductFormValues = {
  sku: string
  name: string
  category: string
  description: string
  isActive: boolean
  fulfillmentNote: string
  units: ProductUnitFormRow[]
}

export const EMPTY_UNIT_ROW: ProductUnitFormRow = {
  type: "",
  label: "",
  sku: "",
  retailPrice: "0",
  wholesalePrice: "0",
  minWholesaleQty: "0",
  qtyPerUnit: "1",
  stock: "0",
  imageUrls: "",
  tierMinQty: "",
  tierUnitPrice: "",
  tierLabel: "",
  gifts: [],
  isDefault: true,
}

export function parseImageUrls(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatImageUrls(images?: string[] | null): string {
  return (images ?? []).join("\n")
}
