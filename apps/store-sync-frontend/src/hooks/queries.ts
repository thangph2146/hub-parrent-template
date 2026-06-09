"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  api,
  type Category,
  type CategoryUsage,
  type CreateOrderInput,
  type Order,
  type Product,
  type ProductListParams,
  type ProductPagedResponse,
} from "@/lib/api";

export const queryKeys = {
  products: () => ["products"] as const,
  productsCatalog: (p: ProductListParams & { page: number; limit: number }) =>
    ["products", "catalog", p] as const,
  product: (id: number) => ["products", id] as const,
  productBySku: (sku: string) => ["products", "sku", sku] as const,
  suggestedProducts: (
    productId: number,
    category: string,
    limit: number,
  ) => ["products", "suggested", productId, category, limit] as const,
  categories: (activeOnly?: boolean) =>
    ["products", "categories", { activeOnly: !!activeOnly }] as const,
  categoryUsage: () => ["products", "category-usage"] as const,
  orders: (email?: string) => ["orders", { email: email ?? null }] as const,
  order: (id: number, email?: string) =>
    ["orders", id, { email: email ?? null }] as const,
};

function buildCategoriesFromProducts(
  products: Product[],
): { categories: Category[]; usage: CategoryUsage[] } {
  const counts = new Map<string, number>();
  for (const p of products) {
    const slug = (p.category || "general").trim() || "general";
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const categories: Category[] = [...counts.entries()].map(
    ([slug, count], index) => ({
      id: slug,
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

async function fetchActiveProductsSample(): Promise<Product[]> {
  const res = await api.products.listPublic({
    page: 1,
    limit: 500,
    activeOnly: true,
  });
  return res.items;
}

type UseProductsOptions = {
  /** Polling tồn kho (ms); dùng trên giỏ/checkout. */
  stockPollMs?: number;
};

export const useProducts = (
  options?: UseProductsOptions,
): UseQueryResult<Product[], Error> =>
  useQuery<Product[], Error>({
    queryKey: ["products", "active-all"],
    queryFn: fetchActiveProductsSample,
    refetchInterval: options?.stockPollMs,
    refetchIntervalInBackground: !!options?.stockPollMs,
  });

export const useCatalogProducts = (
  params: ProductListParams & { page: number; limit: number },
) =>
  useQuery<ProductPagedResponse, Error>({
    queryKey: queryKeys.productsCatalog(params),
    queryFn: () => api.products.listPublic(params),
  });

export const useCategoryUsage = () =>
  useQuery<CategoryUsage[], Error>({
    queryKey: queryKeys.categoryUsage(),
    queryFn: async () => {
      const products = await fetchActiveProductsSample();
      return buildCategoriesFromProducts(products).usage;
    },
  });

export const useProduct = (id: number | null | undefined) =>
  useQuery({
    queryKey: queryKeys.product(id ?? -1),
    queryFn: () => api.products.getPublic(id as number),
    enabled: typeof id === "number" && id > 0,
  });

/** Tồn realtime cho SP đang có trong giỏ — fetch từng SP, polling 10s. */
export function useCartStockProducts(productIds: number[]) {
  const sortedKey = [...productIds].sort((a, b) => a - b);
  return useQuery<Product[], Error>({
    queryKey: ["cart-stock", sortedKey] as const,
    queryFn: async () => {
      const results = await Promise.all(
        sortedKey.map((id) => api.products.getPublic(id)),
      );
      return results;
    },
    enabled: sortedKey.length > 0,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export const useProductBySku = (sku: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.productBySku(sku ?? ""),
    queryFn: () => api.products.bySkuPublic(sku as string),
    enabled: !!sku,
  });

const SUGGESTED_PRODUCTS_LIMIT = 4;

async function fetchSuggestedProducts(
  productId: number,
  category: string,
  limit: number,
): Promise<Product[]> {
  const categorySlug = category.trim() || "general";
  const sameCategory = await api.products.listPublic({
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

  const fallback = await api.products.listPublic({
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

export const useSuggestedProducts = (
  productId: number,
  category: string,
  limit = SUGGESTED_PRODUCTS_LIMIT,
) =>
  useQuery<Product[], Error>({
    queryKey: queryKeys.suggestedProducts(productId, category, limit),
    queryFn: () => fetchSuggestedProducts(productId, category, limit),
    enabled: productId > 0,
  });

export const useCategories = (activeOnly = false) =>
  useQuery<Category[], Error>({
    queryKey: queryKeys.categories(activeOnly),
    queryFn: async (): Promise<Category[]> => {
      const products = await fetchActiveProductsSample();
      return buildCategoriesFromProducts(products).categories;
    },
  });

export const useOrders = (email?: string) =>
  useQuery<Order[], Error>({
    queryKey: queryKeys.orders(email),
    queryFn: () => api.orders.listPublic({ email: email as string }),
    enabled: !!email?.trim(),
  });

export const useOrder = (
  id: number | null | undefined,
  email?: string,
) =>
  useQuery<Order, Error>({
    queryKey: queryKeys.order(id ?? -1, email),
    queryFn: () => api.orders.getPublic(id as number, email),
    enabled: typeof id === "number" && id > 0,
  });

export const useCreateOrder = (): UseMutationResult<
  Order,
  Error,
  CreateOrderInput
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.orders.checkout(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
