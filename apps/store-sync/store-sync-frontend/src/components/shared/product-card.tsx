"use client";

import Link from "next/link";
import { ArrowRight, Plus, ShoppingCart, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Heading, Text } from "@ui/components/typography";
import { cn } from "@ui/lib/utils";

type ProductCardVariant = "catalog" | "flash";

type ProductCardProps = {
  variant: ProductCardVariant;
  href: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  category?: string;
  minQty?: string;
  coupon?: string;
  discountLabel?: string;
  soldText?: string;
  progressPercent?: number;
  topRightBadge?: string;
  primaryCtaLabel?: string;
  onAddToCart?: () => void;
};

export function ProductCard({
  variant,
  href,
  name,
  image,
  price,
  originalPrice,
  category,
  minQty,
  coupon,
  discountLabel,
  soldText,
  progressPercent,
  topRightBadge = "Chính hãng",
  primaryCtaLabel = "Xem chi tiết",
  onAddToCart,
}: ProductCardProps) {
  const isFlash = variant === "flash";

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-outline-variant/80 bg-background py-0 transition-all duration-300 hover:border-primary/25 hover:shadow-lg",
        isFlash && "shadow-sm",
      )}
    >
      <Link
        href={href}
        className={cn(
          "relative block bg-gradient-to-b from-white to-muted/15",
          isFlash ? "h-44 md:h-48" : "h-64 w-full",
        )}
      >
        <div className="flex h-full items-center justify-center overflow-hidden border-b border-outline-variant/20 bg-white/70">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="absolute right-2 top-2">
          <Badge variant="overlay" size="sm" className="px-2 py-0.5 text-[10px] shadow-sm">
            {topRightBadge}
          </Badge>
        </div>

        {coupon && variant === "catalog" && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl border border-warning/30 bg-warning/20 px-3 py-1.5 text-sm font-bold text-warning-foreground shadow-sm backdrop-blur-sm">
            <Tag className="size-4" />
            {coupon}
          </div>
        )}

        {discountLabel && isFlash && (
          <div className="absolute left-2 top-2 rounded-lg bg-destructive px-2 py-1 text-xs font-black text-white shadow-md">
            {discountLabel}
          </div>
        )}
      </Link>

      <CardContent
        className={cn(
          "flex flex-col",
          isFlash ? "gap-2 p-3.5 pb-2" : "h-[260px] space-y-4 p-6",
        )}
      >
        {category && (
          <div className="text-sm font-bold uppercase tracking-widest text-primary/80">
            {category}
          </div>
        )}

        <Link href={href} className="group/title">
          {isFlash ? (
            <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover/title:text-primary md:text-[15px]">
              {name}
            </p>
          ) : (
            <Heading
              as="h3"
              size="title"
              className="line-clamp-2 min-h-[4rem] leading-tight transition-colors group-hover/title:text-primary"
            >
              {name}
            </Heading>
          )}
        </Link>

        <div
          className={cn(
            "mt-auto space-y-2",
            !isFlash && "border-t border-outline-variant/30 pt-4",
          )}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {originalPrice && (
              <Text
                variant="muted"
                className={cn(
                  "shrink-0 font-medium line-through",
                  isFlash ? "text-xs" : "text-sm",
                )}
              >
                {originalPrice}
              </Text>
            )}
            {isFlash ? (
              <span className="text-lg font-black tabular-nums text-primary">
                {price}
              </span>
            ) : (
              <Heading as="span" size="title" color="primary" className="shrink-0">
                {price}
              </Heading>
            )}
          </div>

          {variant === "catalog" && minQty && (
            <div className="mt-1 flex items-center gap-1 text-base font-bold text-primary">
              <Plus className="size-4" />
              {minQty}
            </div>
          )}

          {isFlash && soldText && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                <Text as="span" variant="muted" className="truncate">
                  {soldText}
                </Text>
                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  Hot
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500 transition-[width] duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, progressPercent ?? 0))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className={isFlash ? "px-3.5 pb-3.5 pt-0" : undefined}>
        <div
          className={cn(
            "flex w-full",
            variant === "catalog" ? "items-center gap-2" : "",
          )}
        >
          <Link href={href} className={variant === "catalog" ? "flex-1" : "w-full"}>
            <Button
              size={isFlash ? "sm" : "lg"}
              className={cn(
                "w-full gap-1.5 font-bold shadow-md transition-all hover:bg-primary/90",
                isFlash
                  ? "h-9 rounded-xl text-xs md:text-sm"
                  : "h-14 rounded-2xl text-lg shadow-lg",
              )}
            >
              <ArrowRight className={isFlash ? "size-3.5" : "size-5"} />
              {primaryCtaLabel}
            </Button>
          </Link>
          {variant === "catalog" && onAddToCart && (
            <Button
              className="h-14 w-14 rounded-2xl shadow-lg transition-all hover:scale-110 hover:bg-primary/90"
              aria-label="Thêm vào giỏ"
              onClick={onAddToCart}
            >
              <ShoppingCart className="size-7" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
