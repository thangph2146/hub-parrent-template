"use client";

import Link from "next/link";
import { ArrowRight, Package2, Sparkles, Tag } from "lucide-react";
import { ProductDiscountBadge } from "@ui/components/product";
import { Badge } from "@ui/components/badge";
import { formatProductVnd, hasUnitWholesalePromo } from "@ui/components/product";
import type { Product } from "@/lib/api";
import { getProductUnits } from "@/lib/catalog-filters";
import { unitSellingAndListPrice } from "@workspace/api-client";
import { useSuggestedProducts } from "@/hooks/queries";

type ProductSuggestionsProps = {
  productId: number;
  category: string;
};

function formatCategoryLabel(category: string) {
  return (
    category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    category
  );
}

function SuggestionCard({ product }: { product: Product }) {
  const units = getProductUnits(product);
  const unit = units[0];
  const { current, list } = unit
    ? unitSellingAndListPrice(unit, 1)
    : { current: product.retailPrice, list: null as number | null };
  const image = product.images?.[0];
  const categoryLabel = formatCategoryLabel(product.category);
  const meta = [product.brand, product.origin].filter(Boolean).join(" · ");
  const firstCoupon = product.coupons?.[0];
  const hasPromo = unit ? hasUnitWholesalePromo(unit) : false;
  const discountPercent =
    list != null && list > current
      ? Math.round(((list - current) / list) * 100)
      : 0;

  return (
    <Link
      href={`/catalog/${product.id}`}
      className="group/card flex h-full min-w-[10.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-outline-variant/35 bg-background shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg sm:min-w-[12.5rem] lg:min-w-0"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white to-muted/25">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Package2 className="size-10 text-outline-variant" aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

        {firstCoupon ? (
          <Badge
            variant="coupon"
            size="xs"
            shape="pill"
            className="absolute top-2.5 left-2.5 max-w-[72%] truncate shadow-sm"
          >
            <Tag aria-hidden />
            {firstCoupon}
          </Badge>
        ) : null}

        {hasPromo && discountPercent > 0 ? (
          <ProductDiscountBadge
            percent={discountPercent}
            className="absolute top-2.5 right-2.5 shadow-sm"
          />
        ) : (
          <Badge
            variant="overlay"
            size="xs"
            className="absolute top-2.5 right-2.5 max-w-[70%] truncate"
          >
            {categoryLabel}
          </Badge>
        )}

        <span className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 translate-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/95 px-3 py-1 text-xs font-bold text-foreground shadow-md backdrop-blur-sm">
            Xem chi tiết
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary/75">
          {categoryLabel}
        </p>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-foreground transition-colors group-hover/card:text-primary sm:text-base">
          {product.name}
        </p>

        {meta ? (
          <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
            {meta}
          </p>
        ) : null}

        <div className="mt-auto space-y-1 border-t border-outline-variant/25 pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            {list != null ? (
              <span className="text-xs font-semibold text-muted-foreground line-through sm:text-sm">
                {formatProductVnd(list)}
              </span>
            ) : null}
            <span className="text-lg font-black text-primary sm:text-xl">
              {formatProductVnd(current)}
            </span>
          </div>
          {unit ? (
            <p className="text-[11px] font-medium text-muted-foreground">
              / {unit.label}
              {hasPromo ? (
                <span className="ml-1 font-semibold text-primary">· Có KM</span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="-mx-1 flex gap-3 overflow-hidden px-1 pb-1 sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="min-w-[10.5rem] shrink-0 overflow-hidden rounded-3xl border border-outline-variant/30 sm:min-w-[12.5rem] lg:min-w-0"
        >
          <div className="aspect-square animate-pulse bg-muted/40" />
          <div className="space-y-2.5 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-muted/40" />
            <div className="h-4 animate-pulse rounded bg-muted/40" />
            <div className="h-4 w-[80%] animate-pulse rounded bg-muted/40" />
            <div className="h-6 w-24 animate-pulse rounded bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductSuggestions({
  productId,
  category,
}: ProductSuggestionsProps) {
  const { data, isLoading } = useSuggestedProducts(productId, category);
  const categoryLabel = formatCategoryLabel(category);
  const catalogHref =
    category.trim().length > 0
      ? `/catalog?cat=${encodeURIComponent(category.trim())}`
      : "/catalog";

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-card shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
      aria-labelledby="product-suggestions-heading"
    >
      <div className="border-b border-outline-variant/25 bg-gradient-to-r from-primary/[0.06] via-background to-muted/20 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              Mua kèm
            </p>
            <h2
              id="product-suggestions-heading"
              className="text-lg font-black text-foreground sm:text-xl"
            >
              Sản phẩm gợi ý
            </h2>
            <p className="text-sm text-muted-foreground">
              Cùng nhóm {categoryLabel} và các mặt hàng hay đặt chung
            </p>
          </div>

          <Link
            href={catalogHref}
            className="inline-flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Xem danh mục
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <SuggestionsSkeleton />
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            {data!.map((item) => (
              <SuggestionCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
