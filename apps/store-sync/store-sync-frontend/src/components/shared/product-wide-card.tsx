"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Text } from "@ui/components/typography";
import { Badge } from "@ui/components/badge";
import { cn } from "@ui/lib/utils";

type ProductWideCardProps = {
  productId: string;
  name: string;
  /** Giá đang bán (ưu đãi) */
  price: string;
  /** Giá ban đầu — gạch ngang khi có giá khuyến mãi thấp hơn */
  listPrice?: string;
  sold: string;
  image: string;
  tag: string;
  category?: string;
};

export function ProductWideCard({
  productId,
  name,
  price,
  listPrice,
  sold,
  image,
  tag,
  category,
}: ProductWideCardProps) {
  return (
    <Link href={`/catalog/${productId}`} className="block h-full">
      <div
        className={cn(
          "group flex h-full cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/80",
          "bg-background p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md md:gap-4 md:p-3.5",
        )}
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant/30 bg-gradient-to-b from-white to-muted/20 md:size-24">
          <img
            src={image}
            alt={name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-1 top-1 max-w-[calc(100%-0.5rem)] truncate rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary-foreground shadow-sm md:text-[10px]">
            {tag}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {category && (
            <Text
              variant="caption"
              className="truncate text-[10px] font-bold uppercase tracking-wider text-primary/80 md:text-[11px]"
            >
              {category}
            </Text>
          )}

          <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary md:text-[15px]">
            {name}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {listPrice && (
              <Text as="span" variant="muted" className="text-xs font-medium line-through">
                {listPrice}
              </Text>
            )}
            <span className="text-sm font-black tabular-nums text-primary md:text-base">
              {price}
            </span>
            <Badge variant="success" size="sm" className="h-5 px-1.5 text-[10px]">
              Bán chạy
            </Badge>
          </div>

          <Text
            variant="small"
            className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            <span className="truncate">{sold} đã nhập</span>
          </Text>
        </div>
      </div>
    </Link>
  );
}
