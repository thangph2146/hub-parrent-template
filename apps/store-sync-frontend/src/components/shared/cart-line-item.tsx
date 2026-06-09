"use client";

import { Button } from "@ui/components/button";
import { ProductUnitLabelBadge } from "@ui/components/product";
import { Minus, Package2, Plus, Trash2 } from "lucide-react";
import type { CartLine } from "@/hooks/use-cart";
import { formatVND } from "@/lib/format";
import {
  giftRulesForCartLine,
  isCartGiftRuleUnlocked,
  summarizeCartGiftRule,
} from "@/lib/cart-gift-rules";

export function cartLineMaxQty(line: CartLine): number {
  return Math.max(0, Math.floor(line.stock));
}

type CartLineItemProps = {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

/** Một dòng giỏ — layout giống danh sách sản phẩm ở trang checkout (ảnh, badge đơn vị, stepper). */
export function CartLineItem({
  line,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  const maxQty = cartLineMaxQty(line);
  const listUnit = line.listUnitPrice ?? line.unitPrice;
  const showListStrike = listUnit > line.unitPrice;
  const giftRules = giftRulesForCartLine(line);
  const productSellQty = line.quantity;

  return (
    <div className="flex flex-col items-center gap-6 p-6 transition-colors hover:bg-muted/5 sm:flex-row">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/50 bg-white p-2 shadow-sm">
        {line.image ? (
          <img
            src={line.image}
            alt={line.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Package2 className="h-10 w-10 text-outline-variant" />
        )}
      </div>
      <div className="min-w-0 flex-grow text-center sm:text-left">
        <ProductUnitLabelBadge className="mb-2 uppercase tracking-wide">
          {line.unitLabel}
          {line.isWholesale ? " · Khuyến mãi" : " · Ban đầu"}
        </ProductUnitLabelBadge>
        <h3 className="line-clamp-2 text-lg font-bold leading-tight">{line.name}</h3>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
          {showListStrike && (
            <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/80">
              {formatVND(listUnit)}
            </span>
          )}
          <span className="text-xl font-extrabold text-foreground">
            {formatVND(line.unitPrice)}
          </span>
          <span className="text-sm text-muted-foreground">
            × {line.quantity} {line.unitType}
          </span>
        </div>
        {giftRules.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {giftRules.map((rule) => {
              const unlocked = isCartGiftRuleUnlocked(
                rule,
                line,
                productSellQty,
              );
              const minQty = rule.trigger.minQty ?? 0;
              return (
                <li
                  key={rule.id}
                  className={`text-xs font-medium ${
                    unlocked ? "text-success" : "text-warning"
                  }`}
                >
                  {unlocked ? "Đủ điều kiện quà: " : "Quà tặng: "}
                  {summarizeCartGiftRule(rule)}
                  {!unlocked && minQty > 0
                    ? ` (cần thêm ${Math.max(0, minQty - line.quantity)} ${line.unitType})`
                    : null}
                  .
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-none"
            onClick={() => onQuantityChange(line.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-lg font-extrabold">
            {line.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-none"
            disabled={line.quantity >= maxQty}
            onClick={() =>
              onQuantityChange(
                maxQty > 0
                  ? Math.min(line.quantity + 1, maxQty)
                  : line.quantity,
              )
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="h-12 w-12 shrink-0 rounded-2xl text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          aria-label="Xoá sản phẩm"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
