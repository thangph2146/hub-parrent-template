"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Badge } from "@ui/components/badge";
import { Container, Page, PageContent } from "@ui/components/layout";
import { cn } from "@ui/lib/utils";
import { CatalogProductCard } from "@/components/shared/catalog-product-card";
import {
  STORE_CONTAINER_INSET,
  STORE_CONTAINER_MAX_DEFAULT,
  STORE_PAGE_CONTENT_CLASS,
  STORE_PAGE_CONTENT_EMPTY_CLASS,
} from "@ui/lib/layout-shell";
import {
  Search,
  ShoppingCart,
  Package2,
  Layers,
  FilterX,
  SlidersHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product, ProductUnitType } from "@/lib/api";
import {
  useCatalogProducts,
  useCategories,
  useCategoryUsage,
} from "@/hooks/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCart } from "@/hooks/use-cart";
import { scoreProductSearchMatch } from "@/lib/catalog-filters";
import { resolveCategoryIcon } from "@/lib/category-icons";

const PURCHASE_TYPE_OPTS = [
  { key: "ALL", label: "Tất cả (KM & ban đầu)" },
  { key: "si", label: "Có giá khuyến mãi (thùng/lốc…)" },
  { key: "le", label: "Chỉ giá ban đầu (lon/chai/gói…)" },
];

const UNIT_FILTER_OPTS = [
  { key: "ALL", label: "Tất cả đơn vị" },
  { key: "thùng", label: "Thùng" },
  { key: "can", label: "Can" },
  { key: "chai", label: "Chai/Lẻ" },
  { key: "lốc", label: "Lốc" },
  { key: "gói", label: "Gói/Lẻ" },
];

const CATALOG_PAGE_SIZE = 24;

function CatalogFilterPill({
  active,
  label,
  onClick,
  tone = "primary",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: "primary" | "secondary";
}) {
  return (
    <Badge
      render={<button type="button" onClick={onClick} />}
      variant={active ? (tone === "primary" ? "promo" : "category") : "muted"}
      size="sm"
      className="cursor-pointer"
    >
      {label}
    </Badge>
  );
}

function CatalogPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spKey = searchParams.toString();

  const { data: categoriesData } = useCategories(true);
  const { data: usageData } = useCategoryUsage();
  const cart = useCart();

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const usageMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of usageData ?? []) m.set(u.slug, u.productCount);
    return m;
  }, [usageData]);
  const totalCatalogCount = useMemo(
    () => [...usageMap.values()].reduce((a, b) => a + b, 0),
    [usageMap],
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.slug, c.name);
    return map;
  }, [categories]);

  const categoryTabs = useMemo(
    () => [
      { key: "ALL", label: "Tất cả", icon: Layers },
      ...categories.map((c) => ({
        key: c.slug,
        label: c.name,
        icon: resolveCategoryIcon(c.icon),
      })),
    ],
    [categories],
  );

  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [categoryTab, setCategoryTab] = useState(
    () => searchParams.get("cat") ?? "ALL",
  );
  const [purchaseType, setPurchaseType] = useState(
    () => searchParams.get("mode") ?? "ALL",
  );
  const [unitFilter, setUnitFilter] = useState(
    () => searchParams.get("unit") ?? "ALL",
  );
  const [page, setPage] = useState(() => {
    const n = parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  });

  const debouncedSearch = useDebouncedValue(searchTerm, 320);

  const catalogListParams = useMemo(() => {
    const purchaseMode =
      purchaseType === "si"
        ? ("si" as const)
        : purchaseType === "le"
          ? ("le" as const)
          : undefined;
    return {
      activeOnly: true as const,
      q: debouncedSearch.trim() || undefined,
      category: categoryTab !== "ALL" ? categoryTab : undefined,
      purchaseMode,
      unitType: unitFilter !== "ALL" ? unitFilter : undefined,
      page,
      limit: CATALOG_PAGE_SIZE,
    };
  }, [debouncedSearch, categoryTab, purchaseType, unitFilter, page]);

  const { data: catalogData, isLoading, error } =
    useCatalogProducts(catalogListParams);

  const filterSignature = `${debouncedSearch.trim()}|${categoryTab}|${purchaseType}|${unitFilter}`;
  const filterBaselineRef = useRef<string | null>(null);
  useEffect(() => {
    if (filterBaselineRef.current === null) {
      filterBaselineRef.current = filterSignature;
      return;
    }
    if (filterBaselineRef.current !== filterSignature) {
      filterBaselineRef.current = filterSignature;
      setPage(1);
    }
  }, [filterSignature]);

  useEffect(() => {
    const onPop = (): void => {
      const sp = new URLSearchParams(window.location.search);
      setSearchTerm(sp.get("q") ?? "");
      setCategoryTab(sp.get("cat") ?? "ALL");
      setPurchaseType(sp.get("mode") ?? "ALL");
      setUnitFilter(sp.get("unit") ?? "ALL");
      const pn = parseInt(sp.get("page") ?? "1", 10);
      setPage(Number.isFinite(pn) && pn >= 1 ? pn : 1);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    const dq = debouncedSearch.trim();
    if (dq) p.set("q", dq);
    if (categoryTab !== "ALL") p.set("cat", categoryTab);
    if (purchaseType !== "ALL") p.set("mode", purchaseType);
    if (unitFilter !== "ALL") p.set("unit", unitFilter);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    if (qs === spKey) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [
    debouncedSearch,
    categoryTab,
    purchaseType,
    unitFilter,
    page,
    pathname,
    router,
    spKey,
  ]);

  const handleAddToCart = (
    product: Product,
    unit: ProductUnitType,
    quantity: number,
  ): void => {
    const result = cart.add(product, unit, quantity);
    if (!result.ok) {
      toast.error(
        result.reason === "out_of_stock"
          ? `${unit.label} đã hết hàng hoặc vượt tồn kho`
          : "Số lượng không hợp lệ",
      );
      return;
    }
    toast.success(`Đã thêm ${result.added} ${unit.label} – ${product.name}`, {
      description: "Mở giỏ hàng để xem chi tiết",
    });
  };

  const totalProducts = catalogData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / CATALOG_PAGE_SIZE));

  useEffect(() => {
    if (catalogData == null || isLoading) return;
    const maxPage = Math.max(
      1,
      Math.ceil(catalogData.total / CATALOG_PAGE_SIZE),
    );
    if (page > maxPage) setPage(maxPage);
  }, [catalogData, isLoading, page]);

  const displayProducts = useMemo(() => {
    const items = catalogData?.items ?? [];
    const qLower = debouncedSearch.trim().toLowerCase();
    if (!qLower) return items;
    return [...items].sort(
      (a, b) =>
        scoreProductSearchMatch(b, debouncedSearch) -
        scoreProductSearchMatch(a, debouncedSearch),
    );
  }, [catalogData?.items, debouncedSearch]);

  const hasActiveFilters =
    categoryTab !== "ALL" ||
    purchaseType !== "ALL" ||
    unitFilter !== "ALL" ||
    Boolean(searchTerm.trim());

  const clearAllFilters = (): void => {
    setCategoryTab("ALL");
    setPurchaseType("ALL");
    setUnitFilter("ALL");
    setSearchTerm("");
    setPage(1);
  };

  const activeChips: { key: string; label: string; onRemove: () => void }[] =
    [];
  if (categoryTab !== "ALL") {
    activeChips.push({
      key: "cat",
      label: `DM: ${categoryMap.get(categoryTab) ?? categoryTab}`,
      onRemove: () => setCategoryTab("ALL"),
    });
  }
  if (purchaseType !== "ALL") {
    const lab =
      PURCHASE_TYPE_OPTS.find((o) => o.key === purchaseType)?.label ??
      purchaseType;
    activeChips.push({
      key: "mode",
      label: lab,
      onRemove: () => setPurchaseType("ALL"),
    });
  }
  if (unitFilter !== "ALL") {
    const lab =
      UNIT_FILTER_OPTS.find((o) => o.key === unitFilter)?.label ?? unitFilter;
    activeChips.push({
      key: "unit",
      label: lab,
      onRemove: () => setUnitFilter("ALL"),
    });
  }
  if (searchTerm.trim()) {
    activeChips.push({
      key: "q",
      label: `“${searchTerm.trim().slice(0, 24)}${searchTerm.trim().length > 24 ? "…" : ""}”`,
      onRemove: () => setSearchTerm(""),
    });
  }

  return (
    <Page>
      <PageContent className={STORE_PAGE_CONTENT_CLASS}>
        <section>
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={`${STORE_CONTAINER_INSET} space-y-6`}>
            <header className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-card shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
              <div className="border-b border-outline-variant/25 bg-gradient-to-r from-primary/[0.06] via-background to-muted/20 px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      Store catalog
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                      Danh mục sản phẩm
                    </h1>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:max-w-lg sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        aria-label="Tìm sản phẩm"
                        placeholder="SKU, tên, thương hiệu…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-xl border-outline-variant/50 bg-background pl-11 text-base shadow-sm"
                      />
                    </div>
                    <Link href="/cart" className="shrink-0">
                      <Button
                        type="button"
                        className="h-11 w-full rounded-xl px-5 font-bold sm:w-auto"
                      >
                        <ShoppingCart className="size-4" />
                        Giỏ ({cart.itemCount})
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              <aside
                className="w-full shrink-0 lg:sticky lg:top-24 lg:w-72 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto xl:w-80"
                aria-label="Bộ lọc danh mục"
              >
                <div className="space-y-4 rounded-2xl border border-outline-variant/35 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.04] sm:p-5">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Danh mục
                    </p>
                    <nav
                      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
                      role="tablist"
                      aria-label="Danh mục"
                    >
                      {categoryTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = categoryTab === tab.key;
                        const count =
                          tab.key === "ALL"
                            ? totalCatalogCount
                            : (usageMap.get(tab.key) ?? 0);
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setCategoryTab(tab.key)}
                            className={cn(
                              "flex w-full shrink-0 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all lg:px-3.5",
                              active
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-outline-variant/40 bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted/40",
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Icon className="size-4 shrink-0" aria-hidden />
                              <span className="truncate">{tab.label}</span>
                            </span>
                            <Badge
                              variant="muted"
                              size="xs"
                              className={cn(
                                "shrink-0 tabular-nums",
                                active &&
                                  "border-primary-foreground/25 bg-primary-foreground/15 text-primary-foreground",
                              )}
                            >
                              {count}
                            </Badge>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="border-t border-outline-variant/25 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <SlidersHorizontal
                        className="size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span className="text-sm font-bold text-foreground">
                        Kiểu mua
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PURCHASE_TYPE_OPTS.map((opt) => (
                        <CatalogFilterPill
                          key={opt.key}
                          active={purchaseType === opt.key}
                          label={opt.label}
                          onClick={() => setPurchaseType(opt.key)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/25 pt-4">
                    <p className="mb-3 text-sm font-bold text-foreground">
                      Đơn vị
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {UNIT_FILTER_OPTS.map((opt) => (
                        <CatalogFilterPill
                          key={opt.key}
                          active={unitFilter === opt.key}
                          label={opt.label}
                          onClick={() => setUnitFilter(opt.key)}
                          tone="secondary"
                        />
                      ))}
                    </div>
                  </div>

                  {activeChips.length > 0 ? (
                    <div className="space-y-2 border-t border-outline-variant/25 pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="muted" size="sm">
                          Đang lọc
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-muted-foreground"
                          onClick={clearAllFilters}
                        >
                          <FilterX className="size-3.5" />
                          Xóa hết
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeChips.map((c) => (
                          <Badge
                            key={c.key}
                            render={<button type="button" onClick={c.onRemove} />}
                            variant="category"
                            size="sm"
                            shape="pill"
                            className="cursor-pointer gap-1"
                          >
                            {c.label}
                            <X className="size-3" aria-hidden />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </aside>

              <div className="min-w-0 flex-1 space-y-5">
                <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/30 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Trang{" "}
                    <span className="font-bold text-foreground tabular-nums">
                      {page}
                    </span>
                    /{totalPages} —{" "}
                    <span className="font-bold text-foreground tabular-nums">
                      {displayProducts.length}
                    </span>
                    /{totalProducts} sản phẩm
                    {debouncedSearch !== searchTerm && searchTerm.trim() ? (
                      <span className="ml-2 text-xs">(đang gõ…)</span>
                    ) : null}
                  </p>
                  {hasActiveFilters && activeChips.length === 0 ? (
                    <Button
                      type="button"
                      variant="link"
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-sm font-semibold text-primary"
                    >
                      Xóa bộ lọc
                    </Button>
                  ) : null}
                </div>

                {error ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
                    <p className="text-lg font-bold text-destructive">
                      Không tải được dữ liệu sản phẩm
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {error.message}
                    </p>
                  </div>
                ) : null}

                {isLoading && !error ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-96 animate-pulse rounded-3xl bg-muted/40"
                      />
                    ))}
                  </div>
                ) : null}

                {!isLoading && !error ? (
                  <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {displayProducts.map((p) => (
                        <CatalogProductCard
                          key={p.id}
                          product={p}
                          categoryLabel={
                            categoryMap.get(p.category) ?? p.category
                          }
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>

                    {totalPages > 1 ? (
                      <nav
                        className="flex items-center justify-center gap-4 pb-2 pt-6"
                        aria-label="Phân trang danh mục"
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 shrink-0 rounded-xl"
                            disabled={page <= 1 || isLoading}
                            onClick={() => {
                              setPage((prev) => Math.max(1, prev - 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            aria-label="Trang trước"
                          >
                            <ChevronLeft className="size-5" aria-hidden />
                          </Button>
                          <span className="min-w-[5.5rem] px-2 text-center text-sm font-semibold tabular-nums">
                            {page} / {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 shrink-0 rounded-xl"
                            disabled={page >= totalPages || isLoading}
                            onClick={() => {
                              setPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              );
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            aria-label="Trang sau"
                          >
                            <ChevronRight className="size-5" aria-hidden />
                          </Button>
                        </div>
                      </nav>
                    ) : null}

                    {displayProducts.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-outline-variant bg-muted/20 px-4 py-16 text-center">
                        <Package2
                          className="mx-auto mb-4 size-16 text-outline-variant opacity-30"
                          aria-hidden
                        />
                        <p className="text-xl font-bold text-foreground sm:text-2xl">
                          Không tìm thấy sản phẩm phù hợp
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                          Thử bỏ bớt bộ lọc hoặc từ khóa ngắn hơn (SKU, tên,
                          thương hiệu).
                        </p>
                        {hasActiveFilters ? (
                          <Button
                            type="button"
                            className="mt-6 rounded-xl font-bold"
                            onClick={clearAllFilters}
                          >
                            <FilterX className="mr-2 size-4" />
                            Xóa bộ lọc
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      </PageContent>
    </Page>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <PageContent className={STORE_PAGE_CONTENT_EMPTY_CLASS}>
            <Loader2
              className="h-10 w-10 animate-spin text-primary"
              aria-label="Đang tải danh mục"
            />
          </PageContent>
        </Page>
      }
    >
      <CatalogPageInner />
    </Suspense>
  );
}

