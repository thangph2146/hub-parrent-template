"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Package,
  ChevronRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  Page,
  PageContent,
  Container,
  Grid,
} from "@ui/components/layout";
import {
  STORE_CONTAINER_INSET_WIDE,
  STORE_CONTAINER_MAX_DEFAULT,
  STORE_LANDING_PAGE_CONTENT_CLASS,
} from "@ui/lib/layout-shell";
import { cn } from "@ui/lib/utils";
import { Heading, Text, Badge, LiveDot } from "@ui/components/typography";
import { Badge as UiBadge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { ProductCard } from "@/components/shared/product-card";
import { ProductWideCard } from "@/components/shared/product-wide-card";
import { useCategories, useProducts } from "@/hooks/queries";
import { formatVND } from "@/lib/format";
import { hasUnitWholesalePromo } from "@workspace/api-client";
import type { Product } from "@/lib/api";
import { getProductUnits } from "@/lib/catalog-filters";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600";

/**
 * Pick the best per-unit price for the homepage cards. Giá khuyến mãi (wholesale)
 * thường được ưu tiên hiển thị cùng nhãn khớp catalog.
 */
function pickPrimaryPrice(p: Product): {
  price: number;
  original: number | null;
  label: string;
} {
  const units = getProductUnits(p);
  const wholesaleUnit = units.find((u) => hasUnitWholesalePromo(u));
  if (wholesaleUnit) {
    return {
      price: wholesaleUnit.wholesalePrice!,
      original: wholesaleUnit.retailPrice,
      label: wholesaleUnit.label,
    };
  }
  const firstUnit = units[0];
  if (firstUnit) {
    return {
      price: firstUnit.retailPrice,
      original: null,
      label: firstUnit.label,
    };
  }
  const w = Number(p.wholesalePrice);
  const r = Number(p.retailPrice);
  if (Number.isFinite(w) && w > 0 && w < r) {
    return { price: w, original: r, label: p.unit };
  }
  return {
    price: r || w || 0,
    original: null,
    label: p.unit,
  };
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 24,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: categoriesData } = useCategories(true);

  const products = useMemo(() => productsData ?? [], [productsData]);
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.slug, c.name);
    return map;
  }, [categories]);

  const flashSale = useMemo(
    () =>
      products
        .filter((p) => {
          const coupons = Array.isArray(p.coupons)
            ? p.coupons
            : typeof p.coupons === "string"
              ? (() => {
                  try {
                    const v: unknown = JSON.parse(p.coupons);
                    return Array.isArray(v) ? v : [];
                  } catch {
                    return [];
                  }
                })()
              : [];
          return (
            coupons.length > 0 ||
            getProductUnits(p).some((u) => hasUnitWholesalePromo(u))
          );
        })
        .slice(0, 4),
    [products],
  );

  const bestSellers = useMemo(
    () => [...products].sort((a, b) => b.stock - a.stock).slice(0, 4),
    [products],
  );

  return (
    <Page as="div" className="selection:bg-primary/30 scroll-smooth">
      <PageContent className={STORE_LANDING_PAGE_CONTENT_CLASS}>
        {/* --- Hero Section --- */}
        <section className="relative w-full overflow-hidden pt-8 pb-12 md:pt-12 md:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,var(--primary)/0.12,transparent)]"
          />
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="animate-in fade-in slide-in-from-left space-y-5 duration-700">
                <Badge
                  variant="primary"
                  size="sm"
                  className="flex w-fit items-center gap-1.5 font-bold"
                >
                  <LiveDot /> Hệ thống nhập hàng B2B lớn nhất VN
                </Badge>
                <Heading
                  as="h1"
                  size="section"
                  className="max-w-xl text-3xl leading-[1.15] tracking-tight md:text-4xl lg:text-[2.75rem]"
                >
                  Nâng tầm cửa hàng{" "}
                  <span className="bg-gradient-to-r from-primary to-gradient-hero-end bg-clip-text text-transparent">
                    với Hub B2B
                  </span>
                </Heading>
                <Text
                  variant="muted"
                  className="max-w-lg text-base leading-relaxed md:text-[17px]"
                >
                  Nhập hàng sỉ đa dạng mặt hàng tiêu dùng từ thương hiệu lớn — giá ưu đãi dành riêng cho đại lý.
                </Text>
                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                  <Link href="/catalog">
                    <Button
                      size="default"
                      className="group h-11 rounded-xl px-6 text-sm font-bold shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 md:h-12 md:text-base"
                    >
                      Nhập hàng sỉ ngay
                      <ChevronRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      size="default"
                      className="h-11 rounded-xl border px-6 text-sm font-bold hover:bg-muted md:h-12 md:text-base"
                    >
                      Đăng ký đại lý
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/50 pt-4">
                  {[
                    { value: "10k+", label: "Đại lý tin dùng" },
                    {
                      value: `${Math.max(products.length, 500)}+`,
                      label: "Mặt hàng sỉ",
                    },
                    { value: "24h", label: "Giao nhận nhanh" },
                  ].map((stat) => (
                    <div key={stat.label} className="min-w-[5.5rem]">
                      <p className="text-xl font-black tabular-nums text-foreground md:text-2xl">
                        {stat.value}
                      </p>
                      <Text
                        variant="small"
                        className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {stat.label}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden animate-in fade-in slide-in-from-right duration-1000 lg:block">
                <div className="absolute inset-0 scale-75 rounded-full bg-primary/15 opacity-60 blur-[80px]" />
                <img
                  src="/storesync_b2b_hero_banner_1778054250920.png"
                  alt="Hub B2B — nhập hàng sỉ"
                  className="relative z-10 w-full rounded-2xl border border-border/40 shadow-xl transition-transform duration-700 hover:rotate-0 lg:rotate-1"
                />
                <div className="animate-bounce-subtle absolute -bottom-3 -left-3 z-20 rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-success/10 p-2">
                      <TrendingUp className="size-5 text-success" />
                    </div>
                    <div>
                      <Text variant="small" className="text-xs font-bold">
                        Doanh thu tăng
                      </Text>
                      <p className="text-base font-black text-foreground">
                        +35% / tháng
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* --- Flash Sale Section (data-driven) --- */}
        <section className="relative w-full overflow-hidden border-y border-primary/10 bg-gradient-to-b from-primary/[0.06] via-background to-background py-10 md:py-14">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                <UiBadge
                  variant="coupon"
                  size="sm"
                  shape="pill"
                  className="flex w-fit items-center gap-1.5 font-bold"
                >
                  <Zap className="size-3.5 fill-destructive" /> Flash Sale Đại lý
                </UiBadge>
                <Heading
                  as="h2"
                  size="section"
                  className="uppercase leading-none tracking-tight"
                >
                  Giá sốc giờ vàng
                </Heading>
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                  <Text
                    as="span"
                    variant="small"
                    className="shrink-0 font-semibold text-muted-foreground"
                  >
                    Kết thúc
                  </Text>
                  <div className="flex items-center gap-1">
                    {[
                      timeLeft.hours,
                      timeLeft.minutes,
                      timeLeft.seconds,
                    ].map((value, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && (
                          <span className="text-sm font-bold text-muted-foreground">
                            :
                          </span>
                        )}
                        <span className="min-w-[2rem] rounded-md bg-foreground px-2 py-1 text-center text-sm font-black tabular-nums text-background">
                          {value.toString().padStart(2, "0")}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href="/catalog"
                className="group flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline md:text-base"
              >
                Xem tất cả ưu đãi
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 md:size-5" />
              </Link>
            </div>

            {productsLoading ? (
              <Grid cols={4} gap={4}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[340px] animate-pulse rounded-2xl bg-muted/40 md:h-[360px]"
                  />
                ))}
              </Grid>
            ) : flashSale.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant bg-muted/20 py-10 text-center">
                <Package className="mx-auto mb-3 size-12 text-outline-variant opacity-30" />
                <p className="text-lg font-bold">Chưa có chương trình giảm giá</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quay lại sau để bắt deal mới nhé.
                </p>
              </div>
            ) : (
              <Grid cols={4} gap={4}>
                {flashSale.map((p) => {
                  const primary = pickPrimaryPrice(p);
                  const discount =
                    primary.original != null &&
                    primary.original > primary.price
                      ? Math.round(
                          ((primary.original - primary.price) /
                            primary.original) *
                            100,
                        )
                      : null;
                  return (
                    <ProductCard
                      key={p.id}
                      variant="flash"
                      href={`/catalog/${p.id}`}
                      name={p.name}
                      image={p.images?.[0] ?? PLACEHOLDER_IMAGE}
                      originalPrice={
                        primary.original != null &&
                        primary.original > primary.price
                          ? formatVND(primary.original)
                          : undefined
                      }
                      price={formatVND(primary.price)}
                      discountLabel={discount ? `-${discount}%` : undefined}
                      soldText={`Tồn kho ${p.stock} ${p.unit}`}
                      progressPercent={Math.min(100, (p.stock / 1000) * 100)}
                      primaryCtaLabel="Xem chi tiết"
                    />
                  );
                })}
              </Grid>
            )}
          </Container>
        </section>


        {/* --- Most Purchased Section (data-driven) --- */}
        <section className="w-full py-10 md:py-14">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={cn(STORE_CONTAINER_INSET_WIDE, "w-full")}>
            <div className="flex min-w-0 w-full flex-col items-start gap-6 lg:flex-row lg:gap-8">
              <div className="w-full shrink-0 space-y-4 lg:max-w-[300px] xl:max-w-[320px]">
                <Badge variant="primary" size="sm" className="font-bold">
                  <Flame className="mr-1.5 size-4 fill-primary" /> Top mua nhiều nhất
                </Badge>
                <Heading as="h2" size="section" className="leading-tight tracking-tight">
                  Sản phẩm{" "}
                  <span className="text-primary">bán chạy tháng 5</span>
                </Heading>
                <Text variant="body" className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                  Mặt hàng đại lý nhập nhiều nhất tháng qua — hàng về liên tục, date mới 2026.
                </Text>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    "Hàng chính hãng 100%",
                    "Giá khuyến mãi cạnh tranh",
                    "Đổi trả trong 7 ngày",
                    "Chiết khấu đơn lớn",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      <Text as="span" variant="small" className="font-semibold leading-snug">
                        {item}
                      </Text>
                    </li>
                  ))}
                </ul>
                <Link href="/catalog" className="inline-block pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="group h-9 rounded-xl border px-4 text-sm font-bold hover:bg-muted"
                  >
                    Xem bảng xếp hạng
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </div>
              <div className="min-w-0 w-full flex-1">
                {productsLoading ? (
                  <Grid cols={2} gap={4}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/40 md:h-32" />
                    ))}
                  </Grid>
                ) : (
                  <Grid cols={2} gap={4}>
                    {bestSellers.map((p, idx) => {
                      const primary = pickPrimaryPrice(p);
                      const tag = ["Best Seller", "Trending", "Hot Stock", "Top Rated"][idx] ?? "Hot";
                      return (
                        <ProductWideCard
                          key={p.id}
                          productId={String(p.id)}
                          name={p.name}
                          listPrice={
                            primary.original != null &&
                            primary.original > primary.price
                              ? formatVND(primary.original)
                              : undefined
                          }
                          price={`${formatVND(primary.price)} / ${primary.label}`}
                          sold={`${p.stock.toLocaleString("vi-VN")} ${p.unit}`}
                          image={p.images?.[0] ?? PLACEHOLDER_IMAGE}
                          tag={tag}
                          category={categoryMap.get(p.category) ?? p.category}
                        />
                      );
                    })}
                  </Grid>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* --- Trust & Branding --- */}
        <section className="w-full border-y border-border/60 bg-muted/25 py-8 md:py-10">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="shrink-0 text-center md:text-left">
                <Text
                  variant="label"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                >
                  Đối tác tin cậy
                </Text>
                <Heading as="h3" size="title" className="mt-1 text-lg md:text-xl">
                  Hợp tác 100+ thương hiệu lớn
                </Heading>
              </div>
              <div className="flex w-full flex-wrap items-center justify-center gap-2 md:max-w-3xl md:justify-end lg:gap-2.5">
                {[
                  "Vinamilk",
                  "Coca-Cola",
                  "Unilever",
                  "Nestle",
                  "Pepsico",
                  "P&G",
                  "Masan",
                ].map((brand) => (
                  <span
                    key={brand}
                    className={cn(
                      "cursor-default rounded-full border border-border/70 bg-background/90 px-3 py-1.5",
                      "text-xs font-bold tracking-tight text-muted-foreground shadow-sm",
                      "transition-colors hover:border-primary/35 hover:text-foreground",
                    )}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* --- Final CTA --- */}
        <section className="w-full pb-10 md:pb-14">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="relative mx-auto w-full overflow-hidden rounded-2xl bg-primary shadow-lg shadow-primary/25 md:rounded-3xl">
              <div
                aria-hidden
                className="absolute inset-0 bg-[url('/hot_sale_consumer_goods_collage_1778054273471.png')] bg-cover bg-center opacity-[0.14]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/92 to-primary/88"
              />
              <div className="relative z-10 flex w-full flex-col items-center px-6 py-10 md:px-12 md:py-12">
                <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
                  <Heading
                    as="h2"
                    size="section"
                    align="center"
                    className="w-full text-primary-foreground leading-tight tracking-tight"
                  >
                    Sẵn sàng bùng nổ doanh số cùng Hub B2B?
                  </Heading>
                  <Text
                    variant="body"
                    align="center"
                    className="w-full text-sm leading-relaxed text-primary-foreground/90 md:text-base"
                  >
                    Đăng ký đại lý để nhận bảng giá khuyến mãi và miễn phí vận chuyển đơn đầu tiên.
                  </Text>
                  <div className="flex w-full flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
                    <Link href="/register" className="inline-flex">
                      <Button
                        size="default"
                        className="h-11 min-w-[10.5rem] rounded-xl bg-primary-foreground px-6 text-sm font-bold text-primary shadow-md transition-all hover:bg-primary-foreground/90 md:h-12 md:text-base"
                      >
                        Đăng ký ngay
                      </Button>
                    </Link>
                    <Link href="/support" className="inline-flex">
                      <Button
                        size="default"
                        variant="outline"
                        className="h-11 min-w-[10.5rem] rounded-xl border border-primary-foreground/35 bg-primary-foreground/5 px-6 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 md:h-12 md:text-base"
                      >
                        Tư vấn trực tiếp
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </PageContent>
    </Page>
  );
}
