"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  buildCategoriesFromProducts,
  fetchActivePublicProductsSample,
  fetchSuggestedPublicProducts,
} from "@workspace/api-client";
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

type UseProductsOptions = {
  /** Polling tồn kho (ms); dùng trên giỏ/checkout. */
  stockPollMs?: number;
};

const listActivePublicProducts = () =>
  fetchActivePublicProductsSample(api.products.listPublic.bind(api.products));

export const useProducts = (
  options?: UseProductsOptions,
): UseQueryResult<Product[], Error> =>
  useQuery<Product[], Error>({
    queryKey: ["products", "active-all"],
    queryFn: listActivePublicProducts,
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
      const products = await listActivePublicProducts();
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
    refetchOnWindowFocus: false,
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

export const useSuggestedProducts = (
  productId: number,
  category: string,
  limit = SUGGESTED_PRODUCTS_LIMIT,
) =>
  useQuery<Product[], Error>({
    queryKey: queryKeys.suggestedProducts(productId, category, limit),
    queryFn: () =>
      fetchSuggestedPublicProducts(
        api.products.listPublic.bind(api.products),
        productId,
        category,
        limit,
      ),
    enabled: productId > 0,
  });

export const useCategories = (activeOnly = false) =>
  useQuery<Category[], Error>({
    queryKey: queryKeys.categories(activeOnly),
    queryFn: async (): Promise<Category[]> => {
      const products = await listActivePublicProducts();
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
