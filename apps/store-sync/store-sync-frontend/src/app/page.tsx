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
    <Page className="selection:bg-primary/30 scroll-smooth">
      <PageContent className={STORE_LANDING_PAGE_CONTENT_CLASS}>
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-28 md:pb-40 w-full">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 animate-in fade-in slide-in-from-left duration-700">
                <Badge variant="primary" size="lg" className="flex w-fit items-center gap-2 text-base font-bold">
                  <LiveDot /> Hệ thống nhập hàng B2B lớn nhất VN
                </Badge>
                <Heading as="h1" size="display" className="leading-tight tracking-tighter">
                  Nâng Tầm Cửa Hàng <br />
                  <span className="bg-gradient-to-r from-primary to-gradient-hero-end bg-clip-text text-transparent">
                    Với Hub B2B
                  </span>
                </Heading>
                <Text variant="muted" className="text-2xl leading-relaxed">
                  Cung cấp giải pháp nhập hàng sỉ đa dạng mặt hàng tiêu dùng từ các thương hiệu lớn với mức giá ưu đãi dành riêng cho đại lý.
                </Text>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/catalog">
                    <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 group">
                      Nhập hàng sỉ ngay
                      <ChevronRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl border-2 border-outline-variant hover:bg-muted transition-all">
                      Đăng ký Đại lý
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-8 pt-8 border-t border-border/50">
                  <div className="space-y-1">
                    <Heading as="span" size="section">10k+</Heading>
                    <Text variant="small" className="uppercase tracking-widest font-bold">Đại lý tin dùng</Text>
                  </div>
                  <div className="space-y-1">
                    <Heading as="span" size="section">{products.length || "5000"}+</Heading>
                    <Text variant="small" className="uppercase tracking-widest font-bold">Mặt hàng sỉ</Text>
                  </div>
                  <div className="space-y-1">
                    <Heading as="span" size="section">24h</Heading>
                    <Text variant="small" className="uppercase tracking-widest font-bold">Giao nhận nhanh</Text>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block animate-in fade-in slide-in-from-right duration-1000">
                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 opacity-50"></div>
                <img
                  src="/storesync_b2b_hero_banner_1778054250920.png"
                  alt="Hub B2B — nhập hàng sỉ"
                  className="relative z-10 w-full rotate-2 rounded-[2.5rem] border border-border/40 shadow-2xl transition-transform duration-700 hover:rotate-0"
                />
                <div className="animate-bounce-subtle absolute -bottom-6 -left-6 z-20 rounded-3xl border border-border bg-card p-6 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-success/10 p-3 rounded-2xl">
                      <TrendingUp className="text-success size-8" />
                    </div>
                    <div>
                      <Text variant="small" className="font-bold">Doanh thu tăng</Text>
                      <Heading as="span" size="title">+35% mỗi tháng</Heading>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* --- Flash Sale Section (data-driven) --- */}
        <section className="py-24 relative overflow-hidden w-full">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="space-y-6">
                <UiBadge variant="coupon" size="lg" shape="pill" className="flex w-fit items-center gap-2 text-base font-bold">
                  <Zap className="size-5 fill-destructive" /> Flash Sale Đại lý
                </UiBadge>
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <Heading as="h2" size="display" className="tracking-tighter uppercase leading-none">Giá Sốc Giờ Vàng</Heading>
                  <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-2 rounded-2xl border border-border/50 shadow-sm">
                    <Text as="span" variant="body" className="text-muted-foreground font-bold ml-2">Kết thúc sau:</Text>
                    <div className="flex gap-2">
                      <div className="bg-foreground text-background px-4 py-3 rounded-xl font-black text-2xl w-16 text-center">{timeLeft.hours.toString().padStart(2, '0')}</div>
                      <span className="text-3xl font-bold text-foreground self-center">:</span>
                      <div className="bg-foreground text-background px-4 py-3 rounded-xl font-black text-2xl w-16 text-center">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                      <span className="text-3xl font-bold text-foreground self-center">:</span>
                      <div className="bg-foreground text-background px-4 py-3 rounded-xl font-black text-2xl w-16 text-center">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/catalog" className="text-primary font-black text-xl flex items-center gap-2 group hover:underline mb-2">
                Xem tất cả ưu đãi <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {productsLoading ? (
              <Grid cols={4} gap={8}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[520px] rounded-3xl bg-muted/40 animate-pulse" />
                ))}
              </Grid>
            ) : flashSale.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 border border-dashed border-outline-variant rounded-2xl">
                <Package className="w-16 h-16 mx-auto text-outline-variant opacity-30 mb-4" />
                <p className="text-xl font-bold">Chưa có chương trình giảm giá</p>
                <p className="text-muted-foreground mt-1">
                  Quay lại sau để bắt deal mới nhé.
                </p>
              </div>
            ) : (
              <Grid cols={4} gap={8}>
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
        <section className="py-32 mx-0 md:mx-6 w-full md:w-[calc(100%-3rem)]">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={cn(STORE_CONTAINER_INSET_WIDE, "w-full")}>
            <div className="flex flex-col lg:flex-row gap-16 items-start min-w-0 w-full">
              <div className="w-full lg:w-[380px] flex-shrink-0 space-y-10">
                <Badge variant="primary" size="lg" className="text-base font-bold">
                  <Flame className="mr-2 size-6 fill-primary" /> Top Mua Nhiều Nhất
                </Badge>
                <Heading as="h2" size="section" className="leading-none tracking-tighter">
                  Sản phẩm <br />
                  <span className="text-primary">Bán chạy tháng 5</span>
                </Heading>
                <Text variant="lead" className="leading-relaxed">
                  Danh sách các mặt hàng đại lý nhập nhiều nhất trong tháng qua. Hàng về liên tục, cam kết date mới nhất 2026.
                </Text>
                <div className="space-y-4 pt-4">
                  {[
                    "Hàng chính hãng 100%",
                    "Mức giá khuyến mãi cạnh tranh nhất thị trường",
                    "Hỗ trợ đổi trả trong 7 ngày",
                    "Chiết khấu thêm cho đơn hàng lớn"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-success/20 p-1 rounded-full">
                        <CheckCircle2 className="size-5 text-success" />
                      </div>
                      <Text as="span" variant="body" className="font-bold">{item}</Text>
                    </div>
                  ))}
                </div>
                <Link href="/catalog">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-2xl border-2 mt-4 hover:bg-muted group">
                    Xem bảng xếp hạng
                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="flex-1 min-w-0 w-full">
                {productsLoading ? (
                  <Grid cols={2} gap={8}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-44 rounded-[2.5rem] bg-muted/40 animate-pulse" />
                    ))}
                  </Grid>
                ) : (
                  <Grid cols={2} gap={8}>
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
        <section className="py-24 overflow-hidden bg-background w-full">
          <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
            <div className="text-center mb-16 space-y-2">
              <Text variant="label" className="font-black text-primary tracking-[0.3em]">Đối tác tin cậy</Text>
              <Heading as="h3" size="title">Hợp tác cùng 100+ thương hiệu lớn</Heading>
            </div>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {["Vinamilk", "Coca-Cola", "Unilever", "Nestle", "Pepsico", "P&G", "Masan"].map((brand, i) => (
                <Text as="div" key={i} variant="lead" className="font-black tracking-tighter hover:scale-110 transition-transform cursor-default">{brand}</Text>
              ))}
            </div>
          </Container>
        </section>

        {/* --- Final CTA --- */}
        <section className="pb-32 px-4 w-full">
          <div className="max-w-7xl mx-auto bg-primary rounded-none md:rounded-[4rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-primary/30 w-full">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/hot_sale_consumer_goods_collage_1778054273471.png')] opacity-10 bg-cover bg-center"></div>
            <div className="relative z-10 space-y-10">
              <Heading as="h2" size="display" className="text-primary-foreground leading-tight tracking-tighter">
                Sẵn sàng bùng nổ doanh số <br />
                cùng Hub B2B?
              </Heading>
              <Text variant="lead" align="center" className="text-primary-foreground/90 max-w-4xl mx-auto font-medium leading-relaxed">
                Đăng ký tài khoản đại lý ngay hôm nay để nhận bảng báo giá khuyến mãi độc quyền và ưu đãi miễn phí vận chuyển cho đơn hàng đầu tiên.
              </Text>
              <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                <Link href="/register">
                  <Button size="lg" className="h-20 rounded-3xl bg-primary-foreground px-12 text-3xl font-black text-primary shadow-2xl transition-all hover:bg-primary-foreground/90 hover:scale-105 active:scale-95">
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link href="/support">
                  <Button size="lg" variant="outline" className="h-20 rounded-3xl border-2 border-primary-foreground/30 bg-transparent px-12 text-3xl font-black text-primary-foreground transition-all hover:bg-primary-foreground/10 active:scale-95">
                    Tư vấn trực tiếp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
