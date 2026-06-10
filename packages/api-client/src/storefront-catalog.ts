import type {
  Category,
  CategoryUsage,
  Product,
  ProductListParams,
  ProductPagedResponse,
} from "./types";

const ACTIVE_PUBLIC_PRODUCTS_SAMPLE_LIMIT = 500;

export type ListPublicProductsFn = (
  params?: ProductListParams,
) => Promise<ProductPagedResponse>;

/** Lấy mẫu SP public đang bật (storefront suy ra categories khi chưa có API riêng). */
export async function fetchActivePublicProductsSample(
  listPublic: ListPublicProductsFn,
): Promise<Product[]> {
  const res = await listPublic({
    page: 1,
    limit: ACTIVE_PUBLIC_PRODUCTS_SAMPLE_LIMIT,
    activeOnly: true,
  });
  return res.items;
}

/** Suy ra danh mục + usage từ danh sách SP public (storefront không có API categories riêng). */
export function buildCategoriesFromProducts(
  products: Product[],
): { categories: Category[]; usage: CategoryUsage[] } {
  const counts = new Map<string, number>();
  for (const p of products) {
    const slug = (p.category || "general").trim() || "general";
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const categories: Category[] = [...counts.entries()].map(
    ([slug, count], index) => ({
      id: index + 1,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      sortOrder: index,
      isActive: true,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      postCount: count,
    }),
  );
  const usage: CategoryUsage[] = [...counts.entries()].map(
    ([slug, productCount]) => ({ slug, productCount }),
  );
  return { categories, usage };
}

/** Gợi ý SP public cùng danh mục, fallback sang SP khác nếu thiếu. */
export async function fetchSuggestedPublicProducts(
  listPublic: ListPublicProductsFn,
  productId: number,
  category: string,
  limit: number,
): Promise<Product[]> {
  const categorySlug = category.trim() || "general";
  const sameCategory = await listPublic({
    page: 1,
    limit: limit + 1,
    category: categorySlug,
    activeOnly: true,
  });

  const picked: Product[] = [];
  const seen = new Set<number>([productId]);

  for (const item of sameCategory.items) {
    if (seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
    if (picked.length >= limit) return picked;
  }

  const fallback = await listPublic({
    page: 1,
    limit: limit + 8,
    activeOnly: true,
  });

  for (const item of fallback.items) {
    if (seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
    if (picked.length >= limit) break;
  }

  return picked;
}
