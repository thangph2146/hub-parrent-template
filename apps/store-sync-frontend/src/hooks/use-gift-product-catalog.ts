"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  buildGiftCatalogHrefMap,
  collectGiftCatalogLookups,
  type Product,
  type ProductGiftRule,
} from "@workspace/api-client";
import { api } from "@/lib/api";
import { giftRulesForCartLine } from "@/lib/cart-gift-rules";
import type { CartLine } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/queries";

function indexActiveProducts(products: readonly Product[]): {
  byId: Map<number, Product>;
  bySku: Map<string, Product>;
} {
  const byId = new Map<number, Product>();
  const bySku = new Map<string, Product>();
  for (const product of products) {
    if (product.isActive === false) continue;
    byId.set(product.id, product);
    const sku = product.sku?.trim();
    if (sku) bySku.set(sku, product);
  }
  return { byId, bySku };
}

async function fetchMissingGiftProducts(
  lookup: ReturnType<typeof collectGiftCatalogLookups>,
  knownById: ReadonlyMap<number, Product>,
  knownBySku: ReadonlyMap<string, Product>,
): Promise<Product[]> {
  const missingIds = lookup.productIds.filter(
    (id: number) => !knownById.has(id),
  );
  const missingSkus = lookup.skus.filter(
    (sku: string) => !knownBySku.has(sku),
  );
  const fetched: Product[] = [];

  await Promise.all([
    ...missingIds.map(async (id: number) => {
      try {
        const product = await api.products.getPublic(id);
        fetched.push(product);
      } catch {
        /* SP đã ẩn / xóa — không link */
      }
    }),
    ...missingSkus.map(async (sku: string) => {
      const product = await api.products.bySkuPublic(sku);
      if (product) fetched.push(product);
    }),
  ]);

  return fetched;
}

export function useGiftProductCatalogMap(rules: readonly ProductGiftRule[]) {
  const lookup = useMemo(() => collectGiftCatalogLookups(rules), [rules]);
  const lookupKey = useMemo(
    () =>
      [
        ...lookup.productIds.sort((a, b) => a - b),
        ...lookup.skus.sort(),
      ].join("|"),
    [lookup],
  );
  const { data: catalogProducts } = useProducts();
  const catalogSeedKey = useMemo(
    () =>
      (catalogProducts ?? [])
        .map((p) => p.id)
        .sort((a: number, b: number) => a - b)
        .join(","),
    [catalogProducts],
  );

  return useQuery({
    queryKey: ["gift-product-catalog", lookupKey, catalogSeedKey] as const,
    queryFn: async () => {
      const seeded = indexActiveProducts(catalogProducts ?? []);
      const extra = await fetchMissingGiftProducts(
        lookup,
        seeded.byId,
        seeded.bySku,
      );
      const merged = indexActiveProducts([
        ...(catalogProducts ?? []),
        ...extra,
      ]);
      return buildGiftCatalogHrefMap(rules, merged.byId, merged.bySku);
    },
    enabled: lookupKey.length > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

/** Resolver link quà theo rule — dùng chung cart page / checkout / drawer. */
export function useGiftHrefForRulesFromLines(lines: readonly CartLine[]) {
  const cartGiftRules = useMemo(
    () => lines.flatMap((line) => giftRulesForCartLine(line)),
    [lines],
  );
  const { data: giftCatalogMap } = useGiftProductCatalogMap(cartGiftRules);
  return useCallback(
    (rule: ProductGiftRule) => giftCatalogMap?.get(rule.id),
    [giftCatalogMap],
  );
}
