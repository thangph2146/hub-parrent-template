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

export const useProducts = (): UseQueryResult<Product[], Error> =>
  useQuery<Product[], Error>({
    queryKey: ["products", "active-all"],
    queryFn: fetchActiveProductsSample,
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

export const useProductBySku = (sku: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.productBySku(sku ?? ""),
    queryFn: () => api.products.bySkuPublic(sku as string),
    enabled: !!sku,
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
