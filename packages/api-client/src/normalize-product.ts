import type { Product, ProductUnitType } from "./types";

function parseJsonArray<T>(raw: unknown): T[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return Array.isArray(parsed) ? (parsed as T[]) : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Chuẩn hóa JSON field — MySQL/driver đôi khi trả chuỗi thay vì mảng. */
export function normalizeProduct(product: Product): Product {
  const unitTypes = parseJsonArray<ProductUnitType>(product.unitTypes);
  const images = parseJsonArray<string>(product.images);
  const coupons = parseJsonArray<string>(product.coupons);
  return {
    ...product,
    unitTypes: unitTypes?.length ? unitTypes : null,
    images: images?.length ? images : null,
    coupons: coupons?.length ? coupons : null,
  };
}

export function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
}
