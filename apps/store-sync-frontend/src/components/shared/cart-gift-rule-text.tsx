"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ProductGiftRule } from "@workspace/api-client";
import { describeCartGiftRuleParts } from "@/lib/cart-gift-rules";

type CartGiftRuleTextProps = {
  rule: ProductGiftRule;
  /** Link catalog khi SP quà còn trên kho; undefined = chỉ text. */
  giftHref?: string | null;
  className?: string;
  children?: ReactNode;
};

/** Mô tả rule quà — tên quà có thể bấm sang CTSP khi `giftHref` có giá trị. */
export function CartGiftRuleText({
  rule,
  giftHref,
  className,
  children,
}: CartGiftRuleTextProps) {
  const { conditionText, giftQty, giftName } = describeCartGiftRuleParts(rule);

  return (
    <span className={className}>
      {conditionText} — tặng {giftQty}{" "}
      {giftHref ? (
        <Link
          href={giftHref}
          className="font-semibold underline underline-offset-2 transition-colors hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {giftName}
        </Link>
      ) : (
        giftName
      )}
      {children}
    </span>
  );
}
